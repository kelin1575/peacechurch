import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** 날짜 문자열(YYYY-MM-DD)을 UTC 자정 Date로 정규화 */
function toUtcMidnight(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;

    if (dateStr) {
      const from = toUtcMidnight(dateStr);
      const to = new Date(from.getTime() + 86400000); // +1일

      const devotional = await prisma.devotional.findFirst({
        where: { date: { gte: from, lt: to } },
      });
      return NextResponse.json(devotional);
    }

    const [devotionals, total] = await Promise.all([
      prisma.devotional.findMany({
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.devotional.count(),
    ]);

    return NextResponse.json({ devotionals, total, page, limit });
  } catch (error) {
    console.error("Devotionals fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, scripture, content, prayer, date } = body;

    if (!title || !scripture || !content || !date) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다 (title, scripture, content, date)" }, { status: 400 });
    }

    const utcDate = toUtcMidnight(date);

    // upsert: 같은 날짜면 업데이트, 없으면 생성
    const devotional = await prisma.devotional.upsert({
      where: { date: utcDate },
      update: { title, scripture, content, prayer: prayer || null },
      create: {
        title,
        scripture,
        content,
        prayer: prayer || null,
        date: utcDate,
      },
    });

    return NextResponse.json(devotional, { status: 200 });
  } catch (error) {
    console.error("Devotional save error:", error);
    const message = error instanceof Error ? error.message : "저장 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
