import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * 관리자용 — 기도글 숨김/복구/삭제.
 *
 * ADMIN_SECRET 환경변수를 설정해 두면 그 값을 헤더로 보내야만 동작합니다.
 * 설정하지 않으면 기존 관리자 API들과 같은 방식(무인증)으로 동작하므로,
 * 운영에서는 반드시 Vercel 환경변수에 ADMIN_SECRET을 추가해 주세요.
 */
function unauthorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return request.headers.get("x-admin-secret") !== secret;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (unauthorized(request)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await request.json();
    const status = body?.status === "hidden" ? "hidden" : "published";

    const updated = await prisma.prayerRequest.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Prayer moderation error:", error);
    return NextResponse.json({ error: "변경하지 못했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (unauthorized(request)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.prayerRequest.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Prayer delete error:", error);
    return NextResponse.json({ error: "삭제하지 못했습니다." }, { status: 500 });
  }
}
