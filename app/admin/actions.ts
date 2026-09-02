"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NEWS_CATEGORIES } from "@/lib/news";

/**
 * 관리자 화면 전용 동작들.
 * 서버에서만 실행되므로 관리자 키를 브라우저로 내려보낼 필요가 없습니다.
 * (공개 HTTP API 쪽은 ADMIN_SECRET 헤더로 따로 막습니다.)
 */

export async function createNews(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const rawCategory = String(formData.get("category") ?? "교회소식");
  const category = (NEWS_CATEGORIES as readonly string[]).includes(rawCategory)
    ? rawCategory
    : "교회소식";
  const isPinned = formData.get("isPinned") === "on";

  if (!title || !content) {
    redirect("/admin/news?error=" + encodeURIComponent("제목과 내용을 모두 입력해 주세요."));
  }

  let saved = false;
  let message = "";
  try {
    await prisma.news.create({ data: { title, content, category, isPinned } });
    saved = true;
  } catch (error) {
    console.error("createNews error:", error);
    message =
      "저장하지 못했습니다. 데이터베이스에 News 표가 있는지 확인해 주세요 (npx prisma db push).";
  }

  // redirect()는 예외를 던져 흐름을 끊으므로 try 바깥에서 호출합니다.
  if (!saved) {
    redirect("/admin/news?error=" + encodeURIComponent(message));
  }

  revalidatePath("/news");
  revalidatePath("/admin/news");
  revalidatePath("/");
  redirect("/admin/news?ok=1");
}

export async function deleteNews(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  try {
    await prisma.news.delete({ where: { id } });
    revalidatePath("/news");
    revalidatePath("/admin/news");
    revalidatePath("/");
  } catch (error) {
    console.error("deleteNews error:", error);
  }
}

export async function setPrayerStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = formData.get("status") === "hidden" ? "hidden" : "published";
  if (!id) return;
  try {
    await prisma.prayerRequest.update({ where: { id }, data: { status } });
    revalidatePath("/prayer");
    revalidatePath("/admin/prayers");
  } catch (error) {
    console.error("setPrayerStatus error:", error);
  }
}

export async function deletePrayer(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  try {
    await prisma.prayerRequest.delete({ where: { id } });
    revalidatePath("/prayer");
    revalidatePath("/admin/prayers");
  } catch (error) {
    console.error("deletePrayer error:", error);
  }
}


// ─────────────────────────────────────────────────────────────
// 로그인 / 로그아웃
// ─────────────────────────────────────────────────────────────

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  const expected = process.env.ADMIN_PASSWORD;

  // 로그인 화면으로 되돌아갈 때 원래 가려던 곳을 잃지 않도록 붙여 둡니다.
  const back = (params: string) =>
    `/admin/login?${params}${next && next !== "/admin" ? `&next=${encodeURIComponent(next)}` : ""}`;

  if (!expected) {
    redirect(back("setup=1"));
  }

  if (!password) {
    redirect(back("error=" + encodeURIComponent("비밀번호를 입력해 주세요.")));
  }

  if (password !== expected) {
    // 비밀번호를 빠르게 대입해 보는 것을 조금이라도 늦춥니다.
    await new Promise((r) => setTimeout(r, 700));
    redirect(back("error=" + encodeURIComponent("비밀번호가 맞지 않습니다.")));
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, await createSessionToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // 열린 리다이렉트를 막기 위해 사이트 내부 경로만 허용합니다.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
  redirect(safeNext);
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// ─────────────────────────────────────────────────────────────
// 데이터베이스 표 만들기 (기도의 벽 · 평안소식)
// ─────────────────────────────────────────────────────────────

/**
 * prisma/schema.prisma 의 PrayerRequest · News 모델과 같은 표를 만듭니다.
 * 터미널에서 `npx prisma db push`를 실행하는 것과 결과가 같습니다.
 *
 * 모두 IF NOT EXISTS 라 여러 번 눌러도 안전하고, 기존 표(설교·묵상·댓글)는
 * 건드리지 않습니다. 지우거나 바꾸는 문장은 하나도 없습니다.
 */
const SETUP_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "PrayerRequest" (
     "id"        TEXT NOT NULL,
     "author"    TEXT NOT NULL DEFAULT '익명',
     "category"  TEXT NOT NULL DEFAULT '기타',
     "content"   TEXT NOT NULL,
     "prayCount" INTEGER NOT NULL DEFAULT 0,
     "status"    TEXT NOT NULL DEFAULT 'published',
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT "PrayerRequest_pkey" PRIMARY KEY ("id")
   )`,
  `CREATE INDEX IF NOT EXISTS "PrayerRequest_status_createdAt_idx"
     ON "PrayerRequest" ("status", "createdAt")`,
  `CREATE TABLE IF NOT EXISTS "News" (
     "id"          TEXT NOT NULL,
     "title"       TEXT NOT NULL,
     "content"     TEXT NOT NULL,
     "category"    TEXT NOT NULL DEFAULT '교회소식',
     "isPinned"    BOOLEAN NOT NULL DEFAULT false,
     "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT "News_pkey" PRIMARY KEY ("id")
   )`,
  `CREATE INDEX IF NOT EXISTS "News_publishedAt_idx" ON "News" ("publishedAt")`,
];

export async function setupTables() {
  let failed = "";
  try {
    for (const sql of SETUP_STATEMENTS) {
      await prisma.$executeRawUnsafe(sql);
    }
  } catch (error) {
    console.error("setupTables error:", error);
    failed =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
  }

  if (failed) {
    redirect("/admin?dbError=" + encodeURIComponent(failed));
  }

  revalidatePath("/prayer");
  revalidatePath("/news");
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?dbOk=1");
}
