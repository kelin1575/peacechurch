import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import SermonCard from "@/components/SermonCard";
import { SermonGridSkeleton } from "@/components/Skeleton";
import { BreadcrumbSchema } from "@/components/JsonLd";
import { Search, Youtube, ChevronRight, TrendingUp, Clock, History } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";
const CATEGORIES = ["전체", "주일예배", "특별집회", "수요예배", "새벽기도"];
const PAGE_SIZE = 20;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "설교 말씀",
  description:
    "수원평안교회 정재광 목사님의 주일예배 설교 말씀을 카테고리별로 찾아보세요. 말씀 요약과 해석, 은혜 나눔 댓글을 제공합니다.",
  keywords: [
    "정재광목사 설교",
    "수원평안교회 설교",
    "주일예배 설교",
    "설교 말씀",
    "한국 교회 설교",
  ],
  openGraph: {
    title: "설교 말씀 | 수원평안교회 정재광 목사",
    description: "주일예배 설교 말씀 전체 목록. 카테고리 검색, 말씀 요약 및 해석 제공.",
    url: `${BASE_URL}/sermons`,
  },
  alternates: { canonical: `${BASE_URL}/sermons` },
};

type SortOption = "latest" | "popular" | "oldest";

interface SearchParams {
  category?: string;
  q?: string;
  page?: string;
  sort?: string;
}

