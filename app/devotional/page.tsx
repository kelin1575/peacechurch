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
    description:
      "오늘의 성경 말씀과 묵상, 기도문. 매일 새로운 묵상을 만나보세요.",
    url: `${BASE_URL}/devotional`,
  },
  alternates: { canonical: `${BASE_URL}/devotional` },
};

async function getTodayDevotional() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    return await prisma.devotional.findFirst({
      where: { date: { gte: today, lt: tomorrow } },
    });
  } catch {
    return null;
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

export default async function DevotionalPage() {
  const [todayDevotional, recentDevotionals] = await Promise.all([
    getTodayDevotional(),
    getRecentDevotionals(),
  ]);

  const devotional = todayDevotional || MOCK_DEVOTIONAL;

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
        <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav aria-label="breadcrumb" className="flex items-center gap-2 text-green-300 text-sm mb-4">
              <a href="/" className="hover:text-white transition-colors">홈</a>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <span className="text-white">매일 묵상</span>
            </nav>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-green-300" aria-hidden="true" />
              <h1 className="text-3xl md:text-4xl font-bold">매일 묵상</h1>
            </div>
            <time
              dateTime={new Date(devotional.date).toISOString()}
              className="text-green-200"
            >
              {formatDate(new Date(devotional.date))}
            </time>
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
                <p className="text-gold-400 font-bold text-2xl mb-1">
                  {devotional.scripture}
                </p>
                <h2 className="text-white font-bold text-xl">
                  {devotional.title}
                </h2>
              </div>

              {/* Content */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-5">
                  <span
                    className="w-1 h-7 bg-green-500 rounded-full"
                    aria-hidden="true"
                  />
                  <h3 className="font-bold text-gray-900 text-lg">오늘의 묵상</h3>
                </div>
                <div className="prose prose-gray max-w-none">
                  {devotional.content.split("\n\n").map((para, i) => (
                    <p
                      key={i}
                      className="text-gray-700 leading-relaxed mb-4 last:mb-0"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Prayer */}
              {devotional.prayer && (
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart
                      className="w-5 h-5 text-amber-600 fill-amber-200"
                      aria-hidden="true"
                    />
                    <h3 className="font-bold text-amber-800 text-lg">오늘의 기도</h3>
                  </div>
                  <p className="text-amber-900 leading-relaxed italic">
                    {devotional.prayer}
                  </p>
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
                <ShareButton title={`오늘의 묵상: ${devotional.title} (${devotional.scripture})`} label="묵상 나누기" />
              </div>

              {/* Navigation between devotionals */}
              <nav
                aria-label="묵상 이동"
                className="flex items-center justify-between pt-4 border-t border-gray-100"
              >
                <button
                  disabled
                  className="flex items-center gap-2 text-gray-400 text-sm cursor-not-allowed"
                  aria-label="이전 묵상"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  이전 묵상
                </button>
                <span className="text-xs text-gray-400">
                  {formatDateShort(devotional.date)}
                </span>
                <button
                  disabled
                  className="flex items-center gap-2 text-gray-400 text-sm cursor-not-allowed"
                  aria-label="다음 묵상"
                >
                  다음 묵상
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
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
                  <Calendar className="w-5 h-5 text-green-600" aria-hidden="true" />
                  <h3 className="font-semibold text-gray-900">최근 묵상</h3>
                </div>
                {recentDevotionals.length > 0 ? (
                  <ul className="space-y-1" role="list">
                    {recentDevotionals.map((d) => (
                      <li key={d.id}>
                        <a
                          href={`/devotional?date=${new Date(d.date).toISOString().split("T")[0]}`}
                          className="block p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <p className="text-xs text-gray-400 mb-0.5">
                            {formatDateShort(d.date)}
                          </p>
                          <p className="text-sm text-gray-700 font-medium group-hover:text-primary-700 transition-colors line-clamp-1">
                            {d.title}
                          </p>
                          <p className="text-xs text-green-600 mt-0.5">
                            {d.scripture}
                          </p>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    등록된 묵상이 없습니다
                  </p>
                )}
              </div>

              {/* Bible link */}
              <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
                <h3 className="font-semibold text-primary-800 mb-2">
                  성경 본문 읽기
                </h3>
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

