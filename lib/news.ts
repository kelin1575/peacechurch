/** 평안소식 분류 */
export const NEWS_CATEGORIES = ["교회소식", "행사", "선교", "광고"] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const NEWS_CATEGORY_STYLE: Record<string, string> = {
  교회소식: "bg-primary-50 text-primary-700 border-primary-200",
  행사: "bg-gold-50 text-gold-700 border-gold-200",
  선교: "bg-olive-50 text-olive-700 border-olive-200",
  광고: "bg-gray-100 text-gray-600 border-gray-200",
};

export function newsCategoryStyle(category: string): string {
  return NEWS_CATEGORY_STYLE[category] ?? NEWS_CATEGORY_STYLE["광고"];
}


/** 주보 이미지를 받아올 수 있는 호스트 (교회 홈페이지와 그 CMS) */
export const ALLOWED_IMAGE_HOSTS = [
  "peacechurch.kr",
  "www.peacechurch.kr",
  "data.dimode.co.kr",
];

/**
 * 이미지 주소가 교회가 쓰는 곳의 것인지 확인합니다.
 * next.config.ts 의 remotePatterns 와 같은 목록을 봅니다 — 한쪽만 열려 있으면
 * 저장은 되는데 화면에 안 나오는 일이 생깁니다.
 */
export function isAllowedImageHost(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== "http:" && protocol !== "https:") return false;
    return ALLOWED_IMAGE_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}
