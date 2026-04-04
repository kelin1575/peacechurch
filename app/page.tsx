import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Music,
  Heart,
  Play,
  ChevronRight,
  Calendar,
  MessageSquare,
  Youtube,
  Users,
  MapPin,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { fetchChannelVideos } from "@/lib/youtube";
import SermonCard from "@/components/SermonCard";
import { formatDate } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";

export const metadata: Metadata = {
  alternates: { canonical: BASE_URL },
  openGraph: {
    url: BASE_URL,
  },
};

async function getLatestSermons() {
  try {
    return await prisma.sermon.findMany({
      take: 6,
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

async function getTodayDevotional() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return await prisma.devotional.findFirst({
      where: { date: { gte: today, lt: tomorrow } },
    });
  } catch {
    return null;
  }
}

async function getStats() {
  try {
    const [sermonCount, commentCount] = await Promise.all([
      prisma.sermon.count(),
      prisma.comment.count(),
    ]);
    return { sermonCount, commentCount };
  } catch {
    return { sermonCount: 0, commentCount: 0 };
  }
}

async function getLatestYouTubeVideos() {
  try {
    const { videos } = await fetchChannelVideos(6);
    return videos;
  } catch {
    return [];
  }
}

const QUICK_LINKS = [
  {
    href: "/sermons",
    icon: Play,
    label: "설교 말씀",
    desc: "주일예배 영상",
    color: "bg-blue-50 text-blue-700 group-hover:bg-blue-100",
    border: "hover:border-blue-200",
  },
  {
    href: "/devotional",
    icon: BookOpen,
    label: "매일 묵상",
    desc: "오늘의 말씀",
    color: "bg-green-50 text-green-700 group-hover:bg-green-100",
    border: "hover:border-green-200",
  },
  {
    href: "/bible",
    icon: BookOpen,
    label: "성경 찾기",
    desc: "개역개정 66권",
    color: "bg-purple-50 text-purple-700 group-hover:bg-purple-100",
    border: "hover:border-purple-200",
  },
  {
    href: "/hymnal",
    icon: Music,
    label: "찬송가",
    desc: "찬양과 경배",
    color: "bg-orange-50 text-orange-700 group-hover:bg-orange-100",
    border: "hover:border-orange-200",
  },
];

export default async function HomePage() {
  const [sermons, todayDevotional, latestVideos, stats] = await Promise.all([
    getLatestSermons(),
    getTodayDevotional(),
    getLatestYouTubeVideos(),
    getStats(),
  ]);

  const displaySermons =
    sermons.length > 0
      ? sermons
      : latestVideos.map((v) => ({
          id: v.id,
          youtubeId: v.id,
          title: v.title,
          scripture: null,
          summary: v.description.slice(0, 100),
          category: "주일예배",
          publishedAt: new Date(v.publishedAt),
          thumbnail: v.thumbnail,
        }));

  return (
    <div>
      {/* ─── Hero ─── */}
      <section
        className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white overflow-hidden"
        aria-label="메인 히어로"
      >
        {/* decorative dots */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span
                className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                aria-hidden="true"
              />
              주일예배 매주 일요일 오전 11시
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
              하나님의 말씀으로
              <br />
              <span className="text-gold-400">평안을 누리세요</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              수원평안교회 정재광 목사님의 말씀을 언제 어디서나
              <br className="hidden md:block" />
              듣고 묵상하실 수 있습니다
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sermons"
                className="btn-gold text-base px-8 py-4"
                aria-label="최신 설교 말씀 듣기"
              >
                <Play className="w-5 h-5" aria-hidden="true" />
                최신 말씀 듣기
              </Link>
              <Link
                href="/devotional"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/20 transition-all text-base"
                aria-label="오늘의 묵상 보기"
              >
                <BookOpen className="w-5 h-5" aria-hidden="true" />
                오늘의 묵상
              </Link>
            </div>

            {/* Stats */}
            {(stats.sermonCount > 0 || stats.commentCount > 0) && (
              <div className="mt-12 flex items-center justify-center gap-8 text-primary-200">
                {stats.sermonCount > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {stats.sermonCount}+
                    </p>
                    <p className="text-sm">설교 말씀</p>
                  </div>
                )}
                <div className="w-px h-8 bg-primary-600" aria-hidden="true" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">매주</p>
                  <p className="text-sm">주일예배</p>
                </div>
                {stats.commentCount > 0 && (
                  <>
                    <div className="w-px h-8 bg-primary-600" aria-hidden="true" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {stats.commentCount}+
                      </p>
                      <p className="text-sm">은혜 나눔</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 60L48 51.8C96 43.7 192 27.3 288 24.5C384 21.7 480 32.3 576 37.8C672 43.3 768 43.7 864 40.7C960 37.7 1056 31.3 1152 29.5C1248 27.7 1344 30.3 1392 31.7L1440 33V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* ─── Quick access ─── */}
      <section className="bg-gray-50 py-10" aria-labelledby="quick-links-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="quick-links-heading" className="sr-only">빠른 메뉴</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group card p-5 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-all border border-transparent ${item.border}`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${item.color}`}
                >
                  <item.icon className="w-7 h-7" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Today Devotional Banner ─── */}
      {todayDevotional && (
        <section
          className="bg-gradient-to-r from-green-50 via-primary-50 to-blue-50 border-y border-green-100 py-10"
          aria-labelledby="devotional-banner-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center shadow-md">
                  <Calendar className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">
                    오늘의 묵상
                  </p>
                  <time
                    dateTime={new Date(todayDevotional.date).toISOString()}
                    className="text-sm text-gray-500"
                  >
                    {formatDate(todayDevotional.date)}
                  </time>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-green-700 font-semibold mb-1">
                  {todayDevotional.scripture}
                </p>
                <h2
                  id="devotional-banner-heading"
                  className="font-bold text-gray-900 text-lg mb-1"
                >
                  {todayDevotional.title}
                </h2>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {todayDevotional.content}
                </p>
              </div>

              <Link
                href="/devotional"
                className="btn-primary text-sm px-5 py-2.5 flex-shrink-0"
              >
                전체 읽기
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Latest Sermons ─── */}
      <section className="py-16 bg-white" aria-labelledby="latest-sermons-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold text-primary-600 mb-1 uppercase tracking-wide">
                설교 말씀
              </p>
              <h2
                id="latest-sermons-heading"
                className="section-title"
              >
                최신 말씀
              </h2>
              <p className="section-subtitle">
                정재광 목사님의 최근 주일예배 설교 말씀입니다
              </p>
            </div>
            <Link
              href="/sermons"
              className="hidden md:flex items-center gap-1 text-primary-700 font-semibold text-sm hover:text-primary-800 transition-colors"
            >
              전체 보기
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {displaySermons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displaySermons.slice(0, 6).map((sermon) => (
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
            <div className="text-center py-16 text-gray-400">
              <Youtube
                className="w-14 h-14 mx-auto mb-3 opacity-30"
                aria-hidden="true"
              />
              <p>등록된 설교가 없습니다</p>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/sermons" className="btn-secondary text-sm">
              전체 말씀 보기
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Scripture of the Week ─── */}
      <section
        className="py-16 bg-primary-800 text-white"
        aria-labelledby="scripture-heading"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen
            className="w-10 h-10 mx-auto mb-6 text-gold-400"
            aria-hidden="true"
          />
          <h2 id="scripture-heading" className="sr-only">
            이 주의 말씀
          </h2>
          <blockquote>
            <p className="text-xl md:text-2xl font-serif leading-relaxed text-primary-100 italic mb-6">
              &ldquo;내가 세상 끝날까지 너희와 항상 함께 있으리라&rdquo;
            </p>
            <footer className="text-gold-400 font-semibold">
              마태복음 28:20
            </footer>
          </blockquote>
          <Link
            href="/bible"
            className="mt-6 inline-flex items-center gap-2 text-primary-300 hover:text-white text-sm transition-colors"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            개역개정 성경 찾기
          </Link>
        </div>
      </section>

      {/* ─── About Pastor + Church Info ─── */}
      <section
        className="py-16 bg-gray-50"
        aria-labelledby="about-pastor-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Pastor */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center md:text-left flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-4xl">정</span>
                </div>
              </div>
              <div>
                <h2
                  id="about-pastor-heading"
                  className="text-xl font-bold text-gray-900 mb-1"
                >
                  정재광 목사
                </h2>
                <p className="text-primary-700 font-semibold text-sm mb-3">
                  수원평안교회 담임목사
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  하나님의 말씀을 삶 속에서 살아내는 교회,
                  서로 사랑하고 섬기는 공동체를 꿈꿉니다.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <a
                    href="https://youtube.com/channel/UC9c1llukhxYQ5nma355O-kg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs bg-red-600 text-white px-3 py-1.5 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <Youtube className="w-3.5 h-3.5" aria-hidden="true" />
                    유튜브 채널
                  </a>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 text-xs bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full hover:bg-primary-200 transition-colors"
                  >
                    교회 소개 보기
                  </Link>
                </div>
              </div>
            </div>

            {/* Church Info */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg mb-5">
                예배 & 교회 안내
              </h2>
              <ul className="space-y-4" role="list">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary-700" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      주일예배
                    </p>
                    <p className="text-gray-500 text-sm">매주 일요일 오전 11:00</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-green-700" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">위치</p>
                    <p className="text-gray-500 text-sm">경기도 수원시</p>
                    <a
                      href="https://map.naver.com/v5/search/수원평안교회"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:underline mt-0.5 inline-block"
                    >
                      지도에서 보기 →
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-700" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">온라인</p>
                    <p className="text-gray-500 text-sm">
                      유튜브 · 이 사이트에서 온라인 예배 가능
                    </p>
                  </div>
                </li>
              </ul>
              <Link
                href="/about"
                className="mt-5 btn-secondary text-sm py-2.5 w-full justify-center"
              >
                교회 자세히 알아보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA: Donation ─── */}
      <section className="py-12 bg-gradient-to-r from-gold-600 to-amber-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart
            className="w-10 h-10 mx-auto mb-4 text-white/80 fill-white/30"
            aria-hidden="true"
          />
          <h2 className="text-2xl font-bold mb-3">함께 하나님 나라를 세워가요</h2>
          <p className="text-amber-100 mb-6 max-w-lg mx-auto">
            여러분의 헌금이 하나님 나라의 확장을 위해 사용됩니다.
            하나님께서 넘치도록 갚아 주실 것입니다.
          </p>
          <Link
            href="/donate"
            className="inline-flex items-center gap-2 bg-white text-amber-700 font-bold px-8 py-3 rounded-xl hover:bg-amber-50 transition-colors shadow-md"
          >
            <Heart className="w-5 h-5 fill-amber-400" aria-hidden="true" />
            후원하기
          </Link>
        </div>
      </section>

      {/* ─── FAQ teaser for GEO ─── */}
      <section className="py-14 bg-white" aria-labelledby="faq-teaser-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2
              id="faq-teaser-heading"
              className="text-2xl font-bold text-gray-900"
            >
              자주 묻는 질문
            </h2>
            <p className="text-gray-500 mt-2">
              수원평안교회에 대해 자주 묻는 질문들입니다
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: "주일예배는 언제 시작하나요?",
                a: "매주 일요일 오전 11시에 시작합니다.",
              },
              {
                q: "온라인으로 설교를 볼 수 있나요?",
                a: "유튜브 채널과 이 사이트에서 무료로 시청하실 수 있습니다.",
              },
              {
                q: "어떤 성경 번역본을 사용하나요?",
                a: "개역개정 성경을 사용합니다.",
              },
              {
                q: "처음 방문하면 어떻게 하나요?",
                a: "주일 오전 11시 예배에 편안하게 참석하시면 됩니다.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="bg-gray-50 rounded-xl p-5 border border-gray-100"
              >
                <p className="font-semibold text-gray-900 text-sm mb-1.5">
                  Q. {item.q}
                </p>
                <p className="text-gray-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/faq"
              className="text-primary-700 font-semibold text-sm hover:text-primary-800 transition-colors inline-flex items-center gap-1"
            >
              전체 FAQ 보기
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
