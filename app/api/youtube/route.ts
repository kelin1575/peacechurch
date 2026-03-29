import { NextRequest, NextResponse } from "next/server";
import { fetchChannelVideos } from "@/lib/youtube";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get("maxResults") || "20");
    const pageToken = searchParams.get("pageToken") || undefined;

    const { videos, nextPageToken } = await fetchChannelVideos(maxResults, pageToken);
    return NextResponse.json({ videos, nextPageToken });
  } catch (error) {
    console.error("YouTube fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

// Sync YouTube videos to database
export async function POST() {
  try {
    const { videos } = await fetchChannelVideos(50);

    if (videos.length === 0) {
      return NextResponse.json(
        { error: "YouTube API 키 또는 채널 ID를 확인해 주세요. 가져온 영상이 없습니다." },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(
      videos.map((video) =>
        prisma.sermon.upsert({
          where: { youtubeId: video.id },
          update: {
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnail,
          },
          create: {
            youtubeId: video.id,
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnail,
            publishedAt: new Date(video.publishedAt),
            category: "주일예배",
          },
        })
      )
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.error("Some sermons failed to sync:", failed);
    }

    return NextResponse.json({ synced: succeeded, total: videos.length });
  } catch (error) {
    console.error("YouTube sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "동기화 실패" },
      { status: 500 }
    );
  }
}
