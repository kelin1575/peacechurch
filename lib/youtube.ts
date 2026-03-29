const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || "UC9c1llukhxYQ5nma3550-kg";

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration?: string;
}

export async function fetchChannelVideos(
  maxResults = 20,
  pageToken?: string
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_YOUTUBE_API_KEY_HERE") {
    return { videos: getMockVideos() };
  }

  const params = new URLSearchParams({
    part: "snippet",
    channelId: CHANNEL_ID,
    maxResults: maxResults.toString(),
    order: "date",
    type: "video",
    key: YOUTUBE_API_KEY,
  });

  if (pageToken) {
    params.append("pageToken", pageToken);
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch YouTube videos");
  }

  const data = await response.json();

  const videos: YouTubeVideo[] = data.items.map((item: {
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      thumbnails: { medium: { url: string }; high: { url: string } };
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

  return {
    videos,
    nextPageToken: data.nextPageToken,
  };
}

function getMockVideos(): YouTubeVideo[] {
  return [
    {
      id: "dQw4w9WgXcQ",
      title: "주일예배 - 하나님의 은혜 (2024.03.10)",
      description: "오늘 말씀: 요한복음 3:16 - 하나님이 세상을 이처럼 사랑하사...",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      publishedAt: "2024-03-10T09:00:00Z",
    },
    {
      id: "9bZkp7q19f0",
      title: "주일예배 - 믿음으로 사는 삶 (2024.03.03)",
      description: "오늘 말씀: 히브리서 11:1 - 믿음은 바라는 것들의 실상이요...",
      thumbnail: "https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg",
      publishedAt: "2024-03-03T09:00:00Z",
    },
    {
      id: "kJQP7kiw5Fk",
      title: "주일예배 - 성령의 역사 (2024.02.25)",
      description: "오늘 말씀: 사도행전 2:1-4 - 오순절 날이 이미 이르매...",
      thumbnail: "https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg",
      publishedAt: "2024-02-25T09:00:00Z",
    },
    {
      id: "3tmd-ClpJxA",
      title: "주일예배 - 기도의 능력 (2024.02.18)",
      description: "오늘 말씀: 마태복음 7:7-8 - 구하라 그리하면 너희에게 주실 것이요...",
      thumbnail: "https://i.ytimg.com/vi/3tmd-ClpJxA/mqdefault.jpg",
      publishedAt: "2024-02-18T09:00:00Z",
    },
    {
      id: "QH2-TGUlwu4",
      title: "주일예배 - 하나님을 찾는 자 (2024.02.11)",
      description: "오늘 말씀: 시편 27:4 - 내가 여호와께 바라는 한 가지 일 그것을 구하리니...",
      thumbnail: "https://i.ytimg.com/vi/QH2-TGUlwu4/mqdefault.jpg",
      publishedAt: "2024-02-11T09:00:00Z",
    },
    {
      id: "e-ORhEE9VVg",
      title: "주일예배 - 부활의 소망 (2024.02.04)",
      description: "오늘 말씀: 고린도전서 15:20 - 그리스도께서 죽은 자 가운데서 다시 살아나사...",
      thumbnail: "https://i.ytimg.com/vi/e-ORhEE9VVg/mqdefault.jpg",
      publishedAt: "2024-02-04T09:00:00Z",
    },
  ];
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getYouTubeThumbnail(videoId: string, quality = "mqdefault"): string {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}
