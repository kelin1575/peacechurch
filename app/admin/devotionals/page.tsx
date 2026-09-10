import { prisma } from "@/lib/db";
import Link from "next/link";
import { ChevronLeft, Plus, Edit, Trash2, Calendar, AlertTriangle } from "lucide-react";
import DeleteDevotionalButton from "@/components/admin/DeleteDevotionalButton";
import BackfillDevotionalsButton from "@/components/admin/BackfillDevotionalsButton";
import { findMissingDevotionalDates } from "@/lib/backfill-devotionals";

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

async function getMissingCount() {
  try {
    return (await findMissingDevotionalDates()).length;
  } catch {
    return 0;
  }
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
    timeZone: "Asia/Seoul",
  }).format(d);
}

export default async function AdminDevotionalsPage() {
  const [devotionals, missingCount] = await Promise.all([
    getDevotionals(),
    getMissingCount(),
  ]);

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
        {missingCount > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border-2 border-gold-200 bg-gold-50 p-5">
            <AlertTriangle className="w-6 h-6 text-gold-700 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-[240px]">
              <p className="font-bold text-gold-900 mb-1">
                최근 30일 중 {missingCount}일의 묵상이 비어 있습니다
              </p>
              <p className="text-sm text-gold-800 leading-relaxed">
                매일 자동 생성 배치(Netlify)에 <code className="bg-white/60 px-1 rounded">ANTHROPIC_API_KEY</code>가
                없어서 조용히 건너뛰었을 가능성이 높습니다. Netlify 대시보드 → Site
                configuration → Environment variables 에서 확인해 주세요(Vercel과는
                별개로 설정해야 합니다). 아래 버튼을 누르면 빠진 날짜의 묵상을 그때
                시점에 가장 최근이었던 설교를 기준으로 지금 채워 넣습니다.
              </p>
            </div>
            <BackfillDevotionalsButton missingCount={missingCount} />
          </div>
        )}

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
