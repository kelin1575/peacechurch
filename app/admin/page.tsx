import Link from "next/link";
import { prisma } from "@/lib/db";
import { LayoutDashboard, BookOpen, MessageSquare, Youtube, Calendar, Plus } from "lucide-react";
import YoutubeSyncButton from "@/components/admin/YoutubeSyncButton";

async function getStats() {
  try {
    const [sermonCount, commentCount, devotionalCount] = await Promise.all([
      prisma.sermon.count(),
      prisma.comment.count(),
      prisma.devotional.count(),
    ]);
    return { sermonCount, commentCount, devotionalCount };
  } catch {
    return { sermonCount: 0, commentCount: 0, devotionalCount: 0 };
  }
}

async function getRecentSermons() {
  try {
    return await prisma.sermon.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const [stats, recentSermons] = await Promise.all([
    getStats(),
    getRecentSermons(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary-300" />
            <div>
              <h1 className="text-2xl font-bold">관리자 대시보드</h1>
              <p className="text-primary-300 text-sm">수원평안교회 콘텐츠 관리</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Youtube,
              label: "총 설교",
              value: stats.sermonCount,
              color: "text-red-600 bg-red-50",
            },
            {
              icon: MessageSquare,
              label: "총 댓글",
              value: stats.commentCount,
              color: "text-blue-600 bg-blue-50",
            },
            {
              icon: Calendar,
              label: "총 묵상",
              value: stats.devotionalCount,
              color: "text-green-600 bg-green-50",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">빠른 작업</h2>
            <div className="space-y-3">
              <YoutubeSyncButton />

              <Link
                href="/admin/devotional/new"
                className="w-full flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
              >
                <Plus className="w-5 h-5" />
                오늘의 묵상 등록
              </Link>

              <Link
                href="/admin/sermons"
                className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <BookOpen className="w-5 h-5" />
                설교 요약/해석 편집
              </Link>
            </div>
          </div>

          {/* Recent sermons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">최근 등록 설교</h2>
            {recentSermons.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                등록된 설교가 없습니다.
                <br />
                유튜브 동기화를 진행해 주세요.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentSermons.map((sermon) => (
                  <li key={sermon.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-100 rounded flex-shrink-0 overflow-hidden">
                      {sermon.thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={sermon.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {sermon.title}
                      </p>
                      <p className="text-xs text-gray-400">{sermon.category}</p>
                    </div>
                    <Link
                      href={`/admin/sermons/${sermon.id}`}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      편집
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

