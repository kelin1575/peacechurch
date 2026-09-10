import { NextResponse } from "next/server";
import { backfillMissingDevotionals } from "@/lib/backfill-devotionals";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const result = await backfillMissingDevotionals();
  return NextResponse.json(result);
}
