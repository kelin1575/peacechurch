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

/**
 * 채널에서 실제로 쓰는 대괄호 태그 → 분류.
 * lib/sermonParser.ts 와 같은 규칙입니다. 이 파일은 Netlify
 * 예약 함수용으로 별도 번들되어 그쪽 모듈을 import 하지 못해 부득이
 * 복사해 둡니다 — 분류 규칙을 바꿀 때는 두 파일을 함께 고쳐야 합니다.
 */
const CATEGORY_RULES: { category: string; keywords: string[] }[] = [
  { category: "해피밀", keywords: ["해피밀"] },
  { category: "홍보영상", keywords: ["홍보영상", "소개영상", "후기영상"] },
  { category: "아동부", keywords: ["아동부"] },
  { category: "유아유치부", keywords: ["유아유치부", "유아부", "유치부"] },
  { category: "청소년부", keywords: ["청소년부", "중고등부"] },
  { category: "어와나", keywords: ["어와나", "AWANA", "Awana"] },
  { category: "미니홈피", keywords: ["미니홈피"] },
  { category: "Shorts", keywords: ["Shorts", "SHORTS", "shorts", "쇼츠"] },
  {
    category: "주일예배",
    keywords: ["주일예배", "주일1부예배", "주일2부예배", "주일3부예배", "주일1부", "주일2부", "주일3부"],
  },
];

// 대괄호 태그가 없는 예전 제목을 위한 예비 규칙 (더 구체적인 것 먼저)
const LEGACY_WORSHIP_GROUPS = [
  "주일2부예배", "주일1부예배", "주일3부예배", "주일예배",
  "수요예배", "금요예배", "새벽기도회", "새벽예배", "특별예배",
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

  // 분류 추출 — 새 대괄호 태그 방식을 먼저 시도하고, 없으면 예전 방식으로 폴백
  let category: string | null = null;
  for (const rule of CATEGORY_RULES) {
    const hit = rule.keywords.find((kw) => s.includes(kw));
    if (hit) {
      category = rule.category;
      s = s.replace(hit, "").trim();
      break;
    }
  }
  if (!category) {
    for (const g of LEGACY_WORSHIP_GROUPS) {
      if (s.includes(g)) {
        category = g.startsWith("주일") && g.endsWith("부예배") ? "주일예배" : g;
        s = s.replace(g, "").trim();
        break;
      }
    }
  }
  if (!category) category = "주일예배";

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

/**
 * 채널의 "업로드" 재생목록 ID를 가져옵니다.
 *
 * search.list 대신 이 방식을 쓰는 이유 (lib/youtube.ts 와 동일한 규칙):
 *  - search.list 는 호출당 할당량 100유닛으로, playlistItems.list(1유닛)의
 *    100배입니다.
 *  - 더 중요하게, search.list 는 채널의 전체 영상을 안정적으로 다 돌려주지
 *    못하는 색인 지연 문제가 실제로 있습니다. "동기화하면 몇 개만 들어온다"
 *    증상의 원인이 이것이었습니다.
 */
async function getUploadsPlaylistId(apiKey: string, channelId: string): Promise<string> {
  const params = new URLSearchParams({ part: "contentDetails", id: channelId, key: apiKey });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`channels.list 실패: ${err?.error?.errors?.[0]?.reason || res.status}`);
  }
  const data = await res.json();
  const uploadsId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) throw new Error(`채널(${channelId})의 업로드 재생목록을 찾을 수 없습니다.`);
  return uploadsId;
}

async function syncYouTube(): Promise<{ synced: number; newVideos: YouTubeVideo[] }> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID || "UC9c1llukhxYQ5nma355O-kg";

  if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY_HERE") {
    console.log("[daily-sync] YouTube API key not set, skipping sync");
    return { synced: 0, newVideos: [] };
  }

  const uploadsPlaylistId = await getUploadsPlaylistId(apiKey, channelId);

  const allVideos: YouTubeVideo[] = [];
  let nextPageToken: string | undefined;
  let pages = 0;

  do {
    const params = new URLSearchParams({
      part: "snippet,contentDetails",
      playlistId: uploadsPlaylistId,
      maxResults: "50",
      key: apiKey,
    });
    if (nextPageToken) params.append("pageToken", nextPageToken);

    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
    if (!res.ok) {
      // 이전엔 여기서 조용히 멈추고 지금까지 모은 것만 동기화했습니다 — 그게
      // "몇 개만 동기화된다" 증상의 또 다른 원인이었습니다. 이제는 원인을
      // 로그에 남겨 다음 실행 때 무슨 일이 있었는지 알 수 있게 합니다.
      const err = await res.json().catch(() => ({}));
      console.error(
        `[daily-sync] playlistItems.list 실패 (page ${pages + 1}): ${err?.error?.errors?.[0]?.reason || res.status} — 지금까지 모은 ${allVideos.length}개로 계속 진행합니다.`
      );
      break;
    }

    const data = await res.json();
    const videos: YouTubeVideo[] = (data.items ?? [])
      .filter((item: { snippet?: { resourceId?: { videoId?: string } } }) => item.snippet?.resourceId?.videoId)
      .map((item: {
        snippet: {
          resourceId: { videoId: string };
          title: string;
          description: string;
          thumbnails: { medium?: { url: string } };
          publishedAt: string;
        };
        contentDetails?: { videoPublishedAt?: string };
      }) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.snippet.resourceId.videoId}/mqdefault.jpg`,
        publishedAt: item.contentDetails?.videoPublishedAt || item.snippet.publishedAt,
      }));

    allVideos.push(...videos);
    nextPageToken = data.nextPageToken;
    pages++;
  } while (nextPageToken && allVideos.length < 2000 && pages < 41);

  // 재생목록은 오래된 순서로 오는 경우가 많아 최신순으로 정렬합니다.
  allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

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
