import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * "함께 기도합니다" — 중보에 참여한 수를 하나 올립니다.
 * 누가 눌렀는지는 저장하지 않습니다. 중보는 기록이 아니라 마음이기 때문입니다.
 * (같은 사람이 여러 번 누르는 것은 브라우저에 남긴 표시로 막습니다.)
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const updated = await prisma.prayerRequest.update({
      where: { id },
      data: { prayCount: { increment: 1 } },
      select: { id: true, prayCount: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Pray count error:", error);
    return NextResponse.json(
      { error: "기도 참여를 기록하지 못했습니다." },
      { status: 500 }
    );
  }
}
