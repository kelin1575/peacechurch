import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { todayKST } from "@/lib/cron";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * 매일 자동 묵상 생성은 Netlify 예약 함수(netlify/functions/daily-sync.ts)가
 * 담당합니다. 그 함수는 ANTHROPIC_API_KEY가 없으면 콘솔에 로그만 남기고
 * 조용히 건너뛰는데, 이 로그는 Netlify 함수 로그를 직접 열어보지 않으면
 * 보이지 않습니다. Vercel과 Netlify는 환경변수를 따로 관리하므로,
 * Vercel에 키를 설정해도 Netlify 쪽이 비어 있으면 이 문제가 계속됩니다.
 *
 * 이 파일은 그렇게 빠진 날짜의 묵상을 나중에 채워 넣는 용도입니다.
 */

const TIME_BUDGET_MS = 50_000;
const LOOKBACK_DAYS = 30;

/** 최근 LOOKBACK_DAYS일 중 오늘을 제외한 날짜들 (오래된 순) */
function recentKstDates(daysBack: number): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  // 0 = 어제. 오늘은 정규 배치가 아직 처리 중일 수 있어 제외합니다.
  for (let i = daysBack; i >= 1; i--) {
    dates.push(todayKST(new Date(now.getTime() - i * 86400000)));
  }
  return dates;
}

export async function findMissingDevotionalDates(daysBack = LOOKBACK_DAYS): Promise<Date[]> {
  const candidates = recentKstDates(daysBack);
  if (candidates.length === 0) return [];

  const existing = await prisma.devotional.findMany({
    where: { date: { gte: candidates[0], lte: candidates[candidates.length - 1] } },
    select: { date: true },
  });
  const existingKeys = new Set(existing.map((d) => d.date.getTime()));

  return candidates.filter((d) => !existingKeys.has(d.getTime()));
}

interface TargetSermon {
  title: string;
  description: string | null;
  category: string;
  minister: string | null;
}

/** 지정한 날짜 시점에 "최신"이었을 설교를 고릅니다. 없으면 지금 가장 최신 설교로 대신합니다. */
async function sermonAsOf(date: Date): Promise<TargetSermon | null> {
  const endOfDay = new Date(date.getTime() + 86400000);
  const asOf = await prisma.sermon.findFirst({
    where: { publishedAt: { lt: endOfDay } },
    orderBy: { publishedAt: "desc" },
    select: { title: true, description: true, category: true, minister: true },
  });
  if (asOf) return asOf;

  return prisma.sermon.findFirst({
    orderBy: { publishedAt: "desc" },
    select: { title: true, description: true, category: true, minister: true },
  });
}

async function generateDevotionalContent(sermon: TargetSermon) {
  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `당신은 한국 개신교 목사님의 설교를 바탕으로 성도들을 위한 오늘의 묵상을 작성하는 신학자입니다.

설교 제목: ${sermon.title}
설교 카테고리: ${sermon.category}
담당자: ${sermon.minister ?? "담임목사"}
설교 설명: ${sermon.description ?? "(설명 없음)"}

다음 형식으로 JSON만 작성해주세요 (마크다운 없이):
{
  "title": "오늘의 묵상 제목 (20자 이내)",
  "scripture": "핵심 성경구절 (예: 요한복음 3:16)",
  "content": "묵상 내용 (500~700자, 설교 요약 + 신학적 해석 + 삶의 적용)",
  "prayer": "오늘의 기도문 (150~200자)"
}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
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

export interface BackfillResult {
  processed: number;
  success: number;
  failed: number;
  remaining: number;
  errors: string[];
  filled: { date: string; title: string }[];
}

/** 빠진 날짜의 묵상을 시간 예산 안에서 처리할 수 있는 만큼 채웁니다. */
export async function backfillMissingDevotionals(): Promise<BackfillResult> {
  const startedAt = Date.now();
  const missing = await findMissingDevotionalDates();

  const result: BackfillResult = {
    processed: 0,
    success: 0,
    failed: 0,
    remaining: 0,
    errors: [],
    filled: [],
  };

  for (const date of missing) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) break;
    result.processed++;

    const dateLabel = `${date.getUTCFullYear()}.${date.getUTCMonth() + 1}.${date.getUTCDate()}`;
    try {
      const sermon = await sermonAsOf(date);
      if (!sermon) {
        result.failed++;
        result.errors.push(`${dateLabel}: 기준으로 삼을 설교가 없습니다.`);
        continue;
      }

      const generated = await generateDevotionalContent(sermon);
      const devotional = await prisma.devotional.create({
        data: {
          title: generated.title,
          scripture: generated.scripture,
          content: generated.content,
          prayer: generated.prayer,
          date,
        },
      });
      result.success++;
      result.filled.push({ date: dateLabel, title: devotional.title });
    } catch (err) {
      result.failed++;
      result.errors.push(`${dateLabel}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  result.remaining = (await findMissingDevotionalDates()).length;
  return result;
}
