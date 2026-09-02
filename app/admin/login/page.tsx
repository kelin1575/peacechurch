import type { Metadata } from "next";
import Link from "next/link";
import { Lock, AlertTriangle, ChevronLeft } from "lucide-react";
import { login } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자 로그인",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; setup?: string }>;
}) {
  const params = await searchParams;
  const needsSetup = params.setup === "1";

  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-700 mb-6"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          교회 홈으로
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-7">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mb-5">
            <Lock className="w-6 h-6" aria-hidden="true" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-1">관리자 로그인</h1>
          <p className="text-sm text-gray-500 mb-6">
            설교·묵상·기도·소식을 관리하는 화면입니다.
          </p>

          {needsSetup ? (
            <div
              role="alert"
              className="rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm text-gold-800 leading-relaxed"
            >
              <p className="flex items-center gap-2 font-semibold mb-2">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                비밀번호가 아직 설정되지 않았습니다
              </p>
              <p>
                Vercel 대시보드 → 프로젝트 → <strong>Settings</strong> →{" "}
                <strong>Environment Variables</strong> 에서{" "}
                <code className="font-mono bg-white/70 px-1 rounded">
                  ADMIN_PASSWORD
                </code>{" "}
                를 추가하고 재배포하시면 이 화면에서 로그인하실 수 있습니다.
              </p>
              <p className="mt-2 text-gold-700">
                설정 전까지는 안전을 위해 관리자 화면이 잠겨 있습니다.
              </p>
            </div>
          ) : (
            <form action={login} className="space-y-4">
              <input type="hidden" name="next" value={params.next ?? "/admin"} />

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  비밀번호
                </label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  required
                  autoFocus
                  autoComplete="current-password"
                  className="input-field"
                  placeholder="관리자 비밀번호"
                />
              </div>

              {params.error && (
                <p role="alert" className="text-sm text-rose-600">
                  {params.error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full py-3">
                로그인
              </button>
            </form>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-5 leading-relaxed">
          비밀번호를 잊으셨다면 Vercel 환경변수의 ADMIN_PASSWORD 값을
          <br />
          새로 바꾸고 재배포하시면 됩니다.
        </p>
      </div>
    </div>
  );
}
