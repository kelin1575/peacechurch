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

  // 설정 여부는 주소창의 ?setup=1 이 아니라 이 페이지가 직접 환경변수를 읽어
  // 판단합니다. 주소로만 판단하면, 비밀번호를 설정한 뒤에도 예전 주소를
  // 새로고침하는 동안 계속 "설정 필요" 화면이 나옵니다.
  const configured = Boolean(process.env.ADMIN_PASSWORD);
  const needsSetup = !configured;

  // 미들웨어는 설정이 안 됐다고 보냈는데 이 페이지에서는 값이 보이는 경우.
  // 환경변수를 추가한 뒤의 첫 방문이거나, 미들웨어가 예전 빌드로 돌고 있다는 뜻입니다.
  const staleSetupHint = configured && params.setup === "1";

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
              {staleSetupHint && (
                <p className="rounded-lg bg-olive-50 border border-olive-200 px-3 py-2.5 text-sm text-olive-800">
                  비밀번호 설정이 확인되었습니다. 아래에서 로그인해 주세요.
                </p>
              )}
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
