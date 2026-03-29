// JSON-LD Structured Data Components for SEO & GEO

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  description?: string;
}

export function OrganizationSchema({
  name = "수원평안교회",
  url = "https://peacechurch.kr",
  description = "수원평안교회는 경기도 수원시에 위치한 교회로, 담임목사 정재광이 이끄는 공동체입니다.",
}: OrganizationSchemaProps = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Church",
        "@id": `${url}/#church`,
        name,
        url,
        description,
        address: {
          "@type": "PostalAddress",
          addressLocality: "수원시",
          addressRegion: "경기도",
          addressCountry: "KR",
        },
        geo: {
          "@type": "GeoCoordinates",
          addressCountry: "KR",
          addressRegion: "경기도 수원시",
        },
        telephone: "031-000-0000",
        email: "info@peacechurch.kr",
        sameAs: [
          "https://youtube.com/channel/UC9c1llukhxYQ5nma355O-kg",
          "https://www.peacechurch.kr",
        ],
        founder: {
          "@type": "Person",
          name: "정재광",
          jobTitle: "담임목사",
          worksFor: { "@id": `${url}/#church` },
        },
        event: {
          "@type": "Event",
          name: "주일예배",
          description: "매주 일요일 정재광 목사 주일예배",
          startDate: "T11:00",
          eventSchedule: {
            "@type": "Schedule",
            repeatFrequency: "P1W",
            byDay: "https://schema.org/Sunday",
            startTime: "11:00",
          },
          location: {
            "@type": "Place",
            name: "수원평안교회",
            address: {
              "@type": "PostalAddress",
              addressLocality: "수원시",
              addressRegion: "경기도",
              addressCountry: "KR",
            },
          },
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name,
        description,
        publisher: { "@id": `${url}/#church` },
        inLanguage: "ko-KR",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${url}/sermons?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SermonSchemaProps {
  id: string;
  title: string;
  description?: string | null;
  youtubeId: string;
  publishedAt: Date | string;
  thumbnail?: string | null;
  scripture?: string | null;
  summary?: string | null;
}

export function SermonVideoSchema({
  id,
  title,
  description,
  youtubeId,
  publishedAt,
  thumbnail,
  scripture,
  summary,
}: SermonSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${baseUrl}/sermons/${id}`,
    name: title,
    description:
      summary ||
      description ||
      `수원평안교회 정재광 목사님의 설교 말씀 - ${scripture || title}`,
    thumbnailUrl: thumbnail || `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
    uploadDate: new Date(publishedAt).toISOString(),
    embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    url: `${baseUrl}/sermons/${id}`,
    author: {
      "@type": "Person",
      name: "정재광",
      jobTitle: "담임목사",
      worksFor: {
        "@type": "Church",
        name: "수원평안교회",
        url: baseUrl,
      },
    },
    publisher: {
      "@type": "Church",
      name: "수원평안교회",
      url: baseUrl,
    },
    inLanguage: "ko-KR",
    genre: "Religious Sermon",
    about: scripture
      ? { "@type": "Thing", name: scripture }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSchema({ items }: { items: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function DevotionalArticleSchema({
  title,
  scripture,
  content,
  date,
}: {
  title: string;
  scripture: string;
  content: string;
  date: Date | string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    name: `오늘의 묵상: ${title}`,
    description: content.slice(0, 200),
    datePublished: new Date(date).toISOString(),
    dateModified: new Date(date).toISOString(),
    author: {
      "@type": "Person",
      name: "정재광",
      jobTitle: "담임목사",
      worksFor: {
        "@type": "Church",
        name: "수원평안교회",
        url: baseUrl,
      },
    },
    publisher: {
      "@type": "Church",
      name: "수원평안교회",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icons/icon-192.png`,
      },
    },
    about: {
      "@type": "Thing",
      name: scripture,
      description: `성경 구절: ${scripture}`,
    },
    inLanguage: "ko-KR",
    articleSection: "묵상",
    keywords: ["묵상", "성경", scripture, "기도", "수원평안교회", "정재광목사"],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
