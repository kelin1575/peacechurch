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
