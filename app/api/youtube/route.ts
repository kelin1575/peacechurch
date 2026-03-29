import { NextRequest, NextResponse } from "next/server";
import { fetchChannelVideos } from "@/lib/youtube";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // 디버그 모드: ?debug=1 로 YouTube API 원시 응답 확인
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

// YouTube API 원시 응답 디버그 (GET ?debug=1)
async function debugYouTubeApi() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID || "UC9c1llukhxYQ5nma355O-kg";

  if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY_HERE") {
    return NextResponse.json({
      status: "mock_mode",
      message: "YOUTUBE_API_KEY 환경변수가 설정되지 않았습니다. 목업 데이터를 사용합니다.",
      channelId,
    });
  }

  const params = new URLSearchParams({
    part: "snippet",
    channelId,
    maxResults: "5",
    order: "date",
    type: "video",
    key: apiKey,
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
    return NextResponse.json({
      status: "fetch_failed",
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

// Sync YouTube videos to database
export async function POST() {
  try {
    const { videos, error: fetchError } = await fetchChannelVideosSafe(50);

    if (fetchError) {
      return NextResponse.json({ error: fetchError }, { status: 500 });
    }

    if (videos.length === 0) {
      const apiKey = process.env.YOUTUBE_API_KEY;
      const channelId = process.env.YOUTUBE_CHANNEL_ID || "UC9c1llukhxYQ5nma355O-kg";
      return NextResponse.json(
        {
          error: `채널(${channelId})에서 영상을 가져오지 못했습니다. Vercel 환경변수에 YOUTUBE_API_KEY와 YOUTUBE_CHANNEL_ID가 올바르게 설정되어 있는지 확인해 주세요.`,
          debug: {
            apiKeySet: !!(apiKey && apiKey !== "YOUR_YOUTUBE_API_KEY_HERE"),
            channelId,
          },
        },
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

// fetchChannelVideos wrapper that catches and reports YouTube API errors
async function fetchChannelVideosSafe(maxResults: number) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID || "UC9c1llukhxYQ5nma355O-kg";

  // API 키 없으면 목업 (로컬 개발용)
  if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY_HERE") {
    const { videos } = await fetchChannelVideos(maxResults);
    return { videos, error: null };
  }

  const params = new URLSearchParams({
    part: "snippet",
    channelId,
    maxResults: maxResults.toString(),
    order: "date",
    type: "video",
    key: apiKey,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
    next: { revalidate: 0 },
  });

  const data = await res.json();

  // YouTube API 오류 응답 처리
  if (!res.ok || data.error) {
    const ytError = data.error;
    const reason = ytError?.errors?.[0]?.reason || "";
    const message = ytError?.message || `HTTP ${res.status}`;

    let userMessage = `YouTube API 오류: ${message}`;
    if (reason === "quotaExceeded") {
      userMessage = "YouTube API 일일 할당량(quota)이 초과되었습니다. 내일 다시 시도해 주세요.";
    } else if (reason === "keyInvalid" || res.status === 403) {
      userMessage = "YouTube API 키가 유효하지 않거나 YouTube Data API v3가 활성화되지 않았습니다.";
    } else if (res.status === 400) {
      userMessage = `채널 ID(${channelId})가 잘못되었습니다. Vercel 환경변수 YOUTUBE_CHANNEL_ID를 확인해 주세요.`;
    }

    console.error("YouTube API error:", data.error);
    return { videos: [], error: userMessage };
  }

  const items: YouTubeSearchItem[] = data.items || [];
  const videos = items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail:
      item.snippet.thumbnails?.medium?.url ||
      item.snippet.thumbnails?.high?.url ||
      `https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`,
    publishedAt: item.snippet.publishedAt,
  }));

  return { videos, error: null };
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: { medium?: { url: string }; high?: { url: string } };
    publishedAt: string;
  };
}
