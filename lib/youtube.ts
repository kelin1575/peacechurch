const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || "UC9c1llukhxYQ5nma355O-kg";

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

/**
 * 채널의 영상 목록은 search.list 대신 "업로드" 재생목록(playlistItems.list)으로
 * 가져옵니다.
 *
 * search.list 를 쓰지 않는 이유:
 *  - 할당량이 호출당 100유닛으로, playlistItems.list(호출당 1유닛)보다
 *    100배 비쌉니다. 페이지를 몇 장만 넘겨도 하루 할당량(기본 10,000)을
 *    금방 소진합니다.
 *  - 더 중요한 문제로, search.list 는 채널의 전체 영상을 안정적으로 다
 *    돌려주지 않는 경우가 실제로 있습니다(색인 지연). 실제로 이 문제 때문에
 *    "동기화하면 몇 개만 들어온다" 증상이 있었습니다.
 *
 * 재생목록 기반 조회의 단점은 최신순 정렬을 서버가 지원하지 않는다는
 * 것뿐이라, 다 받아온 뒤 우리 쪽에서 publishedAt 기준으로 정렬합니다.
 */
async function getUploadsPlaylistId(): Promise<string> {
  const params = new URLSearchParams({
    part: "contentDetails",
    id: CHANNEL_ID,
    key: YOUTUBE_API_KEY!,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?${params}`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const reason = err?.error?.errors?.[0]?.reason || res.status;
    throw new Error(`YouTube channels API error: ${reason}`);
  }

  const data = await res.json();
  const uploadsId: string | undefined =
    data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsId) {
    throw new Error(
      `채널(${CHANNEL_ID})의 업로드 재생목록을 찾을 수 없습니다. YOUTUBE_CHANNEL_ID를 확인해 주세요.`
    );
  }

  return uploadsId;
}

async function fetchPlaylistPage(
  playlistId: string,
  maxResults: number,
  pageToken?: string
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    playlistId,
    maxResults: String(Math.min(maxResults, 50)),
    key: YOUTUBE_API_KEY!,
  });
  if (pageToken) params.append("pageToken", pageToken);

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?${params}`,
    { next: { revalidate: 0 } }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const reason = err?.error?.errors?.[0]?.reason || res.status;
    throw new Error(`YouTube playlistItems API error: ${reason}`);
  }

  const data = await res.json();

  const videos: YouTubeVideo[] = (data.items ?? [])
    // 삭제되었거나 비공개로 전환된 영상은 resourceId.videoId 가 없을 수 있습니다.
    .filter(
      (item: { snippet?: { resourceId?: { videoId?: string } } }) =>
        item.snippet?.resourceId?.videoId
    )
    .map(
      (item: {
        snippet: {
          resourceId: { videoId: string };
          title: string;
          description: string;
          thumbnails: { medium?: { url: string }; high?: { url: string } };
          publishedAt: string;
        };
        contentDetails?: { videoPublishedAt?: string };
      }) => {
        const videoId = item.snippet.resourceId.videoId;
        return {
          id: videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail:
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.high?.url ||
            `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
          // contentDetails.videoPublishedAt 이 실제 영상 공개 시각입니다.
          // snippet.publishedAt 은 "재생목록에 추가된 시각"이라 다를 수 있습니다.
          publishedAt: item.contentDetails?.videoPublishedAt || item.snippet.publishedAt,
        };
      }
    );

  return { videos, nextPageToken: data.nextPageToken };
}

/** 업로드 재생목록 전체(최대 maxTotal개)를 받아 최신순으로 정렬해 돌려줍니다. */
async function fetchAllFromUploadsPlaylist(maxTotal: number): Promise<YouTubeVideo[]> {
  const uploadsPlaylistId = await getUploadsPlaylistId();

  const all: YouTubeVideo[] = [];
  let nextPageToken: string | undefined;
  let pages = 0;
  const maxPages = Math.ceil(maxTotal / 50) + 1; // 무한 루프 방지용 안전장치

  do {
    const { videos, nextPageToken: token } = await fetchPlaylistPage(
      uploadsPlaylistId,
      50,
      nextPageToken
    );
    all.push(...videos);
    nextPageToken = token;
    pages++;
  } while (nextPageToken && all.length < maxTotal && pages < maxPages);

  // 재생목록은 오래된 순서로 오는 경우가 많아, 최신순으로 명시적으로 정렬합니다.
  all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return all.slice(0, maxTotal);
}

/** 최신 영상 몇 개만 필요할 때 (예: DB 동기화 전 홈 화면 폴백) */
export async function fetchChannelVideos(
  maxResults = 20
): Promise<{ videos: YouTubeVideo[] }> {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_YOUTUBE_API_KEY_HERE") {
    return { videos: getMockVideos() };
  }
  // 재생목록은 최신순 정렬을 서버가 지원하지 않으므로, 넉넉히 받아서
  // 우리 쪽에서 정렬한 뒤 앞에서 필요한 만큼만 자릅니다.
  const all = await fetchAllFromUploadsPlaylist(Math.max(maxResults, 50));
  return { videos: all.slice(0, maxResults) };
}

/** 채널의 모든 영상을 가져옵니다 (전체 동기화용) */
export async function fetchAllChannelVideos(
  maxTotal = 1000
): Promise<{ videos: YouTubeVideo[]; total: number }> {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_YOUTUBE_API_KEY_HERE") {
    const videos = getMockVideos();
    return { videos, total: videos.length };
  }

  const videos = await fetchAllFromUploadsPlaylist(maxTotal);
  return { videos, total: videos.length };
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
