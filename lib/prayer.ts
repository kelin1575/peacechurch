/** 기도의 벽 분류 — 서버(API 검증)와 화면(필터·배지)이 같은 목록을 봅니다. */
export const PRAYER_CATEGORIES = [
  "감사",
  "치유",
  "가정",
  "진로",
  "구원",
  "교회",
  "기타",
] as const;

export type PrayerCategory = (typeof PRAYER_CATEGORIES)[number];

/** 분류별 색 — 감사는 금빛, 치유는 감람빛으로 감정의 결을 구분합니다. */
export const PRAYER_CATEGORY_STYLE: Record<string, string> = {
  감사: "bg-gold-50 text-gold-700 border-gold-200",
  치유: "bg-olive-50 text-olive-700 border-olive-200",
  가정: "bg-rose-50 text-rose-700 border-rose-200",
  진로: "bg-primary-50 text-primary-700 border-primary-200",
  구원: "bg-violet-50 text-violet-700 border-violet-200",
  교회: "bg-sky-50 text-sky-700 border-sky-200",
  기타: "bg-gray-100 text-gray-600 border-gray-200",
};

export function prayerCategoryStyle(category: string): string {
  return PRAYER_CATEGORY_STYLE[category] ?? PRAYER_CATEGORY_STYLE["기타"];
}

/** "3분 전", "2시간 전" 처럼 지금으로부터 얼마나 지났는지 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}
