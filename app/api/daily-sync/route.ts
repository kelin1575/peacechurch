/**
 * POST /api/daily-sync
 * 배치 수동 실행 엔드포인트 (관리자 전용)
 * ?secret=DEBUG_SECRET 필요
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchAllChannelVideos } from "@/lib/youtube";
import { parseSermonTitle } from "@/lib/sermonParser";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function todayKST(): Date {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()));
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.DEBUG_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const log: string[] = [];

  try {
    // ── 1. YouTube 동기화 ──────────────────────────────────
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY_HERE") {
      return NextResponse.json({ error: "YOUTUBE_API_KEY 미설정" }, { status: 400 });
    }

    const { videos, total: fetchedTotal } = await fetchAllChannelVideos(1000);
    log.push(`YouTube: ${fetchedTotal}개 영상 조회`);

    const existingIds = new Set(
      (await prisma.sermon.findMany({ select: { youtubeId: true } })).map((s) => s.youtubeId)
    );
    const newVideos = videos.filter((v) => !existingIds.has(v.id));
    log.push(`신규 영상: ${newVideos.length}개`);

    const results = await Promise.allSettled(
      videos.map((video) => {
        const parsed = parseSermonTitle(video.title);
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
    log.push(`DB 동기화: ${synced}/${fetchedTotal}개 완료`);

    // ── 2. 오늘 묵상 중복 체크 ────────────────────────────
    const todayDate = todayKST();
    const tomorrow = new Date(todayDate.getTime() + 86400000);
    const existing = await prisma.devotional.findFirst({
      where: { date: { gte: todayDate, lt: tomorrow } },
    });

    if (existing) {
      log.push(`오늘의 묵상 이미 존재: "${existing.title}"`);
      return NextResponse.json({ ok: true, log, synced, devotionalSkipped: "already_exists", elapsedMs: Date.now() - startTime });
    }

    // ── 3. AI 묵상 생성 ───────────────────────────────────
    if (!process.env.ANTHROPIC_API_KEY) {
      log.push("ANTHROPIC_API_KEY 미설정 → 묵상 생성 건너뜀");
      return NextResponse.json({ ok: true, log, synced, devotionalSkipped: "no_api_key", elapsedMs: Date.now() - startTime });
    }

    // 신규 영상 우선, 없으면 최신 설교
    let targetSermon: { title: string; description: string | null; category: string; minister: string | null } | null = null;
    if (newVideos.length > 0) {
      const v = newVideos[0];
      const parsed = parseSermonTitle(v.title);
      targetSermon = { title: v.title, description: v.description, category: parsed.category, minister: parsed.minister ?? null };
      log.push(`묵상 기준 영상 (신규): ${v.title}`);
    } else {
      targetSermon = await prisma.sermon.findFirst({
        orderBy: { publishedAt: "desc" },
        select: { title: true, description: true, category: true, minister: true },
      });
      if (targetSermon) log.push(`묵상 기준 영상 (최신): ${targetSermon.title}`);
    }

    if (!targetSermon) {
      log.push("설교 없음 → 묵상 생성 불가");
      return NextResponse.json({ ok: true, log, synced, devotionalSkipped: "no_sermon", elapsedMs: Date.now() - startTime });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1500,
      messages: [{
        role: "user",
        content: `당신은 한국 개신교 목사님의 설교를 바탕으로 성도들을 위한 오늘의 묵상을 작성하는 신학자입니다.

설교 제목: ${targetSermon.title}
설교 카테고리: ${targetSermon.category}
담당자: ${targetSermon.minister ?? "담임목사"}
설교 설명: ${targetSermon.description ?? "(설명 없음)"}

다음 형식으로 JSON만 작성해주세요 (마크다운 없이):
{
  "title": "오늘의 묵상 제목 (20자 이내)",
  "scripture": "핵심 성경구절 (예: 요한복음 3:16)",
  "content": "묵상 내용 (500~700자, 설교 요약 + 신학적 해석 + 삶의 적용)",
  "prayer": "오늘의 기도문 (150~200자)"
}`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI 응답에서 JSON 파싱 실패");

    const generated = JSON.parse(jsonMatch[0]);

    const devotional = await prisma.devotional.create({
      data: {
        title: generated.title,
        scripture: generated.scripture,
        content: generated.content,
        prayer: generated.prayer,
        date: todayDate,
      },
    });

    log.push(`묵상 생성 완료: "${devotional.title}"`);

    return NextResponse.json({
      ok: true,
      log,
      synced,
      devotionalCreated: { id: devotional.id, title: devotional.title },
      elapsedMs: Date.now() - startTime,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    log.push(`오류: ${msg}`);
    return NextResponse.json({ ok: false, log, error: msg }, { status: 500 });
  }
}
