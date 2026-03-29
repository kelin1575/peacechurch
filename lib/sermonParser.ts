/**
 * 수원평안교회 유튜브 영상 타이틀 파서
 *
 * 타이틀 형식 예시:
 *   2026.03.29 주일2부예배 수원평안교회 포도나무와 가지 정재광목사
 *   20240310 수요예배 수원평안교회 말씀제목 이름전도사
 *   2025.12.25 특별집회 수원평안교회 제목 강사이름목사
 */

export interface ParsedSermonTitle {
  category: string;   // 예배 구분 (주일1부예배, 수요예배, …)
  sermonTitle: string; // 말씀 제목
  minister?: string;  // 담당 목사 / 전도사
  parsedDate?: Date;  // 파싱된 날짜
}

// 예배 그룹 목록 (순서 중요 — 더 구체적인 것 먼저)
const WORSHIP_GROUPS = [
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

  // 3) 예배 구분 추출 (공백 무시 매칭)
  let category = "주일예배";
  for (const group of WORSHIP_GROUPS) {
    // 공백 유연 매칭: "주일 2부 예배" → "주일2부예배"
    const pattern = new RegExp(group.split("").join("\\s*"), "i");
    if (pattern.test(s)) {
      category = group;
      s = s.replace(pattern, "").trim();
      break;
    }
  }

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
