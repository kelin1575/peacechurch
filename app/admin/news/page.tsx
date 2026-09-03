import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Megaphone, Pin, Trash2, FileText } from "lucide-react";
import { prisma } from "@/lib/db";
import { NEWS_CATEGORIES, newsCategoryStyle } from "@/lib/news";
import { formatDate } from "@/lib/utils";
import { createNews, deleteNews, runWeeklyBulletin } from "../actions";

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
            <strong>소식을 저장할 표가 아직 없습니다.</strong>{" "}
            <Link href="/admin" className="font-semibold underline underline-offset-2">
              관리자 홈
            </Link>
            의 &ldquo;표 만들기&rdquo; 버튼을 한 번 누르시면 소식 등록이 열립니다.
          </div>
        )}

        {/* 주보에서 자동으로 읽어오기 */}
        <div className="mb-8 rounded-xl border border-primary-200 bg-primary-50 p-5 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px]">
            <p className="font-semibold text-primary-900 text-sm mb-1">
              주보에서 교회소식 가져오기
            </p>
            <p className="text-sm text-primary-800 leading-relaxed">
              <strong>매주 일요일 오전 7시</strong>에 이번 주 주보를 읽어 교회소식과
              주보 이미지를 자동으로 올립니다. 읽어온 내용이 확실하지 않으면
              올리지 않고 넘어가니, 그럴 때는 미리보기에서 확인하고 직접 올려 주세요.
              같은 주보가 두 번 올라가지도 않습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/news/preview" className="btn-secondary text-sm py-2.5">
              <FileText className="w-4 h-4" aria-hidden="true" />
              주보 미리보기
            </Link>
            <form action={runWeeklyBulletin}>
              <button type="submit" className="btn-primary text-sm py-2.5">
                지금 가져오기
              </button>
            </form>
          </div>
        </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-gray-100">
            <div>
              <label
                htmlFor="news-image"
                className="block text-sm font-medium text-gray-700 mb-1.5 mt-4"
              >
                주보 이미지 주소 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                id="news-image"
                name="imageUrl"
                type="url"
                className="input-field text-sm"
                placeholder="http://data.dimode.co.kr/UserData/pyunganch/files/46/..."
              />
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                교회 홈페이지 주보 이미지를 오른쪽 클릭 → &ldquo;이미지 주소 복사&rdquo; 하여
                붙여넣으세요. peacechurch.kr 또는 data.dimode.co.kr 주소만 받습니다.
              </p>
            </div>
            <div>
              <label
                htmlFor="news-source"
                className="block text-sm font-medium text-gray-700 mb-1.5 mt-4"
              >
                원본 주보 글 주소 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                id="news-source"
                name="sourceUrl"
                type="url"
                className="input-field text-sm"
                placeholder="https://www.peacechurch.kr/Board/Index/46"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                넣으시면 소식 아래에 &ldquo;원문 보기&rdquo; 링크가 붙습니다.
              </p>
            </div>
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
                {n.imageUrl && (
                  <div className="w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                    <Image
                      src={n.imageUrl}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                )}
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
