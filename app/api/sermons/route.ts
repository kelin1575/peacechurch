import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Record<string, unknown> = {};
    if (category && category !== "전체") {
      where.category = category;
    }
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { summary: { contains: q } },
        { scripture: { contains: q } },
      ];
    }

    const [sermons, total] = await Promise.all([
      prisma.sermon.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          youtubeId: true,
          title: true,
          scripture: true,
          summary: true,
          category: true,
          publishedAt: true,
          thumbnail: true,
        },
      }),
      prisma.sermon.count({ where }),
    ]);

    return NextResponse.json({ sermons, total, page, limit });
  } catch (error) {
    console.error("Sermons fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { youtubeId, title, description, thumbnail, publishedAt, category, summary, interpretation, scripture } = body;

    if (!youtubeId || !title || !publishedAt) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const sermon = await prisma.sermon.upsert({
      where: { youtubeId },
      update: {
        title,
        description,
        thumbnail,
        category: category || "주일예배",
        summary,
        interpretation,
        scripture,
      },
      create: {
        youtubeId,
        title,
        description,
        thumbnail,
        publishedAt: new Date(publishedAt),
        category: category || "주일예배",
        summary,
        interpretation,
        scripture,
      },
    });

    return NextResponse.json(sermon, { status: 201 });
  } catch (error) {
    console.error("Sermon creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
