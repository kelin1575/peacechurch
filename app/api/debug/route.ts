import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!secret || secret !== process.env.DEBUG_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
