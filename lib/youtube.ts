const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || "UC9c1llukhxYQ5nma355O-kg";

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

/** 단일 페이지 fetch (기존 호환용) */
export async function fetchChannelVideos(
  maxResults = 20,
  pageToken?: string
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_YOUTUBE_API_KEY_HERE") {
    return { videos: getMockVideos() };
  }
  return fetchPage(maxResults, pageToken);
}

/** 채널의 모든 영상을 페이지네이션으로 가져옴 (최대 maxTotal개) */
export async function fetchAllChannelVideos(
  maxTotal = 1000
): Promise<{ videos: YouTubeVideo[]; total: number }> {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_YOUTUBE_API_KEY_HERE") {
    const videos = getMockVideos();
    return { videos, total: videos.length };
  }

  const all: YouTubeVideo[] = [];
  let nextPageToken: string | undefined;

  do {
    const { videos, nextPageToken: token } = await fetchPage(50, nextPageToken);
    all.push(...videos);
    nextPageToken = token;
  } while (nextPageToken && all.length < maxTotal);

  return { videos: all, total: all.length };
}

async function fetchPage(
  maxResults: number,
  pageToken?: string
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
  const params = new URLSearchParams({
    part: "snippet",
    channelId: CHANNEL_ID,
    maxResults: String(Math.min(maxResults, 50)),
    order: "date",
    type: "video",
    key: YOUTUBE_API_KEY!,
  });
  if (pageToken) params.append("pageToken", pageToken);

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
    { next: { revalidate: 0 } }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const reason = err?.error?.errors?.[0]?.reason || res.status;
    throw new Error(`YouTube API error: ${reason}`);
  }

  const data = await res.json();

  const videos: YouTubeVideo[] = (data.items ?? []).map((item: {
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      thumbnails: { medium?: { url: string }; high?: { url: string } };
      publishedAt: string;
    };
  }) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail:
      item.snippet.thumbnails?.medium?.url ||
      item.snippet.thumbnails?.high?.url ||
      `https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`,
    publishedAt: item.snippet.publishedAt,
  }));

  return { videos, nextPageToken: data.nextPageToken };
}

function getMockVideos(): YouTubeVideo[] {
  return [
    {
      id: "dQw4w9WgXcQ",
      title: "2024.03.10 주일2부예배 수원평안교회 하나님의 은혜 정재광목사",
      description: "오늘 말씀: 요한복음 3:16",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      publishedAt: "2024-03-10T09:00:00Z",
    },
    {
      id: "9bZkp7q19f0",
      title: "2024.03.03 수요예배 수원평안교회 믿음으로 사는 삶 정재광목사",
      description: "오늘 말씀: 히브리서 11:1",
      thumbnail: "https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg",
      publishedAt: "2024-03-03T09:00:00Z",
    },
    {
      id: "kJQP7kiw5Fk",
      title: "2024.02.25 주일1부예배 수원평안교회 성령의 역사 이름전도사",
      description: "오늘 말씀: 사도행전 2:1-4",
      thumbnail: "https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg",
      publishedAt: "2024-02-25T09:00:00Z",
    },
  ];
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getYouTubeThumbnail(videoId: string, quality = "mqdefault"): string {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}
