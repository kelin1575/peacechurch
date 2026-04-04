/**
 * Netlify Scheduled Function: daily-sync
 * 매일 오전 7시 (KST) = UTC 22:00 실행
 *
 * 1. YouTube 최신 영상 동기화
 * 2. 오늘 신규 설교 영상 찾기
 * 3. Claude AI로 묵상 자동 생성
 * 4. DB에 오늘의 묵상 저장
 */

import type { Config } from "@netlify/functions";
import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── 날짜 ───────────────────────────────────────────────────────────────────

function todayKST(): Date {
  const now = new Date();
  // KST = UTC + 9
  const kstOffset = 9 * 60 * 60 * 1000;
  const kst = new Date(now.getTime() + kstOffset);
  return new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()));
}

// ─── YouTube 동기화 ──────────────────────────────────────────────────────────

const WORSHIP_GROUPS = [
  "주일2부예배", "주일1부예배", "주일3부예배", "주일예배",
  "수요예배", "금요예배", "새벽예배", "특별예배",
  "청년예배", "청소년예배", "어린이예배",
  "부흥회", "기도회", "헌신예배",
];

interface ParsedTitle {
  category: string;
  minister: string | null;
  parsedDate: Date | null;
}

function parseTitle(raw: string): ParsedTitle {
  let s = raw;

  // 날짜 추출
  let parsedDate: Date | null = null;
  const dateRe = /(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})|(\d{4})(\d{2})(\d{2})/;
  const dm = s.match(dateRe);
  if (dm) {
    const [y, mo, d] = dm[1]
      ? [parseInt(dm[1]), parseInt(dm[2]), parseInt(dm[3])]
      : [parseInt(dm[4]), parseInt(dm[5]), parseInt(dm[6])];
    parsedDate = new Date(Date.UTC(y, mo - 1, d));
    s = s.replace(dm[0], "").trim();
  }

  // 교회명 제거
  s = s.replace(/수원평안교회|평안교회/g, "").trim();

  // 예배 구분 추출
  let category = "주일예배";
  for (const g of WORSHIP_GROUPS) {
    if (s.includes(g)) {
      category = g;
      s = s.replace(g, "").trim();
      break;
    }
  }

  // 담당자 추출
  const ministerRe = /([가-힣]{2,5})\s*(목사|전도사|강도사|장로|선교사)/;
  const mm = s.match(ministerRe);
  const minister = mm ? `${mm[1]} ${mm[2]}` : null;

  return { category, minister, parsedDate };
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

