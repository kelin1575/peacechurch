/**
 * 교회 기본 정보 한 곳 모음.
 * 예배 시간이 홈·소개·처음 오신 분 페이지에 흩어져 있으면 한 곳만 고치고 다른 곳을
 * 빠뜨리게 됩니다. 시간표가 바뀌면 이 파일만 고치면 됩니다.
 */

export const CHURCH = {
  name: "수원평안교회",
  fullName: "대한예수교장로회 수원평안교회",
  pastor: "정재광",
  pastorTitle: "담임목사",
  phone: "031-292-8119",
  email: "info@peacechurch.kr",
  address: "경기도 수원시 권선구 호매실로 218번길 110",
  addressShort: "수원시 권선구 호매실로 218번길 110",
  youtube: "https://youtube.com/channel/UC9c1llukhxYQ5nma355O-kg",
  naverMap: "https://map.naver.com/v5/search/수원평안교회",
  homepage: "https://www.peacechurch.kr",
} as const;

export interface Service {
  /** 예배 이름 */
  name: string;
  /** 사람이 읽는 시간 표기 */
  time: string;
  place: string;
  /** 0=일 … 6=토 */
  day: number;
  /** 24시간제 시작 시각 (다음 예배 계산용) */
  hour: number;
  minute: number;
  /** 처음 오시는 분께 권하는 예배 */
  recommended?: boolean;
}

/** 주일 예배 */
export const SUNDAY_SERVICES: Service[] = [
  { name: "주일 1부예배", time: "오전 9:00", place: "3층 대예배실", day: 0, hour: 9, minute: 0 },
  { name: "주일 2부예배", time: "오전 11:00", place: "3층 대예배실", day: 0, hour: 11, minute: 0, recommended: true },
  { name: "주일 3부예배", time: "오후 2:00", place: "3층 대예배실", day: 0, hour: 14, minute: 0 },
];

/** 주중 예배 */
export const WEEKDAY_SERVICES: Service[] = [
  { name: "수요예배", time: "오후 8:00", place: "3층 대예배실", day: 3, hour: 20, minute: 0 },
  { name: "금요기도회", time: "오후 8:00", place: "3층 대예배실", day: 5, hour: 20, minute: 0 },
];

export const ALL_SERVICES: Service[] = [...SUNDAY_SERVICES, ...WEEKDAY_SERVICES];

/** 다음세대 예배 */
export const NEXT_GEN_SERVICES = [
  { name: "유아·유치부", time: "주일 오전 11:00", place: "1층 유치부실", age: "4~7세" },
  { name: "아동부 1부", time: "주일 오전 11:00", place: "2층 중예배실", age: "초등" },
  { name: "아동부 2부", time: "주일 오후 2:00", place: "2층 중예배실", age: "초등" },
  { name: "청소년부", time: "주일 오전 9:30", place: "2층 중예배실", age: "중·고등" },
  { name: "청년부", time: "주일 오후 3:30", place: "2층 청년부실", age: "청년" },
  { name: "어와나 Sparks·T&T", time: "주일 오후 3:30", place: "4층 체육관", age: "유·초등" },
  { name: "어와나 Trek·Journey", time: "토요일 오전 10:00", place: "4층 체육관", age: "중·고등" },
  { name: "영어주일학교(RTA)", time: "주일 오후 2:00", place: "2층 유년부실", age: "전 연령" },
];

/** 층별 안내 — 처음 오신 분이 건물 안에서 길을 잃지 않도록 */
export const FLOORS = [
  { floor: "1층", label: "유아·유치부실, 안내데스크" },
  { floor: "2층", label: "중예배실(아동·청소년부), 청년부실, 유년부실" },
  { floor: "3층", label: "대예배실 — 주일·수요·금요 예배" },
  { floor: "4층", label: "체육관 — 어와나" },
];

const DAY_LABEL = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 지금(한국 시간) 기준으로 가장 먼저 돌아오는 예배를 반환합니다.
 * 서버가 UTC로 도는 환경(Vercel)에서도 한국 시간으로 계산합니다.
 */
export function getNextService(now: Date = new Date()): {
  service: Service;
  /** "오늘" · "내일" · "일요일" 같은 사람이 읽는 표기 */
  whenLabel: string;
  isToday: boolean;
} {
  // UTC 기준 시각을 KST로 옮긴 뒤 UTC getter로 읽으면 서버 위치와 무관하게 한국 시간이 나옵니다.
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const day = kst.getUTCDay();
  const minutesNow = kst.getUTCHours() * 60 + kst.getUTCMinutes();

  let best: Service = SUNDAY_SERVICES[1];
  let bestDelta = Number.POSITIVE_INFINITY;
  let bestDayDelta = 0;

  for (const s of ALL_SERVICES) {
    let dayDelta = (s.day - day + 7) % 7;
    const startMinutes = s.hour * 60 + s.minute;
    // 오늘 예배인데 이미 시작 시각이 지났다면 다음 주로 넘깁니다.
    if (dayDelta === 0 && startMinutes <= minutesNow) dayDelta = 7;
    const delta = dayDelta * 1440 + startMinutes - minutesNow;
    if (delta < bestDelta) {
      bestDelta = delta;
      bestDayDelta = dayDelta;
      best = s;
    }
  }

  // 며칠 뒤인지는 달력상의 날짜 차이로 판단합니다. 남은 분(分)으로 나누면
  // 화요일 밤 → 수요일 저녁처럼 24시간이 안 되는 경우를 "오늘"로 잘못 읽습니다.
  const whenLabel =
    bestDayDelta === 0 ? "오늘" : bestDayDelta === 1 ? "내일" : `${DAY_LABEL[best.day]}요일`;

  return { service: best, whenLabel, isToday: bestDayDelta === 0 };
}
