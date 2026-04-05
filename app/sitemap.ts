import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sermons`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/devotional`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bible`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hymnal`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/donate`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic sermon pages
  let sermonPages: MetadataRoute.Sitemap = [];
  let devotionalPages: MetadataRoute.Sitemap = [];
  try {
    const sermons = await prisma.sermon.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 200,
    });
    sermonPages = sermons.map((s) => ({
      url: `${baseUrl}/sermons/${s.id}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // ignore db errors during build
  }

  try {
    const devotionals = await prisma.devotional.findMany({
      select: { date: true, updatedAt: true },
      orderBy: { date: "desc" },
      take: 90,
    });
    devotionalPages = devotionals.map((d) => {
      const dateStr = d.date.toISOString().slice(0, 10);
      return {
        url: `${baseUrl}/devotional?date=${dateStr}`,
        lastModified: d.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.7,
      };
    });
  } catch {
    // ignore db errors during build
  }

  return [...staticPages, ...sermonPages, ...devotionalPages];
}