function buildQuery(params: SearchParams) {
  const p = new URLSearchParams();
  if (params.category && params.category !== "전체") p.set("category", params.category);
  if (params.q) p.set("q", params.q);
  if (params.sort && params.sort !== "latest") p.set("sort", params.sort);
  if (params.page && params.page !== "1") p.set("page", params.page);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

async function getSermons(searchParams: SearchParams) {
  const category = searchParams.category;
  const query = searchParams.q;
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const sort = (searchParams.sort || "latest") as SortOption;

  const orderBy =
    sort === "popular"
      ? { views: "desc" as const }
      : sort === "oldest"
      ? { publishedAt: "asc" as const }
      : { publishedAt: "desc" as const };

  const where: Record<string, unknown> = {};
  if (category && category !== "전체") where.category = category;
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { summary: { contains: query } },
      { scripture: { contains: query } },
      { description: { contains: query } },
    ];
  }

  // 설교 목록 + 전체 개수 (이 쿼리는 반드시 성공해야 함)
  const [sermons, total] = await Promise.all([
    prisma.sermon.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        youtubeId: true,
        title: true,
        scripture: true,
        summary: true,
        category: true,
        publishedAt: true,
        thumbnail: true,
        views: true,
      },
    }),
    prisma.sermon.count({ where }),
  ]);

  // 카테고리별 개수 (실패해도 무방)
  let countMap: Record<string, number> = {};
  try {
    const allCategories = await prisma.sermon.findMany({
      select: { category: true },
    });
    for (const s of allCategories) {
      countMap[s.category] = (countMap[s.category] || 0) + 1;
    }
  } catch {
    // 실패 시 개수 표시 생략
  }

  return { sermons, total, page, countMap };
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "latest", label: "최신순", icon: <Clock className="w-3.5 h-3.5" /> },
  { value: "popular", label: "인기순", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { value: "oldest", label: "과거순", icon: <History className="w-3.5 h-3.5" /> },
];

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  let sermons: Awaited<ReturnType<typeof getSermons>>["sermons"] = [];
  let total = 0, page = 1;
  let countMap: Record<string, number> = {};
  try {
    ({ sermons, total, page, countMap } = await getSermons(params));
  } catch (e) {
    console.error("Sermons page DB error:", e);
  }
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const activeCategory = params.category || "전체";
  const activeSort = (params.sort || "latest") as SortOption;
  const totalCount = Object.values(countMap).reduce((a: number, b: number) => a + b, 0);

  const breadcrumbs = [
    { name: "홈", url: BASE_URL },
    { name: "설교 말씀", url: `${BASE_URL}/sermons` },
  ];

  // 페이지네이션 범위 계산
  const delta = 2;
  const rangeStart = Math.max(1, page - delta);
  const rangeEnd = Math.min(totalPages, page + delta);
  const pageNumbers: (number | "...")[] = [];
  if (rangeStart > 1) { pageNumbers.push(1); if (rangeStart > 2) pageNumbers.push("..."); }
  for (let i = rangeStart; i <= rangeEnd; i++) pageNumbers.push(i);
  if (rangeEnd < totalPages) { if (rangeEnd < totalPages - 1) pageNumbers.push("..."); pageNumbers.push(totalPages); }

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-primary-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-primary-300 text-sm mb-4" aria-label="breadcrumb">
              <a href="/" className="hover:text-white transition-colors">홈</a>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">설교 말씀</span>
            </nav>
            <div className="flex items-center gap-3 mb-2">
              <Youtube className="w-7 h-7 text-red-400" />
              <h1 className="text-3xl md:text-4xl font-bold">설교 말씀</h1>
            </div>
            <p className="text-primary-200">
              정재광 목사님의 말씀 {totalCount > 0 ? `· 총 ${totalCount}편` : ""}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <form className="flex flex-col sm:flex-row gap-3" role="search" aria-label="설교 검색">
              <label className="sr-only" htmlFor="sermon-search">설교 검색</label>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <input
                  id="sermon-search"
                  type="search"
                  name="q"
                  defaultValue={params.q}
                  placeholder="제목, 성경구절, 내용으로 검색..."
                  className="input-field pl-10 py-2.5"
                  autoComplete="off"
                />
                {/* hidden fields to preserve current filters */}
                {activeCategory !== "전체" && (
                  <input type="hidden" name="category" value={activeCategory} />
                )}
                {activeSort !== "latest" && (
                  <input type="hidden" name="sort" value={activeSort} />
                )}
              </div>
              <button type="submit" className="btn-primary text-sm px-5 py-2.5">
                <Search className="w-4 h-4" aria-hidden="true" />
                검색
              </button>
            </form>
          </div>

          {/* Category + Sort bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Categories */}
            <nav aria-label="설교 카테고리" className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
              {CATEGORIES.map((cat) => {
                const count = cat === "전체" ? totalCount : (countMap[cat] ?? 0);
                const href = `/sermons${buildQuery({ ...params, category: cat, page: "1" })}`;
                return (
                  <a
                    key={cat}
                    href={href}
                    className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === cat
                        ? "bg-primary-700 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    aria-current={activeCategory === cat ? "page" : undefined}
                  >
                    {cat}
                    {count > 0 && (
                      <span className={`text-xs ${activeCategory === cat ? "text-primary-200" : "text-gray-400"}`}>
                        {count}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Sort options */}
            <div className="flex items-center gap-1 flex-shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-4">
              {SORT_OPTIONS.map(({ value, label, icon }) => {
                const href = `/sermons${buildQuery({ ...params, sort: value, page: "1" })}`;
                return (
                  <a
                    key={value}
                    href={href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeSort === value
                        ? "bg-primary-50 text-primary-700 border border-primary-200"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {icon}
                    {label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              {params.q ? (
                <>
                  <span className="font-semibold text-primary-700">&quot;{params.q}&quot;</span>
                  {" "}검색 결과{" "}
                  <span className="font-semibold text-gray-900">{total}편</span>
                </>
              ) : (
                <>
                  총{" "}
                  <span className="font-semibold text-gray-900">{total}편</span>
                  {activeCategory !== "전체" && (
                    <span className="ml-1 text-primary-600">· {activeCategory}</span>
                  )}
                </>
              )}
            </p>
            {params.q && (
              <a
                href={`/sermons${buildQuery({ ...params, q: undefined, page: "1" })}`}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                검색 초기화
              </a>
            )}
          </div>

          {/* Sermon grid */}
          <Suspense fallback={<SermonGridSkeleton count={20} />}>
            {sermons.length > 0 ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                aria-label="설교 목록"
              >
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
                    views={sermon.views}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <Youtube className="w-16 h-16 mx-auto mb-4 opacity-30" aria-hidden="true" />
                <p className="text-lg font-medium mb-2">
                  {params.q ? "검색 결과가 없습니다" : "등록된 설교가 없습니다"}
                </p>
                <p className="text-sm mb-4">
                  {params.q
                    ? "다른 검색어로 다시 시도해보세요"
                    : "관리자 페이지에서 유튜브 동기화를 진행해 주세요"}
                </p>
                {params.q ? (
                  <a href="/sermons" className="inline-flex items-center gap-2 bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors">
                    전체 설교 보기
                  </a>
                ) : (
                  <a
                    href="https://youtube.com/channel/UC9c1llukhxYQ5nma355O-kg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <Youtube className="w-4 h-4" aria-hidden="true" />
                    유튜브 채널 보기
                  </a>
                )}
              </div>
            )}
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="페이지 이동" className="flex items-center justify-center gap-1.5 mt-10">
              {/* 이전 */}
              {page > 1 ? (
                <a
                  href={`/sermons${buildQuery({ ...params, page: String(page - 1) })}`}
                  className="px-3.5 py-2 bg-white text-gray-700 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                  aria-label="이전 페이지"
                >
                  ← 이전
                </a>
              ) : (
                <span className="px-3.5 py-2 text-gray-300 rounded-lg text-sm border border-gray-100 cursor-not-allowed">
                  ← 이전
                </span>
              )}

              {/* 페이지 번호 */}
              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">
                    …
                  </span>
                ) : (
                  <a
                    key={p}
                    href={`/sermons${buildQuery({ ...params, page: String(p) })}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-primary-700 text-white shadow-sm"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                    aria-label={`${p}페이지`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </a>
                )
              )}

              {/* 다음 */}
              {page < totalPages ? (
                <a
                  href={`/sermons${buildQuery({ ...params, page: String(page + 1) })}`}
                  className="px-3.5 py-2 bg-white text-gray-700 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                  aria-label="다음 페이지"
                >
                  다음 →
                </a>
              ) : (
                <span className="px-3.5 py-2 text-gray-300 rounded-lg text-sm border border-gray-100 cursor-not-allowed">
                  다음 →
                </span>
              )}
            </nav>
          )}

          {/* 페이지 정보 */}
          {totalPages > 1 && (
            <p className="text-center text-xs text-gray-400 mt-3">
              {page} / {totalPages} 페이지 · 총 {total}편
            </p>
          )}
        </div>
      </div>
    </>
  );
}
