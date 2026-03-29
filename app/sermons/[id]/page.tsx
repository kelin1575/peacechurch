import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Play,
} from "lucide-react";
import CommentSection from "@/components/CommentSection";
import SermonCard from "@/components/SermonCard";
import {
  SermonVideoSchema,
  BreadcrumbSchema,
} from "@/components/JsonLd";
import ShareButton from "@/components/ShareButton";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";

async function getSermon(id: string) {
  try {
    return await prisma.sermon.findUnique({
      where: { id },
      include: {
        comments: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });
  } catch {
    return null;
  }
}

async function getRelatedSermons(id: string, category: string) {
  try {
    return await prisma.sermon.findMany({
      where: { category, id: { not: id } },
      orderBy: { publishedAt: "desc" },
      take: 4,
      select: {
        id: true,
        youtubeId: true,
        title: true,
        scripture: true,
        summary: true,
        category: true,
        publishedAt: true,
        thumbnail: true,
      },
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sermon = await getSermon(id);

  if (!sermon) {
    return {
      title: "설교 말씀",
      description: "수원평안교회 정재광 목사 설교 말씀",
    };
  }

  const description =
    sermon.summary?.slice(0, 155) ||
    sermon.description?.slice(0, 155) ||
    `수원평안교회 정재광 목사님의 설교 - ${sermon.scripture || sermon.title}`;

  const thumbnail =
    sermon.thumbnail ||
    `https://i.ytimg.com/vi/${sermon.youtubeId}/maxresdefault.jpg`;

  return {
    title: sermon.title,
    description,
    keywords: [
      "정재광목사 설교",
      "수원평안교회",
      sermon.category,
      sermon.scripture || "",
      sermon.title,
    ].filter(Boolean),
    openGraph: {
      type: "video.episode",
      title: `${sermon.title} | 수원평안교회 정재광 목사`,
      description,
      url: `${BASE_URL}/sermons/${sermon.id}`,
      images: [{ url: thumbnail, width: 1280, height: 720, alt: sermon.title }],
      videos: [
        {
          url: `https://www.youtube.com/watch?v=${sermon.youtubeId}`,
          type: "text/html",
        },
      ],
    },
    twitter: {
      card: "player",
      title: sermon.title,
      description,
      images: [thumbnail],
    },
    alternates: { canonical: `${BASE_URL}/sermons/${sermon.id}` },
  };
}

export default async function SermonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let sermon;
  let relatedSermons: Awaited<ReturnType<typeof getRelatedSermons>> = [];

  if (id.length === 11) {
    // YouTube video ID used directly
    sermon = {
      id,
      youtubeId: id,
      title: "설교 말씀",
      description: null,
      thumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      publishedAt: new Date(),
      category: "주일예배",
      summary: null,
      interpretation: null,
      scripture: null,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [] as { id: string; author: string; content: string; createdAt: Date }[],
    };
  } else {
    const dbSermon = await getSermon(id);
    if (!dbSermon) notFound();
    sermon = dbSermon;
    relatedSermons = await getRelatedSermons(id, sermon.category);
  }

  const breadcrumbs = [
    { name: "홈", url: BASE_URL },
    { name: "설교 말씀", url: `${BASE_URL}/sermons` },
    { name: sermon.title, url: `${BASE_URL}/sermons/${sermon.id}` },
  ];

  return (
    <>
      <SermonVideoSchema
        id={sermon.id}
        title={sermon.title}
        description={sermon.description}
        youtubeId={sermon.youtubeId}
        publishedAt={sermon.publishedAt}
        thumbnail={sermon.thumbnail}
        scripture={sermon.scripture}
        summary={sermon.summary}
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb nav */}
          <nav
            aria-label="breadcrumb"
            className="flex items-center gap-2 text-sm text-gray-500 mb-4"
          >
            <Link href="/" className="hover:text-primary-700 transition-colors">홈</Link>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            <Link href="/sermons" className="hover:text-primary-700 transition-colors">설교 말씀</Link>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="text-gray-900 font-medium line-clamp-1 max-w-[200px]">
              {sermon.title}
            </span>
          </nav>

          {/* Video player */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-2xl mb-8">
            <div className="relative aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${sermon.youtubeId}?rel=0&modestbranding=1&autoplay=0`}
                title={sermon.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & meta */}
              <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {sermon.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    <time dateTime={new Date(sermon.publishedAt).toISOString()}>
                      {formatDate(sermon.publishedAt)}
                    </time>
                  </div>
                </div>

                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-snug">
                  {sermon.title}
                </h1>

                {sermon.scripture && (
                  <div className="flex items-center gap-2 text-primary-700">
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                    <span className="font-semibold text-sm">{sermon.scripture}</span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-1.5 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">정재광 목사</span>
                  <span>·</span>
                  <span>수원평안교회</span>
                </div>
              </article>

              {/* Summary */}
              {sermon.summary && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                    <span className="w-1 h-6 bg-primary-600 rounded-full" aria-hidden="true" />
                    말씀 요약
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {sermon.summary}
                  </p>
                </div>
              )}

              {/* Interpretation */}
              {sermon.interpretation && (
                <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
                  <h2 className="font-bold text-primary-800 mb-4 flex items-center gap-2 text-lg">
                    <span className="w-1 h-6 bg-primary-600 rounded-full" aria-hidden="true" />
                    말씀 해석 & 적용
                  </h2>
                  <p className="text-primary-900 leading-relaxed whitespace-pre-wrap">
                    {sermon.interpretation}
                  </p>
                </div>
              )}

              {/* Comments */}
              <section
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                aria-labelledby="comments-heading"
              >
                <h2
                  id="comments-heading"
                  className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-lg"
                >
                  <MessageSquare
                    className="w-5 h-5 text-primary-600"
                    aria-hidden="true"
                  />
                  은혜 나눔
                  <span className="text-sm font-normal text-gray-400">
                    ({sermon.comments.length})
                  </span>
                </h2>
                <CommentSection
                  sermonId={sermon.id}
                  initialComments={sermon.comments}
                />
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-5">
              {/* Share */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">말씀 나누기</h3>
                <div className="space-y-2">
                  <a
                    href={`https://www.youtube.com/watch?v=${sermon.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z" />
                    </svg>
                    유튜브에서 보기
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${BASE_URL}/sermons/${sermon.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    페이스북 공유
                  </a>

                  <ShareButton
                    url={`${BASE_URL}/sermons/${sermon.id}`}
                    title={sermon.title}
                    label="링크 공유"
                  />
                </div>
              </div>

              {/* Scripture quick link */}
              {sermon.scripture && (
                <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-xl p-5 text-white">
                  <p className="text-xs text-primary-300 mb-1 font-medium">오늘의 본문</p>
                  <p className="font-bold text-gold-400 text-xl mb-1">{sermon.scripture}</p>
                  <p className="text-primary-200 text-xs mb-3">개역개정</p>
                  <Link
                    href={`/bible?q=${encodeURIComponent(sermon.scripture)}`}
                    className="inline-flex items-center gap-1.5 text-primary-200 hover:text-white text-sm transition-colors"
                  >
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                    성경에서 찾기 →
                  </Link>
                </div>
              )}

              {/* Back button */}
              <Link
                href="/sermons"
                className="flex items-center gap-2 text-gray-600 hover:text-primary-700 transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                전체 설교 목록
              </Link>
            </aside>
          </div>

          {/* Related sermons */}
          {relatedSermons.length > 0 && (
            <section className="mt-12" aria-labelledby="related-heading">
              <div className="flex items-center justify-between mb-6">
                <h2 id="related-heading" className="text-xl font-bold text-gray-900">
                  관련 설교 말씀
                </h2>
                <Link
                  href={`/sermons?category=${encodeURIComponent(sermon.category)}`}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  전체 보기
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {relatedSermons.map((s) => (
                  <SermonCard
                    key={s.id}
                    id={s.id}
                    youtubeId={s.youtubeId}
                    title={s.title}
                    scripture={s.scripture}
                    summary={s.summary}
                    category={s.category}
                    publishedAt={s.publishedAt}
                    thumbnail={s.thumbnail}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

