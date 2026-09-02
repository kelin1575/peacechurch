"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
