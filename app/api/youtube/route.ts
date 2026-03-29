import { NextRequest, NextResponse } from "next/server";
import { fetchChannelVideos, fetchAllChannelVideos } from "@/lib/youtube";
import { parseSermonTitle } from "@/lib/sermonParser";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // 디버그: GET ?debug=1
  if (searchParams.get("debug") === "1") {
    return debugYouTubeApi();
  }

  try {
    const maxResults = parseInt(searchParams.get("maxResults") || "20");
    const pageToken = searchParams.get("pageToken") || undefined;
    const { videos, nextPageToken } = await fetchChannelVideos(maxResults, pageToken);
    return NextResponse.json({ videos, nextPageToken });
  } catch (error) {
    console.error("YouTube fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

// YouTube API 원시 응답 디버그
async function debugYouTubeApi() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID || "UC9c1llukhxYQ5nma355O-kg";

  if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY_HERE") {
    return NextResponse.json({ status: "mock_mode", channelId });
  }

  const params = new URLSearchParams({
    part: "snippet", channelId, maxResults: "5",
    order: "date", type: "video", key: apiKey,
  });
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    const data = await res.json();
    return NextResponse.json({
      status: res.ok ? "ok" : "error",
      httpStatus: res.status,
      channelId,
      apiKeyPrefix: apiKey.slice(0, 8) + "...",
      youtubeResponse: data,
    });
  } catch (e) {
    return NextResponse.json({ status: "fetch_failed", error: String(e) });
  }
}

// 전체 동기화 (모든 영상 페이지네이션)
export async function POST() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID || "UC9c1llukhxYQ5nma355O-kg";

    if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY_HERE") {
      return NextResponse.json(
        { error: "YOUTUBE_API_KEY 환경변수가 설정되지 않았습니다." },
        { status: 400 }
      );
    }

    // 전체 영상 페이지네이션으로 가져오기
    const { videos, total: fetchedTotal } = await fetchAllChannelVideos(1000);

    if (videos.length === 0) {
      return NextResponse.json(
        {
          error: `채널(${channelId})에서 영상을 가져오지 못했습니다. YOUTUBE_CHANNEL_ID를 확인해 주세요.`,
          debug: { channelId },
        },
        { status: 400 }
      );
    }

    // 타이틀 파싱 후 DB upsert
    const results = await Promise.allSettled(
      videos.map((video) => {
        const parsed = parseSermonTitle(video.title);
        return prisma.sermon.upsert({
          where: { youtubeId: video.id },
          update: {
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnail,
            category: parsed.category,
            minister: parsed.minister,
          },
          create: {
            youtubeId: video.id,
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnail,
            publishedAt: parsed.parsedDate ?? new Date(video.publishedAt),
            category: parsed.category,
            minister: parsed.minister,
          },
        });
      })
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.error("Sync partial failures:", failed.slice(0, 3));
    }

    return NextResponse.json({
      synced: succeeded,
      total: fetchedTotal,
      failed: failed.length,
    });
  } catch (error) {
    console.error("YouTube sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "동기화 실패" },
      { status: 500 }
    );
  }
}
