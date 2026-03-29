import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatDateShort } from "@/lib/utils";
import { ChevronLeft, Edit } from "lucide-react";
import BatchGenerateButton from "@/components/admin/BatchGenerateButton";

export default async function AdminSermonsPage() {
  let sermons: {
    id: string;
    youtubeId: string;
    title: string;
    category: string;
    publishedAt: Date;
    summary: string | null;
    interpretation: string | null;
    scripture: string | null;
  }[] = [];

  try {
    sermons = await prisma.sermon.findMany({
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        youtubeId: true,
        title: true,
        category: true,
        publishedAt: true,
        summary: true,
        interpretation: true,
        scripture: true,
      },
    });
  } catch {
    sermons = [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-2 text-primary-300 hover:text-white text-sm mb-2">
            <ChevronLeft className="w-4 h-4" />
            대시보드
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">설교 관리</h1>
            <BatchGenerateButton />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sermons.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400">
            <p>등록된 설교가 없습니다.</p>
            <p className="text-sm mt-2">대시보드에서 유튜브 동기화를 먼저 진행해주세요.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">제목</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">카테고리</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">날짜</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">완성도</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">편집</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sermons.map((sermon) => (
                  <tr key={sermon.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{sermon.title}</p>
                      {sermon.scripture && (
                        <p className="text-xs text-primary-600 mt-0.5">{sermon.scripture}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                        {sermon.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden md:table-cell">
                      {formatDateShort(sermon.publishedAt)}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex gap-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${sermon.summary ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                          요약 {sermon.summary ? "✓" : "✗"}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${sermon.interpretation ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                          해석 {sermon.interpretation ? "✓" : "✗"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/sermons/${sermon.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <Edit className="w-3 h-3" />
                        편집
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
