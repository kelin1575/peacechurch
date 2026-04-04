import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

function toUtcMidnight(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const devotional = await prisma.devotional.findUnique({ where: { id } });
    if (!devotional) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(devotional);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { title, scripture, content, prayer, date } = body;

    if (!title || !scripture || !content || !date) {
      return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
    }

    const devotional = await prisma.devotional.update({
      where: { id },
      data: {
        title,
        scripture,
        content,
        prayer: prayer || null,
        date: toUtcMidnight(date),
      },
    });
    return NextResponse.json(devotional);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "수정 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.devotional.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "삭제 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
