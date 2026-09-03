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
  Youtube,
  Users,
  MapPin,
  Clock,
  HeartHandshake,
  Megaphone,
  Sunrise,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { fetchChannelVideos } from "@/lib/youtube";
import SermonCard from "@/components/SermonCard";
import { formatDate } from "@/lib/utils";
import {
  CHURCH,
  SUNDAY_SERVICES,
  WEEKDAY_SERVICES,
  getNextService,
} from "@/lib/church";
import { newsCategoryStyle } from "@/lib/news";

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

async function getLatestNews() {
  try {
    return await prisma.news.findMany({
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      take: 3,
    });
  } catch {
    // News 표가 아직 없으면 이 섹션만 조용히 비웁니다.
    return [];
  }
}

const QUICK_LINKS = [
  {
    href: "/sermons",
    icon: Play,
    label: "설교 말씀",
    desc: "주일예배 영상",
    color: "bg-primary-50 text-primary-700 group-hover:bg-primary-100",
    border: "hover:border-primary-200",
  },
  {
    href: "/devotional",
    icon: Sunrise,
    label: "매일 묵상",
    desc: "오늘의 말씀",
    color: "bg-olive-50 text-olive-700 group-hover:bg-olive-100",
    border: "hover:border-olive-200",
  },
  {
    href: "/prayer",
    icon: HeartHandshake,
    label: "기도의 벽",
    desc: "함께 중보합니다",
    color: "bg-rose-50 text-rose-700 group-hover:bg-rose-100",
    border: "hover:border-rose-200",
  },
  {
    href: "/bible",
    icon: BookOpen,
    label: "성경 찾기",
    desc: "개역개정 66권",
    color: "bg-violet-50 text-violet-700 group-hover:bg-violet-100",
    border: "hover:border-violet-200",
  },
  {
    href: "/hymnal",
    icon: Music,
    label: "찬송가",
    desc: "찬양과 경배",
    color: "bg-gold-50 text-gold-700 group-hover:bg-gold-100",
    border: "hover:border-gold-200",
  },
  {
    href: "/news",
    icon: Megaphone,
    label: "평안소식",
    desc: "교회 소식",
    color: "bg-sky-50 text-sky-700 group-hover:bg-sky-100",
    border: "hover:border-sky-200",
  },
];

