import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const { id } = await params;

  const sermon = await prisma.sermon.findUnique({ where: { id } });
  if (!sermon) {
    return NextResponse.json({ error: "설교를 찾을 수 없습니다." }, { status: 404 });
  }

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
- 관련 신학자(칼뱅, 루터, 바빙크, 카이퍼 등)의 통찰 1~2개 인용 (실제 인용문 또는 요약)
- 오늘 현대 그리스도인의 삶에 구체적으로 적용할 수 있는 3가지 방법

JSON 형식으로 응답해주세요:
{
  "scripture": "본문 성경구절 (이미 있으면 그대로, 없으면 제목에서 추론)",
  "summary": "말씀 요약 내용",
  "interpretation": "신학적 해석 및 적용 내용"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "AI 응답 파싱 실패" }, { status: 500 });
    }

    const generated = JSON.parse(jsonMatch[0]) as {
      scripture?: string;
      summary?: string;
      interpretation?: string;
    };

    // DB 업데이트
    const updated = await prisma.sermon.update({
      where: { id },
      data: {
        scripture: generated.scripture || sermon.scripture,
        summary: generated.summary || sermon.summary,
        interpretation: generated.interpretation || sermon.interpretation,
      },
    });

    return NextResponse.json({
      success: true,
      scripture: updated.scripture,
      summary: updated.summary,
      interpretation: updated.interpretation,
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI 생성 실패" },
      { status: 500 }
    );
  }
}
