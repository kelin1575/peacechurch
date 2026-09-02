import Link from "next/link";
import { ChevronLeft, Megaphone, Pin, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { NEWS_CATEGORIES, newsCategoryStyle } from "@/lib/news";
import { formatDate } from "@/lib/utils";
import { createNews, deleteNews } from "../actions";

export const dynamic = "force-dynamic";

async function getNews() {
  try {
    return await prisma.news.findMany({
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      take: 100,
    });
  } catch {
    return null; // 표가 아직 없음
  }
}

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const [items, params] = await Promise.all([getNews(), searchParams]);

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

        <div className="flex items-center gap-3 mb-8">
          <Megaphone className="w-6 h-6 text-primary-700" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900">평안소식 관리</h1>
        </div>

        {params.ok && (
          <div className="mb-6 rounded-xl border border-olive-200 bg-olive-50 p-4 text-sm text-olive-800">
            소식이 등록되었습니다.
          </div>
        )}

        {params.error && (
          <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {params.error}
          </div>
        )}

        {items === null && (
          <div className="mb-6 rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm text-gold-800">
            <strong>News 표가 아직 없습니다.</strong> 터미널에서{" "}
            <code className="font-mono">npx prisma db push</code>를 한 번 실행하면
            소식 등록이 열립니다.
          </div>
        )}

        {/* 새 소식 작성 */}
        <form
          action={createNews}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 space-y-4"
        >
          <h2 className="font-bold text-gray-900">새 소식 등록</h2>

          <div>
            <label
              htmlFor="news-title"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              제목
            </label>
            <input
              id="news-title"
              name="title"
              required
              maxLength={120}
              className="input-field"
              placeholder="예) 추수감사절 연합예배 안내"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="news-category"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                분류
              </label>
              <select id="news-category" name="category" className="input-field">
                {NEWS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPinned"
                  className="w-4 h-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                />
                맨 위에 고정 (중요 공지)
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="news-content"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              내용
            </label>
            <textarea
              id="news-content"
              name="content"
              required
              rows={7}
              className="textarea-field"
              placeholder="줄바꿈은 그대로 보입니다."
            />
          </div>

          <button type="submit" className="btn-primary">
            소식 등록
          </button>
        </form>

        {/* 등록된 소식 */}
        <h2 className="font-bold text-gray-900 mb-4">
          등록된 소식 {items ? `(${items.length})` : ""}
        </h2>

        {items && items.length > 0 ? (
          <ul className="space-y-3" role="list">
            {items.map((n) => (
              <li
                key={n.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {n.isPinned && (
                      <Pin className="w-3.5 h-3.5 text-primary-700" aria-hidden="true" />
                    )}
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${newsCategoryStyle(
                        n.category
                      )}`}
                    >
                      {n.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(n.publishedAt)}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {n.content}
                  </p>
                </div>
                <form action={deleteNews} className="flex-shrink-0">
                  <input type="hidden" name="id" value={n.id} />
                  <button
                    type="submit"
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    aria-label={`${n.title} 삭제`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : items ? (
          <p className="text-sm text-gray-400 bg-white border border-gray-200 rounded-xl p-8 text-center">
            등록된 소식이 없습니다.
          </p>
        ) : null}
      </div>
    </div>
  );
}
