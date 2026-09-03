import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
} from "lucide-react";
import { fetchLatestBulletin, DEFAULT_BOARD_URL } from "@/lib/bulletin";
import { createNews } from "../../actions";
import { NEWS_CATEGORIES } from "@/lib/news";

export const dynamic = "force-dynamic";

/**
 * 주보 미리보기.
 *
 * 교회 홈페이지에서 이번 주 주보를 읽어 무엇을 뽑았는지 보여줍니다.
 * 이 화면에서는 아무것도 저장하지 않습니다. 내용을 확인한 뒤
 * 아래 "이대로 등록하기"를 눌러야 평안소식에 올라갑니다.
 *
 * 읽어온 내용은 외부에서 온 것이므로 HTML 로 해석하지 않고
 * 전부 글자 그대로만 보여줍니다.
 */
export default async function BulletinPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const params = await searchParams;
  const boardUrl = params.url?.startsWith("http") ? params.url : DEFAULT_BOARD_URL;
  const result = await fetchLatestBulletin(boardUrl);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-page py-8 max-w-4xl">
        <Link
          href="/admin/news"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-700 mb-5"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          평안소식 관리
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-primary-700" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900">주보 미리보기</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          교회 홈페이지에서 이번 주 주보를 읽어봤습니다.{" "}
          <strong className="text-gray-700">이 화면에서는 아무것도 저장하지 않습니다.</strong>
        </p>

        {/* 판정 */}
        <div
          className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
            result.confident
              ? "border-olive-200 bg-olive-50 text-olive-800"
              : "border-gold-200 bg-gold-50 text-gold-800"
          }`}
        >
          {result.confident ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <p className="leading-relaxed">{result.message}</p>
        </div>

        {/* 어떻게 찾았는지 */}
        <section className="mb-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
          <h2 className="px-5 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900 text-sm">
            읽어온 과정
          </h2>
          <ul className="divide-y divide-gray-100" role="list">
            {result.steps.map((s, i) => (
              <li key={i} className="px-5 py-3 flex gap-3">
                <span
                  className={`mt-0.5 flex-shrink-0 ${
                    s.ok ? "text-olive-600" : "text-gold-600"
                  }`}
                  aria-hidden="true"
                >
                  {s.ok ? "✓" : "!"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{s.label}</p>
                  <p className="text-xs text-gray-500 break-all mt-0.5 leading-relaxed">
                    {s.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 뽑아낸 내용 */}
        {result.ok && (
          <form
            action={createNews}
            className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 mb-6"
          >
            <h2 className="font-bold text-gray-900">
              이대로 등록하기
            </h2>
            <p className="text-sm text-gray-500 -mt-2">
              틀린 곳이 있으면 여기서 고쳐서 등록하실 수 있습니다.
            </p>

            <div>
              <label htmlFor="p-title" className="block text-sm font-medium text-gray-700 mb-1.5">
                제목
              </label>
              <input
                id="p-title"
                name="title"
                defaultValue={result.title}
                required
                maxLength={120}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="p-cat" className="block text-sm font-medium text-gray-700 mb-1.5">
                  분류
                </label>
                <select id="p-cat" name="category" className="input-field" defaultValue="교회소식">
                  {NEWS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
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
                  맨 위에 고정
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="p-content" className="block text-sm font-medium text-gray-700 mb-1.5">
                교회소식 본문
              </label>
              <textarea
                id="p-content"
                name="content"
                required
                rows={12}
                defaultValue={result.content ?? ""}
                className="textarea-field text-sm font-mono"
              />
            </div>

            <div>
              <label htmlFor="p-image" className="block text-sm font-medium text-gray-700 mb-1.5">
                주보 이미지 주소
              </label>
              {result.imageCandidates.length > 1 ? (
                <select
                  id="p-image"
                  name="imageUrl"
                  className="input-field text-sm"
                  defaultValue={result.imageUrl}
                >
                  <option value="">(이미지 없이 등록)</option>
                  {result.imageCandidates.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              ) : (
                <input
                  id="p-image"
                  name="imageUrl"
                  type="url"
                  defaultValue={result.imageUrl ?? ""}
                  className="input-field text-sm"
                />
              )}
            </div>

            <div>
              <label htmlFor="p-source" className="block text-sm font-medium text-gray-700 mb-1.5">
                원본 주보 글 주소
              </label>
              <input
                id="p-source"
                name="sourceUrl"
                type="url"
                defaultValue={result.sourceUrl ?? ""}
                className="input-field text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <button type="submit" className="btn-primary">
                이대로 평안소식에 등록
              </button>
              <Link href="/admin/news/preview" className="btn-secondary">
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                다시 읽기
              </Link>
            </div>
          </form>
        )}

        {/* 이미지 미리보기 */}
        {result.imageUrl && (
          <section className="mb-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
            <h2 className="px-5 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900 text-sm">
              주보 이미지
            </h2>
            <div className="p-5">
              <Image
                src={result.imageUrl}
                alt="주보 미리보기"
                width={1600}
                height={2260}
                quality={90}
                sizes="(max-width: 768px) 100vw, 900px"
                className="w-full h-auto rounded-lg border border-gray-100"
              />
              <p className="mt-3 text-xs text-gray-400 break-all">
                {result.imageUrl}
              </p>
            </div>
          </section>
        )}

        {/* 규칙을 다듬기 위한 원본 조각 */}
        <details className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <summary className="px-5 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900 text-sm cursor-pointer">
            읽어온 원본 HTML 앞부분 (문제가 있을 때 개발자에게 보여주세요)
          </summary>
          <pre className="p-5 text-[11px] leading-relaxed text-gray-600 overflow-x-auto whitespace-pre-wrap break-all max-h-[420px]">
            {result.htmlSample ?? "(없음)"}
          </pre>
        </details>
      </div>
    </div>
  );
}
