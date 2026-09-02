import { prisma } from "@/lib/db";
import { todayKST, kstDayRange } from "@/lib/cron";
import { OFFICIAL_AUTHOR, pickPrayerTopic } from "@/lib/prayer-topics";

export interface DailyPrayerResult {
  ok: boolean;
  /** 이미 오늘 것이 올라가 있어 건너뛴 경우 */
  skipped: boolean;
  message: string;
  content?: string;
  category?: string;
}

/**
 * 오늘의 공동 기도제목을 기도의 벽에 올립니다.
 *
 * 하루에 한 번만 올라가도록, 오늘 이미 교회 이름으로 올라간 글이 있으면
 * 아무것도 하지 않습니다. 배치가 두 번 돌아도 안전합니다.
 */
export async function postDailyPrayer(): Promise<DailyPrayerResult> {
  // 요일 판단은 날짜 표식으로, 중복 확인은 실제 시각 구간으로 합니다.
  const today = todayKST();
  const { start, end } = kstDayRange();

  try {
    const existing = await prisma.prayerRequest.findFirst({
      where: {
        isOfficial: true,
        createdAt: { gte: start, lt: end },
      },
      select: { id: true },
    });

    if (existing) {
      return {
        ok: true,
        skipped: true,
        message: "오늘의 공동 기도제목은 이미 올라가 있습니다.",
      };
    }

    const topic = pickPrayerTopic(today);

    await prisma.prayerRequest.create({
      data: {
        author: OFFICIAL_AUTHOR,
        category: topic.category,
        content: topic.content,
        isOfficial: true,
      },
    });

    return {
      ok: true,
      skipped: false,
      message: "오늘의 공동 기도제목을 올렸습니다.",
      content: topic.content,
      category: topic.category,
    };
  } catch (error) {
    console.error("postDailyPrayer error:", error);
    return {
      ok: false,
      skipped: false,
      message:
        error instanceof Error
          ? `기도제목을 올리지 못했습니다: ${error.message}`
          : "기도제목을 올리지 못했습니다.",
    };
  }
}
