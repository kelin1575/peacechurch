import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { BookOpen, Calendar, ChevronRight } from "lucide-react";
import { BreadcrumbSchema } from "@/components/JsonLd";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";
const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "묵상 전체 보기",
  description: "수원평안교회 정재광 목사님의 매일 묵상을 날짜별로 모두 찾아보세요.",
  alternates: { canonical: `${BASE_URL}/devotional/archive` },
};

function toDateParam(date: Date): string {
  return date.toISOString().split("T")[0];
}

async function getDevotionals(page: number) {
  try {
    const [items, total] = await Promise.all([
      prisma.devotional.findMany({
        orderBy: { date: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: { id: true, title: true, scripture: true, date: true },
      }),
      prisma.devotional.count(),
    ]);
    return { items, total };
  } catch {
    return { items: [], total: 0 };
  }
}

export default async function DevotionalArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1"));

  const { items, total } = await getDevotionals(page);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const delta = 2;
  const rangeStart = Math.max(1, page - delta);
  const rangeEnd = Math.min(totalPages, page + delta);
  const pageNumbers: (number | "...")[] = [];
  if (rangeStart > 1) {
    pageNumbers.push(1);
    if (rangeStart > 2) pageNumbers.push("...");
  }
  for (let i = rangeStart; i <= rangeEnd; i++) pageNumbers.push(i);
  if (rangeEnd < totalPages) {
    if (rangeEnd < totalPages - 1) pageNumbers.push("...");
    pageNumbers.push(totalPages);
  }

  const breadcrumbs = [
    { name: "홈", url: BASE_URL },
    { name: "매일 묵상", url: `${BASE_URL}/devotional` },
    { name: "전체 보기", url: `${BASE_URL}/devotional/archive` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-olive-900 via-olive-800 to-olive-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav aria-label="breadcrumb" className="flex items-center gap-2 text-olive-300 text-sm mb-4">
              <Link href="/" className="hover:text-white transition-colors">홈</Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <Link href="/devotional" className="hover:text-white transition-colors">매일 묵상</Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <span className="text-white">전체 보기</span>
            </nav>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-olive-300" aria-hidden="true" />
              <h1 className="text-3xl md:text-4xl font-bold">묵상 전체 보기</h1>
            </div>
            <p className="text-olive-200">총 {total}개의 묵상</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {items.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
              {items.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/devotional?date=${toDateParam(d.date)}`}
                    className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-olive-300 hover:shadow-md transition-all h-full"
                  >
                    <p className="text-xs text-gray-400 mb-1.5">{formatDate(d.date)}</p>
                    <p className="text-sm text-olive-600 font-medium mb-1">{d.scripture}</p>
                    <p className="font-semibold text-gray-900 line-clamp-2">{d.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" aria-hidden="true" />
              <p>등록된 묵상이 없습니다.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="페이지 이동" className="flex items-center justify-center gap-1.5 mt-10">
              {page > 1 ? (
                <Link
                  href={`/devotional/archive?page=${page - 1}`}
                  className="px-3.5 py-2 bg-white text-gray-700 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                  aria-label="이전 페이지"
                >
                  ← 이전
                </Link>
              ) : (
                <span className="px-3.5 py-2 text-gray-300 rounded-lg text-sm border border-gray-100 cursor-not-allowed">
                  ← 이전
                </span>
              )}

              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">
                    …
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={`/devotional/archive?page=${p}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-olive-700 text-white shadow-sm"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                    aria-label={`${p}페이지`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </Link>
                )
              )}

              {page < totalPages ? (
                <Link
                  href={`/devotional/archive?page=${page + 1}`}
                  className="px-3.5 py-2 bg-white text-gray-700 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                  aria-label="다음 페이지"
                >
                  다음 →
                </Link>
              ) : (
                <span className="px-3.5 py-2 text-gray-300 rounded-lg text-sm border border-gray-100 cursor-not-allowed">
                  다음 →
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
