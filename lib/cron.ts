import type { NextRequest } from "next/server";

/**
 * 배치(크론) 호출 확인.
 *
 * Vercel Cron 은 설정된 일정에 맞춰 우리 주소를 호출하면서
 * `Authorization: Bearer $CRON_SECRET` 헤더를 함께 보냅니다.
 * 관리자 화면에서 손으로 실행할 때는 서버 액션이 직접 함수를 부르므로
 * 이 확인을 거치지 않습니다.
 *
 * CRON_SECRET 을 설정하지 않으면 외부에서 아무나 부를 수 있으므로,
 * 설정하지 않은 경우에는 호출을 거부합니다(안전한 기본값).
 */
export function isAuthorizedCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;

  // 손으로 실행해 볼 수 있도록 ?secret= 도 함께 받습니다.
  return request.nextUrl.searchParams.get("secret") === secret;
}

/**
 * 지금이 한국 날짜로 며칠인지를 UTC 자정 표식으로 돌려줍니다.
 * 요일과 날짜를 읽는 용도로만 쓰세요. 실제 시각 비교에는 쓰면 안 됩니다.
 */
export function todayKST(now: Date = new Date()): Date {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return new Date(
    Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate())
  );
}

const KST_OFFSET = 9 * 60 * 60 * 1000;

/**
 * "한국 시간으로 오늘 하루"에 해당하는 실제 시각 구간을 돌려줍니다.
 * createdAt 같은 타임스탬프를 하루 단위로 비교할 때는 반드시 이것을 쓰세요.
 *
 * 한국 날짜 D는 UTC로 (D-1) 15:00 부터 D 15:00 까지입니다.
 * 날짜 표식(UTC 자정)을 그대로 비교하면 9시간이 어긋나 하루가 밀립니다.
 */
export function kstDayRange(now: Date = new Date()): { start: Date; end: Date } {
  const kst = new Date(now.getTime() + KST_OFFSET);
  const startUtcMs =
    Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()) -
    KST_OFFSET;
  return {
    start: new Date(startUtcMs),
    end: new Date(startUtcMs + 86400000),
  };
}
