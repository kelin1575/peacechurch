/**
 * 수원평안교회 유튜브 영상 타이틀 파서
 *
 * 새 타이틀 형식 (부서/콘텐츠 태그를 대괄호로 표시):
 *   2026.03.29 [아동부] 다윗과 골리앗 000전도사
 *   2026.03.29 [주일예배] 포도나무와 가지 정재광목사
 *   2026.03.29 [Shorts] 오늘의 말씀 한 줄
 *
 * 예전 타이틀 형식 (예배 순서를 그대로 풀어 쓴 것 — 과거 영상 호환용):
 *   2026.03.29 주일2부예배 수원평안교회 포도나무와 가지 정재광목사
 *   20240310 수요예배 수원평안교회 말씀제목 이름전도사
 */

export interface ParsedSermonTitle {
  category: string;   // 분류 (아동부, 주일예배, 홍보영상, …)
  sermonTitle: string; // 말씀 제목
  minister?: string;  // 담당 목사 / 전도사
  parsedDate?: Date;  // 파싱된 날짜
}

/**
 * 채널에서 실제로 쓰는 대괄호 태그 → 분류.
 * 한 분류에 여러 표기가 매핑될 수 있습니다(예: 홍보영상 태그가 실제로는
 * [소개영상]·[후기영상]으로 따로 붙는 경우). 순서는 중요하지 않지만,
 * 서로 다른 분류의 키워드가 겹치지 않도록 주의해서 골랐습니다.
 */
const CATEGORY_RULES: { category: string; keywords: string[] }[] = [
  { category: "해피밀", keywords: ["해피밀"] },
  { category: "홍보영상", keywords: ["홍보영상", "소개영상", "후기영상"] },
  { category: "아동부", keywords: ["아동부"] },
  { category: "유아유치부", keywords: ["유아유치부", "유아부", "유치부"] },
  { category: "청소년부", keywords: ["청소년부", "중고등부"] },
  { category: "어와나", keywords: ["어와나", "AWANA", "Awana"] },
  { category: "미니홈피", keywords: ["미니홈피"] },
  { category: "Shorts", keywords: ["Shorts", "SHORTS", "shorts", "쇼츠"] },
  {
    category: "주일예배",
    keywords: ["주일예배", "주일1부예배", "주일2부예배", "주일3부예배", "주일1부", "주일2부", "주일3부"],
  },
];

/**
 * 예전 방식(대괄호 태그 없이 예배 순서를 그대로 풀어 쓴 제목)을 위한
 * 예비 규칙. 위 CATEGORY_RULES 에서 아무것도 매칭되지 않을 때만 씁니다.
 * 순서 중요 — 더 구체적인 것 먼저.
 */
const LEGACY_WORSHIP_GROUPS = [
  "주일1부예배",
  "주일2부예배",
  "주일3부예배",
  "주일청년예배",
  "주일어린이예배",
  "주일예배",
  "수요예배",
  "수요기도회",
  "새벽기도회",
  "새벽기도",
  "금요기도회",
  "금요예배",
  "청년예배",
  "어린이예배",
  "특별집회",
  "부흥집회",
  "사경회",
];

export function parseSermonTitle(rawTitle: string): ParsedSermonTitle {
  let s = rawTitle;

  // 1) 날짜 추출 (YYYY.MM.DD / YYYY-MM-DD / YYYYMMDD)
  let parsedDate: Date | undefined;
  const dateRe = /(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})|(\d{4})(\d{2})(\d{2})/;
  const dateMatch = s.match(dateRe);
  if (dateMatch) {
    if (dateMatch[1]) {
      parsedDate = new Date(`${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`);
    } else {
      parsedDate = new Date(`${dateMatch[4]}-${dateMatch[5]}-${dateMatch[6]}`);
    }
    if (isNaN(parsedDate.getTime())) parsedDate = undefined;
    s = s.replace(dateMatch[0], "").trim();
  }

  // 2) 교회명 제거
  s = s.replace(/수원평안교회/g, "").trim();

  // 3) 분류 추출 — 새 대괄호 태그 방식을 먼저 시도하고,
  //    못 찾으면 예전 예배순서 문자열 방식으로 폴백합니다.
  let category: string | null = null;

  for (const rule of CATEGORY_RULES) {
    const hit = rule.keywords.find((kw) => s.includes(kw));
    if (hit) {
      category = rule.category;
      s = s.replace(hit, "").trim();
      break;
    }
  }

  if (!category) {
    for (const group of LEGACY_WORSHIP_GROUPS) {
      // 공백 유연 매칭: "주일 2부 예배" → "주일2부예배"
      const pattern = new RegExp(group.split("").join("\\s*"), "i");
      if (pattern.test(s)) {
        category = group === "주일1부예배" || group === "주일2부예배" || group === "주일3부예배"
          ? "주일예배"
          : group;
        s = s.replace(pattern, "").trim();
        break;
      }
    }
  }

  if (!category) category = "주일예배";

  // 4) 담당자 추출 (목사 / 전도사 / 강도사 / 장로 앞에 이름)
  let minister: string | undefined;
  const ministerRe = /([가-힣]{2,5})\s*(목사|전도사|강도사|장로|선교사)/;
  const ministerMatch = s.match(ministerRe);
  if (ministerMatch) {
    minister = `${ministerMatch[1]}${ministerMatch[2]}`;
    s = s.replace(ministerMatch[0], "").trim();
  }

  // 5) 구분자 · 특수문자 정리 → 남은 것이 말씀 제목
  const sermonTitle = s
    .replace(/[|｜\[\]()（）\-_,，·•]/g, " ")
    .replace(/\s+/g, " ")
    .trim() || rawTitle;

  return { category, sermonTitle, minister, parsedDate };
}