async function syncYouTube(): Promise<{ synced: number; newVideos: YouTubeVideo[] }> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID || "UC9c1llukhxYQ5nma355O-kg";

  if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY_HERE") {
    console.log("[daily-sync] YouTube API key not set, skipping sync");
    return { synced: 0, newVideos: [] };
  }

  const allVideos: YouTubeVideo[] = [];
  let nextPageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: "snippet",
      channelId,
      maxResults: "50",
      order: "date",
      type: "video",
      key: apiKey,
    });
    if (nextPageToken) params.append("pageToken", nextPageToken);

    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    if (!res.ok) break;

    const data = await res.json();
    const videos: YouTubeVideo[] = (data.items ?? []).map((item: {
      id: { videoId: string };
      snippet: {
        title: string;
        description: string;
        thumbnails: { medium?: { url: string } };
        publishedAt: string;
      };
    }) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`,
      publishedAt: item.snippet.publishedAt,
    }));

    allVideos.push(...videos);
    nextPageToken = data.nextPageToken;
  } while (nextPageToken && allVideos.length < 500);

  // 신규 영상 찾기 (DB에 없는 것)
  const existingIds = new Set(
    (await prisma.sermon.findMany({ select: { youtubeId: true } })).map((s) => s.youtubeId)
  );
  const newVideos = allVideos.filter((v) => !existingIds.has(v.id));

  // DB upsert
  const results = await Promise.allSettled(
    allVideos.map((video) => {
      const parsed = parseTitle(video.title);
      return prisma.sermon.upsert({
        where: { youtubeId: video.id },
        update: {
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          category: parsed.category,
          minister: parsed.minister,
        },
        create: {
          youtubeId: video.id,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          publishedAt: parsed.parsedDate ?? new Date(video.publishedAt),
          category: parsed.category,
          minister: parsed.minister,
        },
      });
    })
  );

  const synced = results.filter((r) => r.status === "fulfilled").length;
  console.log(`[daily-sync] YouTube sync: ${synced}/${allVideos.length} synced, ${newVideos.length} new`);
  return { synced, newVideos };
}

// ─── AI 묵상 생성 ────────────────────────────────────────────────────────────

async function generateDevotional(sermon: {
  title: string;
  description: string | null;
  category: string;
  minister: string | null;
}): Promise<{ title: string; scripture: string; content: string; prayer: string }> {
  const prompt = `당신은 한국 개신교 목사님의 설교를 바탕으로 성도들을 위한 오늘의 묵상을 작성하는 신학자입니다.

아래 설교 정보를 바탕으로 오늘의 묵상을 작성해주세요.

설교 제목: ${sermon.title}
설교 카테고리: ${sermon.category}
담당자: ${sermon.minister ?? "담임목사"}
설교 설명: ${sermon.description ?? "(설명 없음)"}

다음 형식으로 JSON을 작성해주세요 (마크다운 없이 순수 JSON만):
{
  "title": "오늘의 묵상 제목 (설교 핵심을 담은 20자 이내)",
  "scripture": "핵심 성경구절 (예: 요한복음 3:16, 반드시 실제 성경구절)",
  "content": "묵상 내용 (500~700자, 설교 요약 1/3 + 신학적 해석 + 삶의 적용으로 구성)",
  "prayer": "오늘의 기도문 (150~200자, 말씀을 삶에 적용하는 내용)"
}`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // JSON 추출 (```json ... ``` 래핑 제거)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI 응답에서 JSON을 찾을 수 없습니다");

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    title: parsed.title || "오늘의 말씀 묵상",
    scripture: parsed.scripture || "",
    content: parsed.content || "",
    prayer: parsed.prayer || "",
  };
}

// ─── 메인 핸들러 ─────────────────────────────────────────────────────────────

export default async function handler() {
  const startTime = Date.now();
  console.log("[daily-sync] Starting at", new Date().toISOString());

  try {
    // 1. YouTube 동기화
    const { synced, newVideos } = await syncYouTube();

    // 2. AI 묵상 생성 여부 확인
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log("[daily-sync] ANTHROPIC_API_KEY not set, skipping devotional generation");
      return new Response(JSON.stringify({ synced, skippedDevotional: true }), { status: 200 });
    }

    // 3. 오늘의 묵상이 이미 있는지 확인
    const todayDate = todayKST();
    const tomorrow = new Date(todayDate.getTime() + 86400000);
    const existingDevotional = await prisma.devotional.findFirst({
      where: { date: { gte: todayDate, lt: tomorrow } },
    });

    if (existingDevotional) {
      console.log("[daily-sync] Today's devotional already exists, skipping");
      return new Response(JSON.stringify({ synced, devotionalSkipped: "already_exists" }), { status: 200 });
    }

    // 4. 가장 최신 설교 영상 선택
    // 신규 영상이 있으면 우선, 없으면 최근 설교 DB에서 선택
    let targetSermon: { title: string; description: string | null; category: string; minister: string | null } | null = null;

    if (newVideos.length > 0) {
      const v = newVideos[0];
      const parsed = parseTitle(v.title);
      targetSermon = {
        title: v.title,
        description: v.description,
        category: parsed.category,
        minister: parsed.minister,
      };
    } else {
      const latest = await prisma.sermon.findFirst({
        orderBy: { publishedAt: "desc" },
        select: { title: true, description: true, category: true, minister: true },
      });
      if (latest) targetSermon = latest;
    }

    if (!targetSermon) {
      console.log("[daily-sync] No sermon found for devotional generation");
      return new Response(JSON.stringify({ synced, devotionalSkipped: "no_sermon" }), { status: 200 });
    }

    // 5. AI 묵상 생성 및 저장
    console.log("[daily-sync] Generating devotional from:", targetSermon.title);
    const devotional = await generateDevotional(targetSermon);

    await prisma.devotional.create({
      data: {
        title: devotional.title,
        scripture: devotional.scripture,
        content: devotional.content,
        prayer: devotional.prayer,
        date: todayDate,
      },
    });

    const elapsed = Date.now() - startTime;
    console.log(`[daily-sync] Done in ${elapsed}ms — synced: ${synced}, devotional: "${devotional.title}"`);

    return new Response(
      JSON.stringify({
        ok: true,
        synced,
        devotionalCreated: devotional.title,
        elapsedMs: elapsed,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[daily-sync] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 매일 오전 7시 KST = UTC 22:00
export const config: Config = {
  schedule: "0 22 * * *",
};
