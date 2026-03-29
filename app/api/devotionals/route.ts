import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;

    if (dateStr) {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const devotional = await prisma.devotional.findFirst({
        where: { date: { gte: date, lt: nextDay } },
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
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const devotional = await prisma.devotional.upsert({
      where: { date: new Date(date) },
      update: { title, scripture, content, prayer },
      create: {
        title,
        scripture,
        content,
        prayer,
        date: new Date(date),
      },
    });

    return NextResponse.json(devotional, { status: 201 });
  } catch (error) {
    console.error("Devotional creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
