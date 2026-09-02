/**
 * 관리자 로그인.
 *
 * 비밀번호는 ADMIN_PASSWORD 환경변수 하나로 관리합니다. 로그인에 성공하면
 * 서명된 토큰을 httpOnly 쿠키에 담아두고, 이후 요청마다 그 서명을 다시 계산해
 * 확인합니다. 서명 키가 비밀번호 자체이므로 비밀번호를 바꾸면 기존 로그인은
 * 모두 자동으로 풀립니다.
 *
 * 미들웨어(Edge)와 서버 액션(Node) 양쪽에서 쓰이므로, 두 곳 모두에 있는
 * Web Crypto만 사용합니다.
 */

export const ADMIN_COOKIE = "pc_admin";

/** 로그인 유지 기간 (7일) */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function toBase64Url(bytes: ArrayBuffer): string {
  const b = new Uint8Array(bytes);
  let s = "";
  for (const byte of b) s += String.fromCharCode(byte);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toBase64Url(sig);
}

/** 길이와 무관하게 같은 시간이 걸리도록 비교합니다. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** 로그인 성공 시 쿠키에 담을 토큰을 만듭니다. */
export async function createSessionToken(password: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = String(expiresAt);
  return `${payload}.${await sign(password, payload)}`;
}

/** 쿠키의 토큰이 유효한지 확인합니다. */
export async function verifySessionToken(
  token: string | undefined,
  password: string | undefined
): Promise<boolean> {
  if (!token || !password) return false;

  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  return safeEqual(signature, await sign(password, payload));
}
