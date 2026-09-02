import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatDate, formatDateShort } from "@/lib/utils";
import { BookOpen, Calendar, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { DevotionalArticleSchema, BreadcrumbSchema } from "@/components/JsonLd";
import ShareButton from "@/components/ShareButton";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";

export const metadata: Metadata = {
  title: "매일 묵상",
  description:
    "수원평안교회 정재광 목사님이 전하는 오늘의 성경 묵상. 말씀과 기도로 하루를 시작하세요.",
  keywords: ["매일묵상", "성경묵상", "QT", "정재광목사", "수원평안교회", "기도"],
  openGraph: {
    title: "매일 묵상 | 수원평안교회 정재광 목사",
    description: "오늘의 성경 말씀과 묵상, 기도문. 매일 새로운 묵상을 만나보세요.",
    url: `${BASE_URL}/devotional`,
  },
  alternates: { canonical: `${BASE_URL}/devotional` },
};

/** KST 기준 오늘 날짜를 UTC midnight으로 반환 */
function getTodayUtcKST(): Date {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()));
}

/** YYYY-MM-DD 문자열 → UTC midnight */
function parseDateParam(dateStr: string): Date | null {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

async function getDevotionalByDate(date: Date) {
  const next = new Date(date.getTime() + 86400000);
  try {
    return await prisma.devotional.findFirst({
      where: { date: { gte: date, lt: next } },
    });
  } catch {
    return null;
  }
}

async function getAdjacentDevotionals(date: Date) {
  try {
    const [prev, next] = await Promise.all([
      // 이전: 현재 날짜보다 이전 중 가장 최신
      prisma.devotional.findFirst({
        where: { date: { lt: date } },
        orderBy: { date: "desc" },
        select: { date: true },
      }),
      // 다음: 현재 날짜보다 이후 중 가장 과거
      prisma.devotional.findFirst({
        where: { date: { gt: date } },
        orderBy: { date: "asc" },
        select: { date: true },
      }),
    ]);
    return { prev, next };
  } catch {
    return { prev: null, next: null };
  }
}

async function getRecentDevotionals() {
  try {
    return await prisma.devotional.findMany({
      orderBy: { date: "desc" },
      take: 8,
      select: { id: true, title: true, scripture: true, date: true },
    });
  } catch {
    return [];
  }
}

function toDateParam(date: Date): string {
  // UTC 날짜를 YYYY-MM-DD로
  return date.toISOString().split("T")[0];
}

const MOCK_DEVOTIONAL = {
  id: "mock",
  title: "하나님의 은혜로 충분합니다",
  scripture: "고린도후서 12:9",
  content: `오늘의 본문은 사도 바울이 "가시"라고 부른 고난을 통해 하나님의 은혜를 깊이 경험하는 이야기입니다.

바울은 세 번이나 이 고통을 제거해 달라고 간구했습니다. 그러나 하나님의 응답은 예상과 달랐습니다. "내 은혜가 네게 족하도다."

우리도 인생의 여러 어려움 앞에서 하나님께 제거해 달라고 기도합니다. 때로는 질병, 때로는 관계의 상처, 때로는 경제적 어려움... 그런데 하나님은 때때로 상황을 바꾸시는 대신 우리 안에 역사하시는 은혜를 주십니다.

"내 능력이 약한 데서 온전하여짐이라" — 이 말씀은 우리의 약함이 하나님의 강함이 나타나는 통로가 됨을 가르쳐 줍니다.

오늘 우리의 약함을 인정하고, 그 자리에서 하나님의 은혜를 경험하는 하루가 되기를 소망합니다.`,
  prayer: `하나님 아버지, 오늘 저의 연약함을 주님 앞에 내려놓습니다. 제 힘으로 해결하려 했던 문제들을 주님께 맡깁니다. 주님의 은혜가 제게 족함을 믿으며, 그 은혜 안에서 오늘 하루를 걸어가게 하소서. 예수님의 이름으로 기도합니다. 아멘.`,
  date: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default async function DevotionalPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;

  // 요청 날짜 결정: ?date=YYYY-MM-DD 있으면 그 날짜, 없으면 KST 오늘
  const targetDate = dateParam ? parseDateParam(dateParam) : getTodayUtcKST();
  const resolvedDate = targetDate ?? getTodayUtcKST();

  const [todayDevotional, adjacent, recentDevotionals] = await Promise.all([
    getDevotionalByDate(resolvedDate),
    getAdjacentDevotionals(resolvedDate),
    getRecentDevotionals(),
  ]);

  const isMock = !todayDevotional;
  const devotional = todayDevotional || { ...MOCK_DEVOTIONAL, date: resolvedDate };

  const breadcrumbs = [
    { name: "홈", url: BASE_URL },
    { name: "매일 묵상", url: `${BASE_URL}/devotional` },
  ];

  return (
    <>
      <DevotionalArticleSchema
        title={devotional.title}
        scripture={devotional.scripture}
        content={devotional.content}
        date={devotional.date}
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-olive-900 via-olive-800 to-olive-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav aria-label="breadcrumb" className="flex items-center gap-2 text-olive-300 text-sm mb-4">
              <a href="/" className="hover:text-white transition-colors">홈</a>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <span className="text-white">매일 묵상</span>
            </nav>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-olive-300" aria-hidden="true" />
              <h1 className="text-3xl md:text-4xl font-bold">매일 묵상</h1>
            </div>
            <time dateTime={resolvedDate.toISOString()} className="text-olive-200">
              {formatDate(resolvedDate)}
            </time>
            {isMock && (
              <p className="text-olive-300 text-sm mt-1">
                이 날의 묵상이 아직 등록되지 않았습니다.
              </p>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main devotional */}
            <article className="lg:col-span-2 space-y-6">
              {/* Scripture banner */}
              <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl p-6 text-white">
                <p className="text-primary-300 text-xs font-semibold uppercase tracking-wider mb-1">
                  오늘의 본문 · 개역개정
                </p>
                <p className="scripture text-gold-300 font-bold text-2xl mb-1">
                  {devotional.scripture}
                </p>
                <h2 className="text-white font-bold text-xl">
                  {devotional.title}
                </h2>
              </div>

              {/* Content */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-1 h-7 bg-olive-500 rounded-full" aria-hidden="true" />
                  <h3 className="font-bold text-gray-900 text-lg">오늘의 묵상</h3>
                </div>
                <div className="prose prose-gray max-w-none">
                  {devotional.content.split("\n\n").map((para, i) => (
                    <p key={i} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Prayer */}
              {devotional.prayer && (
                <div className="bg-gold-50 rounded-2xl p-6 border border-gold-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-gold-600 fill-gold-200" aria-hidden="true" />
                    <h3 className="font-bold text-gold-800 text-lg">오늘의 기도</h3>
                  </div>
                  <p className="scripture text-gold-900 leading-relaxed">{devotional.prayer}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/bible?q=${encodeURIComponent(devotional.scripture)}`}
                  className="btn-secondary text-sm py-2.5"
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  본문 성경 보기
                </Link>
                <ShareButton
                  title={`오늘의 묵상: ${devotional.title} (${devotional.scripture})`}
                  label="묵상 나누기"
                />
              </div>

              {/* 이전/다음 묵상 네비게이션 */}
              <nav
                aria-label="묵상 이동"
                className="flex items-center justify-between pt-4 border-t border-gray-100"
              >
                {adjacent.prev ? (
                  <Link
                    href={`/devotional?date=${toDateParam(adjacent.prev.date)}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary-700 text-sm transition-colors"
                    aria-label="이전 묵상"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    이전 묵상
                  </Link>
                ) : (
                  <span className="flex items-center gap-2 text-gray-300 text-sm cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    이전 묵상
                  </span>
                )}

                <Link href="/devotional" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  오늘 묵상
                </Link>

                {adjacent.next ? (
                  <Link
                    href={`/devotional?date=${toDateParam(adjacent.next.date)}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary-700 text-sm transition-colors"
                    aria-label="다음 묵상"
                  >
                    다음 묵상
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-2 text-gray-300 text-sm cursor-not-allowed">
                    다음 묵상
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                )}
              </nav>
            </article>

            {/* Sidebar */}
            <aside className="space-y-5" aria-label="사이드바">
              {/* Author info */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-bold text-xl">정</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">정재광 목사</p>
                    <p className="text-xs text-gray-500">수원평안교회 담임목사</p>
                  </div>
                </div>
                <Link
                  href="/sermons"
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  설교 말씀 보기 →
                </Link>
              </div>

              {/* Recent devotionals */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-olive-600" aria-hidden="true" />
                  <h3 className="font-semibold text-gray-900">최근 묵상</h3>
                </div>
                {recentDevotionals.length > 0 ? (
                  <ul className="space-y-1" role="list">
                    {recentDevotionals.map((d) => {
                      const dParam = toDateParam(d.date);
                      const isActive = toDateParam(resolvedDate) === dParam;
                      return (
                        <li key={d.id}>
                          <Link
                            href={`/devotional?date=${dParam}`}
                            className={`block p-2.5 rounded-lg transition-colors group ${
                              isActive
                                ? "bg-olive-50 border border-olive-200"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <p className="text-xs text-gray-400 mb-0.5">
                              {formatDateShort(d.date)}
                            </p>
                            <p className={`text-sm font-medium line-clamp-1 transition-colors ${
                              isActive ? "text-olive-700" : "text-gray-700 group-hover:text-primary-700"
                            }`}>
                              {d.title}
                            </p>
                            <p className="text-xs text-olive-600 mt-0.5">{d.scripture}</p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    등록된 묵상이 없습니다
                  </p>
                )}
              </div>

              {/* Bible link */}
              <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
                <h3 className="font-semibold text-primary-800 mb-2">성경 본문 읽기</h3>
                <p className="text-sm text-primary-600 mb-3">
                  개역개정 성경으로 오늘의 본문을 읽어보세요
                </p>
                <Link
                  href={`/bible?q=${encodeURIComponent(devotional.scripture)}`}
                  className="btn-primary text-sm py-2.5 w-full justify-center"
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  {devotional.scripture}
                </Link>
              </div>

              {/* Related sermons CTA */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">관련 설교</h3>
                <p className="text-sm text-gray-500 mb-3">
                  정재광 목사님의 설교 말씀을 들어보세요
                </p>
                <Link href="/sermons" className="btn-secondary text-sm py-2.5 w-full justify-center">
                  설교 말씀 보기
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
