import Link from "next/link";
import { ChevronLeft, HeartHandshake, Eye, EyeOff, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { prayerCategoryStyle, timeAgo } from "@/lib/prayer";
import { setPrayerStatus, deletePrayer, runDailyPrayer } from "../actions";

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

export default async function AdminPrayersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const [prayers, params] = await Promise.all([getPrayers(), searchParams]);
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

        {params.ok && (
          <div className="mb-6 rounded-xl border border-olive-200 bg-olive-50 p-4 text-sm text-olive-800">
            {params.ok}
          </div>
        )}
        {params.error && (
          <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {params.error}
          </div>
        )}

        {/* 매일 아침 배치가 올리는 공동 기도제목 — 확인용 수동 실행 */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px]">
            <p className="font-semibold text-gray-900 text-sm mb-1">
              오늘의 공동 기도제목
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              매일 아침 6시에 교회 이름으로 기도제목 하나가 자동으로 올라갑니다.
              요일마다 주제가 다릅니다 — 주일 예배, 월 가정, 화 다음세대,
              수 교회, 목 이웃, 금 나라와 열방, 토 회복.
            </p>
          </div>
          <form action={runDailyPrayer}>
            <button type="submit" className="btn-secondary text-sm py-2.5">
              지금 올려보기
            </button>
          </form>
        </div>

        {prayers === null && (
          <div className="mb-6 rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm text-gold-800">
            <strong>기도제목을 저장할 표가 아직 없습니다.</strong>{" "}
            <Link href="/admin" className="font-semibold underline underline-offset-2">
              관리자 홈
            </Link>
            의 &ldquo;표 만들기&rdquo; 버튼을 한 번 눌러 주세요.
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
                      {p.isOfficial && (
                        <span className="text-xs font-semibold text-primary-700">
                          교회
                        </span>
                      )}
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
