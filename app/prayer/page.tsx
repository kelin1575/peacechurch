import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, HeartHandshake } from "lucide-react";
import { prisma } from "@/lib/db";
import { BreadcrumbSchema } from "@/components/JsonLd";
import PrayerWall, { type PrayerItem } from "@/components/PrayerWall";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";

export const metadata: Metadata = {
  title: "기도의 벽",
  description:
    "수원평안교회 기도의 벽. 기도제목을 나누고 서로를 위해 중보합니다. 익명으로 올리실 수 있습니다.",
  keywords: [
    "기도제목",
    "중보기도",
    "기도 부탁",
    "수원평안교회 기도",
    "온라인 기도",
    "기도의 벽",
  ],
  openGraph: {
    title: "기도의 벽 | 수원평안교회",
    description:
      "혼자 지지 마세요. 기도제목을 나누면 교회가 함께 기도합니다.",
    url: `${BASE_URL}/prayer`,
  },
  alternates: { canonical: `${BASE_URL}/prayer` },
};

async function getPrayers(): Promise<{ prayers: PrayerItem[]; dbReady: boolean }> {
  try {
    const rows = await prisma.prayerRequest.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return {
      prayers: rows.map((r) => ({
        id: r.id,
        author: r.author,
        category: r.category,
        content: r.content,
        prayCount: r.prayCount,
        isOfficial: r.isOfficial,
        createdAt: r.createdAt.toISOString(),
      })),
      dbReady: true,
    };
  } catch {
    // PrayerRequest 표가 아직 없는 상태 — 화면은 열되 안내를 띄웁니다.
    return { prayers: [], dbReady: false };
  }
}

export default async function PrayerPage() {
  const { prayers, dbReady } = await getPrayers();

  const breadcrumbs = [
    { name: "홈", url: BASE_URL },
    { name: "기도의 벽", url: `${BASE_URL}/prayer` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-gray-50">
        {/* ── Header ── */}
        <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white">
          <div className="container-page py-14">
            <nav
              aria-label="breadcrumb"
              className="flex items-center gap-2 text-primary-200 text-sm mb-4"
            >
              <Link href="/" className="hover:text-white transition-colors">
                홈
              </Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <span className="text-white">기도의 벽</span>
            </nav>

            <div className="flex items-center gap-3 mb-3">
              <HeartHandshake className="w-8 h-8 text-gold-300" aria-hidden="true" />
              <h1 className="text-3xl md:text-4xl font-bold">기도의 벽</h1>
            </div>

            <blockquote className="max-w-2xl">
              <p className="scripture text-primary-100 text-base md:text-lg">
                &ldquo;너희가 짐을 서로 지라 그리하여 그리스도의 법을 성취하라&rdquo;
              </p>
              <footer className="text-gold-300 text-sm font-semibold mt-2">
                갈라디아서 6:2
              </footer>
            </blockquote>

            <p className="text-primary-200 text-sm mt-5 max-w-2xl leading-relaxed">
              혼자 지고 계신 짐이 있다면 여기에 내려놓으세요.
              이름을 밝히지 않으셔도 됩니다. 교회가 함께 기도합니다.
            </p>
          </div>
        </section>

        <div className="container-page py-10">
          <PrayerWall initialPrayers={prayers} dbReady={dbReady} />
        </div>
      </div>
    </>
  );
}
