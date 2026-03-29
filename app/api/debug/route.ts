import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [count, sermons] = await Promise.all([
      prisma.sermon.count(),
      prisma.sermon.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, youtubeId: true, title: true, category: true, publishedAt: true, createdAt: true },
      }),
    ]);
    return NextResponse.json({ count, latest: sermons, dbOk: true });
  } catch (e) {
    return NextResponse.json({ dbOk: false, error: String(e) }, { status: 500 });
  }
}
