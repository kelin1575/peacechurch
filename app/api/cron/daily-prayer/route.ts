import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { postDailyPrayer } from "@/lib/daily-prayer";

export const dynamic = "force-dynamic";

/** 매일 한 번 호출되어 공동 기도제목을 기도의 벽에 올립니다. */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await postDailyPrayer();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export const POST = GET;
