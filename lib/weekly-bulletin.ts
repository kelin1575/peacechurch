import { prisma } from "@/lib/db";
import { fetchLatestBulletin, DEFAULT_BOARD_URL } from "@/lib/bulletin";
import { isAllowedImageHost } from "@/lib/news";

export interface WeeklyBulletinResult {
  ok: boolean;
  /** 이미 올라가 있거나, 확실하지 않아 건너뛴 경우 */
  skipped: boolean;
  message: string;
  title?: string;
  imageUrl?: string;
  sourceUrl?: string;
}

/** 주보 글 번호를 주소에서 꺼냅니다 (files/{게시판}/{글번호}/ 또는 /46/22381) */
function postIdOf(result: { imageUrl?: string; sourceUrl?: string; postId?: string }) {
  if (result.postId) return result.postId;
  const m = (result.imageUrl ?? result.sourceUrl ?? "").match(/\/files\/\d+\/(\d+)\//);
  return m ? m[1] : null;
}

/**
 * 이번 주 주보를 읽어 평안소식에 올립니다.
 *
 * 매주 일요일 아침에 한 번 돕니다. 다음 경우에는 올리지 않습니다.
 *  - 읽어온 내용이 확실하지 않을 때 (표제를 못 찾았거나 이미지가 없을 때)
 *  - 같은 주보가 이미 올라가 있을 때
 *
 * 교회 공개 페이지에 잘못 뽑힌 글이 올라가는 것보다, 아무것도 올라가지 않고
 * 관리자가 미리보기로 직접 올리는 편이 낫습니다.
 */
export async function postWeeklyBulletin(
  boardUrl: string = DEFAULT_BOARD_URL
): Promise<WeeklyBulletinResult> {
  const result = await fetchLatestBulletin(boardUrl);

  if (!result.ok) {
    return { ok: false, skipped: true, message: result.message };
  }

  if (!result.confident || !result.content) {
    const failed = result.steps.filter((s) => !s.ok).map((s) => s.label);
    return {
      ok: true,
      skipped: true,
      message:
        "읽어온 내용이 확실하지 않아 올리지 않았습니다" +
        (failed.length ? ` (막힌 단계: ${failed.join(", ")})` : "") +
        ". 관리자 화면의 주보 미리보기에서 확인해 주세요.",
    };
  }

  // 이미지 주소는 교회 홈페이지가 쓰는 곳만 받습니다.
  const imageUrl =
    result.imageUrl && isAllowedImageHost(result.imageUrl) ? result.imageUrl : null;

  const postId = postIdOf(result);

  try {
    // 같은 주보가 이미 올라가 있는지 — 글 번호로 봅니다.
    const already = await prisma.news.findFirst({
      where: postId
        ? {
            OR: [
              { sourceUrl: result.sourceUrl ?? undefined },
              { imageUrl: { contains: `/${postId}/` } },
            ],
          }
        : { sourceUrl: result.sourceUrl ?? undefined },
      select: { id: true },
    });

    if (already) {
      return {
        ok: true,
        skipped: true,
        message: "이번 주 주보는 이미 올라가 있습니다.",
      };
    }

    await prisma.news.create({
      data: {
        title: result.title ?? "이번 주 교회소식",
        content: result.content,
        category: "교회소식",
        isPinned: false,
        imageUrl,
        sourceUrl: result.sourceUrl ?? null,
      },
    });

    return {
      ok: true,
      skipped: false,
      message: "이번 주 주보를 평안소식에 올렸습니다.",
      title: result.title,
      imageUrl: imageUrl ?? undefined,
      sourceUrl: result.sourceUrl,
    };
  } catch (error) {
    console.error("postWeeklyBulletin error:", error);
    return {
      ok: false,
      skipped: false,
      message:
        error instanceof Error
          ? `저장하지 못했습니다: ${error.message}`
          : "저장하지 못했습니다.",
    };
  }
}
