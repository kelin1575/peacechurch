import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { fetchChannelVideos } from "@/lib/youtube";
import SermonCard from "@/components/SermonCard";
import { Search, Filter, Youtube } from "lucide-react";

const CATEGORIES = ["전체", "주일예배", "특별집회", "수요예배", "새벽기도"];

interface SearchParams {
  category?: string;
  q?: string;
  page?: string;
}

async function getSermons(searchParams: SearchParams) {
  const category = searchParams.category;
  const query = searchParams.q;
  const page = parseInt(searchParams.page || "1");
  const pageSize = 12;

  try {
    const where: Record<string, unknown> = {};
    if (category && category !== "전체") {
      where.category = category;
    }
    if (query) {
      where.OR = [
        { title: { contains: query } },
        { summary: { contains: query } },
        { scripture: { contains: query } },
      ];
    }

    const [sermons, total] = await Promise.all([
      prisma.sermon.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.sermon.count({ where }),
    ]);

    return { sermons, total, page, pageSize };
  } catch {
    // Fallback to YouTube data
    const { videos } = await fetchChannelVideos(12);
    const sermons = videos.map((v) => ({
      id: v.id,
      youtubeId: v.id,
      title: v.title,
      scripture: null,
      summary: v.description.slice(0, 150),
      category: "주일예배",
      publishedAt: new Date(v.publishedAt),
      thumbnail: v.thumbnail,
      description: v.description,
      interpretation: null,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    return { sermons, total: sermons.length, page: 1, pageSize: 12 };
  }
}

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { sermons, total, page, pageSize } = await getSermons(params);
  const totalPages = Math.ceil(total / pageSize);
  const activeCategory = params.category || "전체";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Youtube className="w-6 h-6 text-red-400" />
            <span className="text-primary-200 text-sm font-medium">유튜브 연동</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">설교 말씀</h1>
          <p className="text-primary-200">
            정재광 목사님의 말씀을 카테고리별로 찾아보세요
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
          <form className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="제목, 성경구절로 검색..."
                className="input-field pl-10 py-2.5"
              />
            </div>
            <button type="submit" className="btn-primary text-sm px-5 py-2.5">
              <Search className="w-4 h-4" />
              검색
            </button>
          </form>

          {/* Category tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <a
                key={cat}
                href={`/sermons${cat !== "전체" ? `?category=${encodeURIComponent(cat)}` : ""}`}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </a>
            ))}
          </div>
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            총 <span className="font-semibold text-gray-900">{total}</span>개의 말씀
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            최신순
          </div>
        </div>

        {/* Sermon grid */}
        {sermons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sermons.map((sermon) => (
              <SermonCard
                key={sermon.id}
                id={sermon.id}
                youtubeId={sermon.youtubeId}
                title={sermon.title}
                scripture={sermon.scripture}
                summary={sermon.summary}
                category={sermon.category}
                publishedAt={sermon.publishedAt}
                thumbnail={sermon.thumbnail}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Youtube className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">등록된 설교가 없습니다</p>
            <p className="text-sm">
              유튜브 채널에서 최신 말씀을 확인해보세요
            </p>
            <a
              href="https://youtube.com/channel/UC9c1llukhxYQ5nma3550-kg"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              <Youtube className="w-4 h-4" />
              유튜브 채널 보기
            </a>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/sermons?page=${p}${params.category ? `&category=${params.category}` : ""}${params.q ? `&q=${params.q}` : ""}`}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-primary-700 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
