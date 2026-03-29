import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 설교 하나의 요약+해석 생성
async function generateForSermon(sermon: {
  id: string;
  title: string;
  description: string | null;
  scripture: string | null;
  publishedAt: Date;
  category: string;
}) {
  const prompt = `당신은 한국 개혁주의 신학에 정통한 신학자이자 설교 해설가입니다.
아래는 수원평안교회 정재광 목사님의 설교 정보입니다.

설교 제목: ${sermon.title}
설교 날짜: ${sermon.publishedAt.toLocaleDateString("ko-KR")}
카테고리: ${sermon.category}
${sermon.scripture ? `본문 성경구절: ${sermon.scripture}` : ""}
${sermon.description ? `유튜브 설명:\n${sermon.description}` : ""}

위 정보를 바탕으로 다음 두 가지를 한국어로 작성해주세요.

[말씀 요약]
- 설교의 핵심 메시지를 3~5개 문단으로 요약 (전체 내용의 약 1/5 분량)
- 본문 성경 말씀의 맥락, 핵심 교훈, 실천적 메시지를 포함
- 평신도가 이해하기 쉬운 문체로 작성

[신학적 해석 및 적용]
- 본문의 신학적 의미를 개혁주의 관점에서 해설
- 구속사적 맥락에서 이 말씀의 위치와 의미
- 관련 신학자의 통찰 포함
- 오늘 현대 그리스도인의 삶에 구체적으로 적용할 수 있는 방법

JSON 형식으로만 응답 (다른 텍스트 없이):
{
  "scripture": "본문 성경구절",
  "summary": "말씀 요약",
  "interpretation": "신학적 해석 및 적용"
}`;

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON 파싱 실패");

  return JSON.parse(jsonMatch[0]) as {
    scripture?: string;
    summary?: string;
    interpretation?: string;
  };
}

export async function POST() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  // 요약/해석이 없는 설교만 대상
  const sermons = await prisma.sermon.findMany({
    where: {
      OR: [{ summary: null }, { summary: "" }],
    },
    select: {
      id: true,
      title: true,
      description: true,
      scripture: true,
      publishedAt: true,
      category: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 20, // 한 번에 최대 20개 (API 비용 절감)
  });

  if (sermons.length === 0) {
    return NextResponse.json({ message: "요약할 설교가 없습니다.", processed: 0 });
  }

  const results = { success: 0, failed: 0, errors: [] as string[] };

  // 순차 처리 (API rate limit 방지)
  for (const sermon of sermons) {
    try {
      const generated = await generateForSermon(sermon);
      await prisma.sermon.update({
        where: { id: sermon.id },
        data: {
          scripture: generated.scripture || sermon.scripture,
          summary: generated.summary,
          interpretation: generated.interpretation,
        },
      });
      results.success++;
    } catch (err) {
      results.failed++;
      results.errors.push(`${sermon.title}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({
    processed: sermons.length,
    success: results.success,
    failed: results.failed,
    errors: results.errors,
  });
}
