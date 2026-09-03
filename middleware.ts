import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * 관리자 영역 보호.
 *
 * /admin 화면과 관리자용 API는 로그인해야 들어올 수 있습니다.
 * 성도들이 쓰는 기능(댓글 달기, 기도제목 올리기, 함께 기도하기)과
 * 배치용 /api/daily-sync(자체 secret 사용)는 그대로 열어 둡니다.
 */

/** 로그인 없이 열어 두어야 하는 경로 */
function isPublic(pathname: string, method: string): boolean {
  // 로그인 화면 자체
  if (pathname === "/admin/login") return true;

  // 성도들이 쓰는 공개 API
  if (pathname === "/api/comments") return true;
  if (pathname.endsWith("/pray")) return true; // 함께 기도합니다
  if (pathname === "/api/prayers") return true; // 기도제목 목록·등록

  // 배치 실행 — 자체 secret 파라미터로 보호되며 외부 스케줄러가 호출합니다
  if (pathname === "/api/daily-sync") return true;

  // 소식 읽기는 공개, 쓰기는 관리자
  if (pathname === "/api/news" && method === "GET") return true;

  return false;
}

/** 로그인이 필요한 경로 */
function needsAuth(pathname: string, method: string): boolean {
  if (isPublic(pathname, method)) return false;

  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/api/devotionals")) return true;
  if (pathname.startsWith("/api/sermons")) return true;
  if (pathname.startsWith("/api/news")) return true;
  if (pathname === "/api/youtube") return true;
  if (pathname === "/api/debug") return true;

  // /api/prayers/{id} 의 숨김·삭제 (하위의 /pray 는 위에서 이미 통과)
  if (pathname.startsWith("/api/prayers/")) return true;

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (!needsAuth(pathname, method)) return NextResponse.next();

  const password = process.env.ADMIN_PASSWORD;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const authorized = await verifySessionToken(token, password);

  if (authorized) return NextResponse.next();

  // API는 화면을 돌려줄 수 없으니 401로 응답합니다.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "관리자 로그인이 필요합니다." },
      { status: 401 }
    );
  }

  // 화면은 로그인 페이지로 보내고, 로그인 후 원래 가려던 곳으로 돌려보냅니다.
  const loginUrl = new URL("/admin/login", request.url);
  const target = pathname + request.nextUrl.search;
  if (target !== "/admin") loginUrl.searchParams.set("next", target);
  if (!password) loginUrl.searchParams.set("setup", "1");

  return NextResponse.redirect(loginUrl);
}

export const config = {
  // ":path*"가 최상위 경로까지 포함하는지는 버전에 따라 다를 수 있어
  // 최상위 경로도 함께 적어 둡니다.
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/devotionals",
    "/api/devotionals/:path*",
    "/api/sermons",
    "/api/sermons/:path*",
    "/api/news",
    "/api/news/:path*",
    "/api/prayers",
    "/api/prayers/:path*",
    "/api/youtube",
    "/api/debug",
  ],
};
