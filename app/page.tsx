import Link from "next/link";
import { BookOpen, Music, Heart, Play, ChevronRight, Calendar, Cross } from "lucide-react";

import { prisma } from "@/lib/db";
import { fetchChannelVideos } from "@/lib/youtube";
import SermonCard from "@/components/SermonCard";
import { formatDate } from "@/lib/utils";

async function getLatestSermons() {
  try {
    const sermons = await prisma.sermon.findMany({
      take: 6,
      orderBy: { publishedAt: "desc" },
    });
    return sermons;
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
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  } catch {
    return null;
  }
}

async function getLatestYouTubeVideos() {
  try {
    const { videos } = await fetchChannelVideos(3);
    return videos;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [sermons, todayDevotional, latestVideos] = await Promise.all([
    getLatestSermons(),
    getTodayDevotional(),
    getLatestYouTubeVideos(),
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              주일예배 매주 일요일 오전 11시
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              하나님의 말씀으로
              <br />
              <span className="text-gold-400">평안을 누리세요</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              수원평안교회 정재광 목사님의 말씀을 언제 어디서나
              <br className="hidden md:block" />
              듣고 묵상하실 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sermons" className="btn-gold text-base px-8 py-4">
                <Play className="w-5 h-5" />
                최신 말씀 듣기
              </Link>
              <Link href="/devotional" className="btn-secondary text-base px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <BookOpen className="w-5 h-5" />
                오늘의 묵상
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 60L48 51.8C96 43.7 192 27.3 288 24.5C384 21.7 480 32.3 576 37.8C672 43.3 768 43.7 864 40.7C960 37.7 1056 31.3 1152 29.5C1248 27.7 1344 30.3 1392 31.7L1440 33V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* Quick access */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                href: "/sermons",
                icon: Play,
                label: "설교 말씀",
                desc: "주일예배 영상",
                color: "bg-blue-50 text-blue-700",
              },
              {
                href: "/devotional",
                icon: BookOpen,
                label: "매일 묵상",
                desc: "오늘의 말씀",
                color: "bg-green-50 text-green-700",
              },
              {
                href: "/bible",
                icon: Cross,
                label: "성경 찾기",
                desc: "개역개정",
                color: "bg-purple-50 text-purple-700",
              },
              {
                href: "/hymnal",
                icon: Music,
                label: "찬송가",
                desc: "찬양과 경배",
                color: "bg-orange-50 text-orange-700",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="card p-4 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-transform"
              >
                <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Today Devotional */}
      {todayDevotional && (
        <section className="bg-gradient-to-r from-primary-50 to-blue-50 border-y border-primary-100 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-12 h-12 bg-primary-700 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-primary-600 font-medium">오늘의 묵상</p>
                  <p className="text-sm text-gray-500">{formatDate(todayDevotional.date)}</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-primary-600 font-medium mb-1">
                  {todayDevotional.scripture}
                </p>
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {todayDevotional.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {todayDevotional.content}
                </p>
              </div>
              <Link
                href="/devotional"
                className="btn-primary text-sm px-5 py-2.5 flex-shrink-0"
              >
                전체 읽기
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest Sermons */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">최신 말씀</h2>
              <p className="section-subtitle">정재광 목사님의 최근 설교 말씀입니다</p>
            </div>
            <Link
              href="/sermons"
              className="hidden md:flex items-center gap-1 text-primary-700 font-medium text-sm hover:text-primary-800 transition-colors"
            >
              전체 보기
              <ChevronRight className="w-4 h-4" />
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
            <div className="text-center py-12 text-gray-400">
              <Play className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>등록된 설교가 없습니다.</p>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/sermons" className="btn-secondary text-sm">
              전체 말씀 보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Pastor */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-primary-700 font-bold text-3xl">정</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">정재광 목사</h2>
            <p className="text-primary-700 font-medium mb-4">수원평안교회 담임목사</p>
            <p className="text-gray-600 leading-relaxed text-base">
              하나님의 말씀을 삶 속에서 살아내는 교회,
              서로 사랑하고 섬기는 공동체를 꿈꿉니다.
              주일마다 하나님의 살아있는 말씀을 통해
              우리의 삶이 변화되기를 소망합니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <a
                href="https://youtube.com/channel/UC9c1llukhxYQ5nma3550-kg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z"/>
                </svg>
                유튜브 채널
              </a>
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 bg-gold-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors"
              >
                <Heart className="w-4 h-4" />
                후원하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Scripture of the week */}
      <section className="py-16 bg-primary-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-6 text-gold-400" />
          <blockquote className="text-xl md:text-2xl font-serif leading-relaxed text-primary-100 italic mb-6">
            &ldquo;내가 세상 끝날까지 너희와 항상 함께 있으리라&rdquo;
          </blockquote>
          <p className="text-gold-400 font-medium">마태복음 28:20</p>
        </div>
      </section>
    </div>
  );
}