export default async function HomePage() {
  const [sermons, todayDevotional, latestVideos, stats, news] = await Promise.all([
    getLatestSermons(),
    getTodayDevotional(),
    getLatestYouTubeVideos(),
    getStats(),
    getLatestNews(),
  ]);

  // DB에 설교가 있으면 그것을, 없으면 유튜브 최신 영상을 보여줍니다.
  const fromDb = sermons.length > 0;
  const displaySermons = fromDb
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

  const featured = displaySermons[0];
  // DB 설교면 상세 페이지로, 유튜브 폴백이면 유튜브로 보냅니다.
  const featuredHref = featured
    ? fromDb
      ? `/sermons/${featured.id}`
      : `https://www.youtube.com/watch?v=${featured.youtubeId}`
    : "/sermons";
  const featuredIsExternal = Boolean(featured) && !fromDb;

  const { service: nextService, whenLabel } = getNextService();
  // "금요일 금요기도회"처럼 요일이 겹쳐 읽히지 않도록, 예배 이름에 이미 요일이
  // 들어 있으면 앞의 요일 표기는 뺍니다.
  const nextWhen = nextService.name.startsWith(whenLabel.replace("요일", ""))
    ? ""
    : `${whenLabel} `;

  return (
    <div>
      {/* ─── Hero ─── */}
      <section
        className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white overflow-hidden"
        aria-label="메인 히어로"
      >
        {/* 은은한 빛 — 예배당 창으로 들어오는 아침 빛의 느낌 */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(230,205,135,0.22) 0%, rgba(230,205,135,0) 65%)",
          }}
          aria-hidden="true"
        />

        <div className="relative container-page py-12 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* 왼쪽: 말씀 */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <span
                  className="w-2 h-2 bg-gold-300 rounded-full animate-pulse"
                  aria-hidden="true"
                />
                다음 예배 · {nextWhen}{nextService.name} {nextService.time}
              </div>

              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold mb-6 leading-[1.2] tracking-tight">
                하나님의 말씀으로
                <br />
                <span className="text-gold-300">평안을 누리세요</span>
              </h1>

              <p className="text-base md:text-lg text-primary-100 mb-9 max-w-xl leading-relaxed">
                {CHURCH.name} {CHURCH.pastor} {CHURCH.pastorTitle}님의 말씀을
                언제 어디서나 듣고 묵상하실 수 있습니다.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/sermons" className="btn-gold text-base px-7 py-3.5">
                  <Play className="w-5 h-5" aria-hidden="true" />
                  설교 말씀 보기
                </Link>
                <Link href="/visit" className="btn-ghost-light text-base px-7 py-3.5">
                  처음 오셨나요?
                </Link>
              </div>

              {/* Stats */}
              {(stats.sermonCount > 0 || stats.commentCount > 0) && (
                <div className="mt-10 flex items-center gap-8 text-primary-200">
                  {stats.sermonCount > 0 && (
                    <div>
                      <p className="text-2xl font-bold text-white tabular-nums">
                        {stats.sermonCount}+
                      </p>
                      <p className="text-sm">설교 말씀</p>
                    </div>
                  )}
                  <div className="w-px h-8 bg-white/20" aria-hidden="true" />
                  <div>
                    <p className="text-2xl font-bold text-white">매주</p>
                    <p className="text-sm">주일예배</p>
                  </div>
                  {stats.commentCount > 0 && (
                    <>
                      <div className="w-px h-8 bg-white/20" aria-hidden="true" />
                      <div>
                        <p className="text-2xl font-bold text-white tabular-nums">
                          {stats.commentCount}+
                        </p>
                        <p className="text-sm">은혜 나눔</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 오른쪽: 이번 주 말씀 — 첫 화면에서 바로 재생으로 이어지게 */}
            {featured && (
              <div className="lg:justify-self-end w-full max-w-lg">
                <p className="eyebrow text-gold-300 mb-3">이번 주 말씀</p>
                {featuredIsExternal ? (
                  <a
                    href={featuredHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <FeaturedCard featured={featured} />
                  </a>
                ) : (
                  <Link href={featuredHref} className="block group">
                    <FeaturedCard featured={featured} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 예배 시간 띠 ─── */}
      <section
        className="bg-white border-b border-gray-200"
        aria-labelledby="service-times-heading"
      >
        <div className="container-page">
          <h2 id="service-times-heading" className="sr-only">
            예배 시간 안내
          </h2>
          <ul
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 divide-x divide-gray-100"
            role="list"
          >
            {[...SUNDAY_SERVICES, ...WEEKDAY_SERVICES].map((s) => {
              const isNext = s.name === nextService.name;
              return (
                <li
                  key={s.name}
                  className={`px-4 py-4 text-center ${
                    isNext ? "bg-primary-50" : ""
                  }`}
                >
                  <p
                    className={`text-sm font-bold ${
                      isNext ? "text-primary-700" : "text-gray-900"
                    }`}
                  >
                    {s.name}
                  </p>
                  <p
                    className={`text-sm ${
                      isNext ? "text-primary-600 font-semibold" : "text-gray-500"
                    }`}
                  >
                    {s.time}
                  </p>
                  {isNext && (
                    <p className="text-[11px] text-primary-500 mt-0.5">
                      {whenLabel} 드립니다
                    </p>
                  )}
                </li>
              );
            })}
            <li className="px-4 py-4 text-center col-span-2 sm:col-span-3 md:col-span-1">
              <a
                href={CHURCH.naverMap}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-gray-900 hover:text-primary-700 transition-colors"
              >
                오시는 길
              </a>
              <p className="text-xs text-gray-500 mt-0.5">{CHURCH.addressShort}</p>
            </li>
          </ul>
        </div>
      </section>

      {/* ─── Quick access ─── */}
      <section className="bg-gray-50 py-10" aria-labelledby="quick-links-heading">
        <div className="container-page">
          <h2 id="quick-links-heading" className="sr-only">
            빠른 메뉴
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                  <p className="font-bold text-gray-900 text-sm">{item.label}</p>
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
          className="bg-olive-50 border-y border-olive-200 py-10"
          aria-labelledby="devotional-banner-heading"
        >
          <div className="container-page">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-14 h-14 bg-olive-600 rounded-2xl flex items-center justify-center shadow-soft">
                  <Sunrise className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-olive-700 font-semibold uppercase tracking-wide">
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
                <p className="text-sm text-olive-700 font-semibold mb-1">
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
        <div className="container-page">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="eyebrow mb-1">설교 말씀</p>
              <h2 id="latest-sermons-heading" className="section-title">
                최신 말씀
              </h2>
              <p className="section-subtitle">
                {CHURCH.pastor} {CHURCH.pastorTitle}님의 최근 주일예배 설교 말씀입니다
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
            className="w-10 h-10 mx-auto mb-6 text-gold-300"
            aria-hidden="true"
          />
          <h2 id="scripture-heading" className="sr-only">
            이 주의 말씀
          </h2>
          <blockquote>
            <p className="scripture text-xl md:text-2xl text-primary-50 mb-6">
              &ldquo;평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라&rdquo;
            </p>
            <footer className="text-gold-300 font-semibold">요한복음 14:27</footer>
          </blockquote>
          <Link
            href="/bible"
            className="mt-6 inline-flex items-center gap-2 text-primary-200 hover:text-white text-sm transition-colors"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            개역개정 성경 찾기
          </Link>
        </div>
      </section>

      {/* ─── 평안소식 ─── */}
      {news.length > 0 && (
        <section className="py-16 bg-gray-50" aria-labelledby="news-heading">
          <div className="container-page">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="eyebrow mb-1">평안소식</p>
                <h2 id="news-heading" className="section-title">
                  교회 소식
                </h2>
              </div>
              <Link
                href="/news"
                className="flex items-center gap-1 text-primary-700 font-semibold text-sm hover:text-primary-800 transition-colors"
              >
                전체 보기
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-3 gap-5" role="list">
              {news.map((n) => (
                <li key={n.id}>
                  <Link
                    href="/news"
                    className="card block h-full p-5 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
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
                    <p className="font-bold text-gray-900 mb-1.5 line-clamp-2">
                      {n.title}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                      {n.content}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ─── 다음 걸음 ─── */}
      <section className="py-16 bg-white" aria-labelledby="next-step-heading">
        <div className="container-page">
          <div className="text-center mb-10">
            <p className="eyebrow mb-1">Next Step</p>
            <h2 id="next-step-heading" className="section-title">
              다음 걸음
            </h2>
            <p className="section-subtitle">
              어디에 계시든, 오늘 하실 수 있는 한 걸음이 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link
              href="/visit"
              className="group rounded-2xl border-2 border-primary-100 bg-primary-50 p-7 hover:border-primary-300 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-700 text-white flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">처음 오신 분</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                예배 시간, 주차, 자녀 동반, 복장까지 미리 안내해 드립니다.
                아무 준비 없이 오셔도 괜찮습니다.
              </p>
              <span className="text-sm font-semibold text-primary-700 inline-flex items-center gap-1">
                방문 안내 보기
                <ChevronRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </span>
            </Link>

            <Link
              href="/prayer"
              className="group rounded-2xl border-2 border-olive-100 bg-olive-50 p-7 hover:border-olive-300 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-olive-600 text-white flex items-center justify-center mb-4">
                <HeartHandshake className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">기도의 벽</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                혼자 지고 계신 짐이 있다면 내려놓으세요. 익명으로 올리셔도 됩니다.
                교회가 함께 기도합니다.
              </p>
              <span className="text-sm font-semibold text-olive-700 inline-flex items-center gap-1">
                기도제목 나누기
                <ChevronRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </span>
            </Link>

            <Link
              href="/devotional"
              className="group rounded-2xl border-2 border-gold-100 bg-gold-50 p-7 hover:border-gold-300 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-gold-600 text-white flex items-center justify-center mb-4">
                <Sunrise className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">매일 묵상</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                하루를 말씀으로 여세요. 오늘의 본문과 짧은 기도를 매일 올려드립니다.
              </p>
              <span className="text-sm font-semibold text-gold-700 inline-flex items-center gap-1">
                오늘의 묵상 읽기
                <ChevronRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── About Pastor + Church Info ─── */}
      <section className="py-16 bg-gray-50" aria-labelledby="about-pastor-heading">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Pastor */}
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100 text-center md:text-left flex flex-col md:flex-row items-center gap-6">
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
                  {CHURCH.pastor} 목사
                </h2>
                <p className="text-primary-700 font-semibold text-sm mb-3">
                  {CHURCH.name} {CHURCH.pastorTitle}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  하나님의 말씀을 삶 속에서 살아내는 교회, 서로 사랑하고 섬기는
                  공동체를 꿈꿉니다.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <a
                    href={CHURCH.youtube}
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
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg mb-5">
                예배 &amp; 교회 안내
              </h2>
              <ul className="space-y-4" role="list">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock
                      className="w-5 h-5 text-primary-700"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">주일예배</p>
                    <p className="text-gray-500 text-sm">
                      오전 9:00 · 11:00 · 오후 2:00
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-olive-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-olive-700" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">위치</p>
                    <p className="text-gray-500 text-sm">{CHURCH.addressShort}</p>
                    <a
                      href={CHURCH.naverMap}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:underline mt-0.5 inline-block"
                    >
                      지도에서 보기 →
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-sky-700" aria-hidden="true" />
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
      <section className="py-14 bg-gradient-to-r from-gold-600 to-gold-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart
            className="w-10 h-10 mx-auto mb-4 text-white/90 fill-white/25"
            aria-hidden="true"
          />
          <h2 className="text-2xl font-bold mb-3">함께 하나님 나라를 세워가요</h2>
          <p className="text-gold-50 mb-7 max-w-lg mx-auto leading-relaxed">
            여러분의 헌금이 하나님 나라의 확장을 위해 사용됩니다.
            하나님께서 넘치도록 갚아 주실 것입니다.
          </p>
          <Link
            href="/donate"
            className="inline-flex items-center gap-2 bg-white text-gold-700 font-bold px-8 py-3 rounded-xl hover:bg-gold-50 transition-colors shadow-md"
          >
            <Heart className="w-5 h-5 fill-gold-400" aria-hidden="true" />
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
              {CHURCH.name}에 대해 자주 묻는 질문들입니다
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: "주일예배는 언제 시작하나요?",
                a: "1부 오전 9시, 2부 오전 11시, 3부 오후 2시에 드립니다.",
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
                a: "처음 오신 분 안내를 보시고 편안하게 오시면 됩니다.",
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

/** 히어로 오른쪽의 '이번 주 말씀' 카드 */
function FeaturedCard({
  featured,
}: {
  featured: {
    youtubeId: string;
    title: string;
    scripture?: string | null;
    category: string;
    publishedAt: Date;
    thumbnail?: string | null;
  };
}) {
  const thumb =
    featured.thumbnail || `https://i.ytimg.com/vi/${featured.youtubeId}/hqdefault.jpg`;

  return (
    <div className="rounded-2xl overflow-hidden bg-primary-900/60 border border-white/20 backdrop-blur-sm shadow-lift">
      <div className="relative aspect-video bg-primary-950">
        <Image
          src={thumb}
          alt={featured.title}
          fill
          sizes="(max-width: 1024px) 100vw, 512px"
          className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Play
              className="w-7 h-7 text-primary-800 fill-primary-800 ml-1"
              aria-hidden="true"
            />
          </span>
        </div>
        <span className="absolute top-3 left-3 bg-primary-900/80 text-white text-xs font-medium px-3 py-1 rounded-full">
          {featured.category}
        </span>
      </div>
      <div className="p-5">
        {featured.scripture && (
          <p className="text-gold-300 text-sm font-semibold mb-1.5">
            {featured.scripture}
          </p>
        )}
        <p className="font-bold text-white text-lg leading-snug line-clamp-2">
          {featured.title}
        </p>
        <p className="text-primary-200 text-sm mt-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          {formatDate(featured.publishedAt)}
        </p>
      </div>
    </div>
  );
}
