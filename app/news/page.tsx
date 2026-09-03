import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Megaphone, Pin, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";
import { BreadcrumbSchema } from "@/components/JsonLd";
import { newsCategoryStyle } from "@/lib/news";
import { formatDate } from "@/lib/utils";
import { CHURCH, SUNDAY_SERVICES, WEEKDAY_SERVICES } from "@/lib/church";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";

export const metadata: Metadata = {
  title: "평안소식",
  description:
    "수원평안교회 교회 소식, 행사 안내, 선교 소식과 주간 광고를 전해드립니다.",
  keywords: [
    "수원평안교회 소식",
    "교회 공지",
    "교회 행사",
    "선교 소식",
    "주보",
    "평안소식",
  ],
  openGraph: {
    title: "평안소식 | 수원평안교회",
    description: "교회 소식, 행사 안내, 선교 소식을 전해드립니다.",
    url: `${BASE_URL}/news`,
  },
  alternates: { canonical: `${BASE_URL}/news` },
};

interface NewsRow {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  publishedAt: Date;
  imageUrl: string | null;
  sourceUrl: string | null;
}

async function getNews(): Promise<{ items: NewsRow[]; dbReady: boolean }> {
  try {
    const items = await prisma.news.findMany({
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      take: 50,
    });
    return { items, dbReady: true };
  } catch {
    return { items: [], dbReady: false };
  }
}

export default async function NewsPage() {
  const { items, dbReady } = await getNews();

  const breadcrumbs = [
    { name: "홈", url: BASE_URL },
    { name: "평안소식", url: `${BASE_URL}/news` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white">
          <div className="container-page py-14">
            <nav
              aria-label="breadcrumb"
              className="flex items-center gap-2 text-primary-200 text-sm mb-4"
            >
              <Link href="/" className="hover:text-white transition-colors">
                홈
              </Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <span className="text-white">평안소식</span>
            </nav>

            <div className="flex items-center gap-3 mb-3">
              <Megaphone className="w-7 h-7 text-gold-300" aria-hidden="true" />
              <h1 className="text-3xl md:text-4xl font-bold">평안소식</h1>
            </div>
            <p className="text-primary-200 max-w-2xl leading-relaxed">
              교회의 소식과 행사, 선교 이야기를 나눕니다.
              &ldquo;그리스도의 말씀이 너희 속에 풍성히 거하여&rdquo; (골로새서 3:16)
            </p>
          </div>
        </section>

        <div className="container-page py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 소식 목록 */}
            <div className="lg:col-span-2">
              {!dbReady ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                  <Megaphone
                    className="w-12 h-12 mx-auto mb-4 text-gray-300"
                    aria-hidden="true"
                  />
                  <p className="font-semibold text-gray-700 mb-1">
                    소식 게시판을 준비하고 있습니다
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
                    곧 교회 소식을 이곳에서 전해드리겠습니다.
                    그동안은 주보와 주일 광고로 안내드립니다.
                  </p>
                </div>
              ) : items.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                  <Megaphone
                    className="w-12 h-12 mx-auto mb-4 text-gray-300"
                    aria-hidden="true"
                  />
                  <p className="font-semibold text-gray-700 mb-1">
                    아직 등록된 소식이 없습니다
                  </p>
                  <p className="text-sm text-gray-500">
                    새로운 소식이 있으면 이곳에 올려드리겠습니다.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4" role="list">
                  {items.map((n) => (
                    <li
                      key={n.id}
                      className={
                        n.isPinned
                          ? "bg-white rounded-2xl border-2 border-primary-200 p-6 shadow-soft"
                          : "bg-white rounded-2xl border border-gray-200 p-6"
                      }
                    >
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {n.isPinned && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700">
                            <Pin className="w-3.5 h-3.5" aria-hidden="true" />
                            중요
                          </span>
                        )}
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${newsCategoryStyle(
                            n.category
                          )}`}
                        >
                          {n.category}
                        </span>
                        <time
                          dateTime={n.publishedAt.toISOString()}
                          className="text-xs text-gray-400"
                        >
                          {formatDate(n.publishedAt)}
                        </time>
                      </div>

                      <h2 className="text-lg font-bold text-gray-900 mb-2">
                        {n.title}
                      </h2>
                      <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-[15px]">
                        {n.content}
                      </div>

                      {/* 주보 이미지 — 원본 비율 그대로, 눌러서 크게 볼 수 있게 */}
                      {n.imageUrl && (
                        <a
                          href={n.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 block rounded-xl overflow-hidden border border-gray-200 bg-gray-50 hover:border-primary-300 transition-colors group"
                        >
                          <Image
                            src={n.imageUrl}
                            alt={`${n.title} 주보 이미지`}
                            width={1200}
                            height={1700}
                            sizes="(max-width: 768px) 100vw, 700px"
                            className="w-full h-auto"
                          />
                          <span className="block px-4 py-2.5 text-xs text-gray-500 bg-white border-t border-gray-100 group-hover:text-primary-700 transition-colors">
                            주보 이미지 · 눌러서 원본 크기로 보기
                          </span>
                        </a>
                      )}

                      {n.sourceUrl && (
                        <a
                          href={n.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-sm text-primary-700 font-medium hover:underline"
                        >
                          교회 홈페이지에서 원문 보기 →
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 사이드바 — 소식이 비어 있어도 페이지가 쓸모 있도록 예배 안내를 함께 둡니다 */}
            <aside className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary-700" aria-hidden="true" />
                  <h2 className="font-semibold text-gray-900">이번 주 예배</h2>
                </div>
                <ul className="space-y-2.5" role="list">
                  {[...SUNDAY_SERVICES, ...WEEKDAY_SERVICES].map((s) => (
                    <li
                      key={s.name}
                      className="flex items-baseline justify-between gap-3 text-sm"
                    >
                      <span className="text-gray-700">{s.name}</span>
                      <span className="text-primary-700 font-medium whitespace-nowrap">
                        {s.time}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400 mt-4">
                  모든 예배는 3층 대예배실에서 드립니다.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-2">교회 연락처</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {CHURCH.address}
                </p>
                <a
                  href={`tel:${CHURCH.phone}`}
                  className="text-sm text-primary-700 font-medium hover:underline mt-2 inline-block"
                >
                  {CHURCH.phone}
                </a>
              </div>

              <Link
                href="/visit"
                className="block bg-primary-800 text-white rounded-2xl p-5 hover:bg-primary-900 transition-colors"
              >
                <p className="font-semibold mb-1">처음 오시나요?</p>
                <p className="text-sm text-primary-200 leading-relaxed">
                  예배 시간, 주차, 자녀 동반까지 미리 안내해 드립니다.
                </p>
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
