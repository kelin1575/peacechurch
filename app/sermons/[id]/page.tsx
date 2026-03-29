import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { BookOpen, Calendar, Share2, ChevronLeft, MessageSquare } from "lucide-react";
import CommentSection from "@/components/CommentSection";

async function getSermon(id: string) {
  try {
    const sermon = await prisma.sermon.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });
    return sermon;
  } catch {
    return null;
  }
}

export default async function SermonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Check if it's a YouTube video ID (11 chars) or DB id
  let sermon;
  if (id.length === 11) {
    // YouTube video ID - create a virtual sermon
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
      comments: [],
    };
  } else {
    sermon = await getSermon(id);
    if (!sermon) notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link
          href="/sermons"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-700 transition-colors text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          설교 목록으로
        </Link>

        {/* Video player */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-xl mb-8">
          <div className="relative aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${sermon.youtubeId}?rel=0&modestbranding=1`}
              title={sermon.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & meta */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-primary-100 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">
                  {sermon.category}
                </span>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(sermon.publishedAt)}
                </div>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                {sermon.title}
              </h1>
              {sermon.scripture && (
                <div className="flex items-center gap-2 text-primary-700">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium text-sm">{sermon.scripture}</span>
                </div>
              )}
            </div>

            {/* Summary */}
            {sermon.summary && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary-600 rounded-full" />
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
                <h2 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary-600 rounded-full" />
                  말씀 해석 & 적용
                </h2>
                <p className="text-primary-900 leading-relaxed whitespace-pre-wrap">
                  {sermon.interpretation}
                </p>
              </div>
            )}

            {/* Comments */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                은혜 나눔 ({sermon.comments.length})
              </h2>
              <CommentSection sermonId={sermon.id} initialComments={sermon.comments} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z"/>
                  </svg>
                  유튜브에서 보기
                </a>
                <ShareButton title={sermon.title} youtubeId={sermon.youtubeId} />
              </div>
            </div>

            {/* Scripture */}
            {sermon.scripture && (
              <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-xl p-5 text-white">
                <p className="text-xs text-primary-300 mb-2 font-medium">본문 말씀</p>
                <p className="font-bold text-gold-400 text-lg">{sermon.scripture}</p>
                <Link
                  href={`/bible?q=${encodeURIComponent(sermon.scripture)}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-primary-200 hover:text-white text-xs transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  성경에서 찾기
                </Link>
              </div>
            )}

            {/* Navigation tip */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1 font-medium">
                더 많은 말씀 보기
              </p>
              <Link
                href="/sermons"
                className="text-primary-700 font-semibold text-sm hover:text-primary-800 transition-colors"
              >
                전체 설교 목록 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareButton({ title, youtubeId }: { title: string; youtubeId: string }) {
  return (
    <button
      onClick={() => {
        if (navigator.share) {
          navigator.share({
            title,
            url: `https://www.youtube.com/watch?v=${youtubeId}`,
          });
        } else {
          navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${youtubeId}`);
          alert("링크가 복사되었습니다.");
        }
      }}
      className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
      suppressHydrationWarning
    >
      <Share2 className="w-4 h-4" />
      링크 공유
    </button>
  );
}
