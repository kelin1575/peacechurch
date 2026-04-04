import { prisma } from "@/lib/db";
import Link from "next/link";
import { ChevronLeft, Plus, Edit, Trash2, Calendar } from "lucide-react";
import DeleteDevotionalButton from "@/components/admin/DeleteDevotionalButton";

export const dynamic = "force-dynamic";

async function getDevotionals() {
  try {
    return await prisma.devotional.findMany({
      orderBy: { date: "desc" },
    });
  } catch {
    return [];
  }
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
    timeZone: "Asia/Seoul",
  }).format(d);
}

export default async function AdminDevotionalsPage() {
  const devotionals = await getDevotionals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-900 text-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-2 text-primary-300 hover:text-white text-sm mb-2">
            <ChevronLeft className="w-4 h-4" />
            대시보드
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">묵상 관리</h1>
              <p className="text-primary-300 text-sm mt-0.5">총 {devotionals.length}개</p>
            </div>
            <Link
              href="/admin/devotional/new"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              새 묵상 등록
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {devotionals.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">등록된 묵상이 없습니다.</p>
            <p className="text-sm mt-1">새 묵상을 등록하거나 배치를 실행해주세요.</p>
            <Link href="/admin/devotional/new" className="inline-block mt-4 bg-green-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-600">
              첫 묵상 등록하기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {devotionals.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex gap-4 items-start hover:border-primary-200 transition-colors">
                {/* 날짜 배지 */}
                <div className="flex-shrink-0 w-16 text-center">
                  <div className="bg-primary-50 rounded-lg p-2">
                    <p className="text-xs text-primary-500 font-medium">
                      {new Intl.DateTimeFormat("ko-KR", { month: "short", timeZone: "Asia/Seoul" }).format(d.date)}
                    </p>
                    <p className="text-2xl font-bold text-primary-700 leading-none">
                      {new Intl.DateTimeFormat("ko-KR", { day: "numeric", timeZone: "Asia/Seoul" }).format(d.date).replace("일", "")}
                    </p>
                    <p className="text-xs text-primary-400">
                      {new Intl.DateTimeFormat("ko-KR", { weekday: "short", timeZone: "Asia/Seoul" }).format(d.date)}
                    </p>
                  </div>
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary-600 font-medium mb-1">{d.scripture}</p>
                  <h3 className="font-bold text-gray-900 mb-1">{d.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{d.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(d.date)}</p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex-shrink-0 flex gap-2">
                  <Link
                    href={`/admin/devotionals/${d.id}/edit`}
                    className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    수정
                  </Link>
                  <DeleteDevotionalButton id={d.id} title={d.title} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
