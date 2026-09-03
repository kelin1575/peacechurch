import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PRAYER_CATEGORIES } from "@/lib/prayer";

export const dynamic = "force-dynamic";

const MAX_CONTENT = 800;
const MAX_AUTHOR = 20;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const take = Math.min(100, Math.max(1, Number(searchParams.get("take")) || 30));

    const prayers = await prisma.prayerRequest.findMany({
      where: {
        status: "published",
        ...(category && category !== "전체" ? { category } : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
    });

    return NextResponse.json(prayers);
  } catch (error) {
    console.error("Prayer fetch error:", error);
    // 표가 아직 없을 수 있으므로 빈 목록으로 응답해 화면이 깨지지 않게 합니다.
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawContent: unknown = body?.content;
    const rawAuthor: unknown = body?.author;
    const rawCategory: unknown = body?.category;

    const content = typeof rawContent === "string" ? rawContent.trim() : "";
    const author =
      typeof rawAuthor === "string" && rawAuthor.trim() ? rawAuthor.trim() : "익명";
    const category =
      typeof rawCategory === "string" &&
      (PRAYER_CATEGORIES as readonly string[]).includes(rawCategory)
        ? rawCategory
        : "기타";

    if (content.length < 2) {
      return NextResponse.json(
        { error: "기도제목을 입력해 주세요." },
        { status: 400 }
      );
    }
    if (content.length > MAX_CONTENT) {
      return NextResponse.json(
        { error: `기도제목은 ${MAX_CONTENT}자까지 쓰실 수 있습니다.` },
        { status: 400 }
      );
    }
    if (author.length > MAX_AUTHOR) {
      return NextResponse.json(
        { error: `이름은 ${MAX_AUTHOR}자까지 쓰실 수 있습니다.` },
        { status: 400 }
      );
    }

    const prayer = await prisma.prayerRequest.create({
      data: { author, category, content },
    });

    return NextResponse.json(prayer, { status: 201 });
  } catch (error) {
    console.error("Prayer creation error:", error);
    return NextResponse.json(
      { error: "기도제목을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
