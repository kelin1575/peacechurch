import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { NEWS_CATEGORIES } from "@/lib/news";

export const dynamic = "force-dynamic";

function unauthorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return request.headers.get("x-admin-secret") !== secret;
}

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      take: 50,
    });
    return NextResponse.json(news);
  } catch (error) {
    console.error("News fetch error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  if (unauthorized(request)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }
  try {
    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    const category =
      typeof body?.category === "string" &&
      (NEWS_CATEGORIES as readonly string[]).includes(body.category)
        ? body.category
        : "교회소식";
    const isPinned = Boolean(body?.isPinned);

    if (!title || !content) {
      return NextResponse.json(
        { error: "제목과 내용을 모두 입력해 주세요." },
        { status: 400 }
      );
    }
    if (title.length > 120) {
      return NextResponse.json(
        { error: "제목은 120자까지 쓰실 수 있습니다." },
        { status: 400 }
      );
    }

    const created = await prisma.news.create({
      data: {
        title,
        content,
        category,
        isPinned,
        publishedAt: body?.publishedAt ? new Date(body.publishedAt) : new Date(),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("News creation error:", error);
    return NextResponse.json({ error: "저장하지 못했습니다." }, { status: 500 });
  }
}
