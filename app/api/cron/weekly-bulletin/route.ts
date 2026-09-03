import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { postWeeklyBulletin } from "@/lib/weekly-bulletin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** 매주 일요일 아침에 호출되어 이번 주 주보를 평안소식에 올립니다. */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await postWeeklyBulletin();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export const POST = GET;
