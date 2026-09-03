import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function unauthorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return request.headers.get("x-admin-secret") !== secret;
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (unauthorized(request)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.news.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("News delete error:", error);
    return NextResponse.json({ error: "삭제하지 못했습니다." }, { status: 500 });
  }
}
