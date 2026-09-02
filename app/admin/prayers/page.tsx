import Link from "next/link";
import { ChevronLeft, HeartHandshake, Eye, EyeOff, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { prayerCategoryStyle, timeAgo } from "@/lib/prayer";
import { setPrayerStatus, deletePrayer } from "../actions";

export const dynamic = "force-dynamic";

async function getPrayers() {
  try {
    return await prisma.prayerRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  } catch {
    return null;
  }
}

export default async function AdminPrayersPage() {
  const prayers = await getPrayers();
  const hiddenCount = prayers?.filter((p) => p.status === "hidden").length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-page py-8 max-w-5xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-700 mb-5"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          관리자 홈
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <HeartHandshake className="w-6 h-6 text-primary-700" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900">기도의 벽 관리</h1>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          기도제목은 올라오는 즉시 공개됩니다. 부적절한 글은 여기서 바로 숨기실 수 있습니다.
          {hiddenCount > 0 && (
            <span className="ml-1 text-gray-400">· 숨김 {hiddenCount}건</span>
          )}
        </p>

        {prayers === null && (
          <div className="mb-6 rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm text-gold-800">
            <strong>PrayerRequest 표가 아직 없습니다.</strong> 터미널에서{" "}
            <code className="font-mono">npx prisma db push</code>를 한 번 실행해 주세요.
          </div>
        )}

        {prayers && prayers.length > 0 ? (
          <ul className="space-y-3" role="list">
            {prayers.map((p) => {
              const hidden = p.status === "hidden";
              return (
                <li
                  key={p.id}
                  className={`rounded-xl border p-5 flex gap-4 ${
                    hidden
                      ? "bg-gray-100 border-gray-200 opacity-70"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${prayerCategoryStyle(
                          p.category
                        )}`}
                      >
                        {p.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {p.author} · {timeAgo(p.createdAt)} · 중보 {p.prayCount}
                      </span>
                      {hidden && (
                        <span className="text-xs font-semibold text-rose-600">
                          숨김
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {p.content}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <form action={setPrayerStatus}>
                      <input type="hidden" name="id" value={p.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={hidden ? "published" : "hidden"}
                      />
                      <button
                        type="submit"
                        className="p-2 text-gray-400 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                        aria-label={hidden ? "다시 공개" : "숨기기"}
                        title={hidden ? "다시 공개" : "숨기기"}
                      >
                        {hidden ? (
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <EyeOff className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </form>
                    <form action={deletePrayer}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        aria-label="영구 삭제"
                        title="영구 삭제"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : prayers ? (
          <p className="text-sm text-gray-400 bg-white border border-gray-200 rounded-xl p-8 text-center">
            올라온 기도제목이 없습니다.
          </p>
        ) : null}
      </div>
    </div>
  );
}
