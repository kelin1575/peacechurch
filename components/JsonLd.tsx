// JSON-LD Structured Data Components for SEO & GEO
// 수원평안교회 – 대한예수교장로회 (Presbyterian Church of Korea)

const BASE = "https://peacechurch.kr";
const CHURCH_NAME = "수원평안교회";
const FULL_NAME = "대한예수교장로회 수원평안교회";
const PHONE = "031-292-8119";
const ADDRESS = {
  streetAddress: "호매실로 218번길 110",
  addressLocality: "수원시 권선구",
  addressRegion: "경기도",
  postalCode: "16556",
  addressCountry: "KR",
};
const GEO = { latitude: "37.2386", longitude: "126.9756" }; // 호매실 근사 좌표
const YOUTUBE = "https://youtube.com/channel/UC9c1llukhxYQ5nma355O-kg";

// ─────────────────────────────────────────────────────────────
// 1. Organization / Church + Website
// ─────────────────────────────────────────────────────────────
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Church", "Organization"],
        "@id": `${BASE}/#church`,
        name: CHURCH_NAME,
        alternateName: [FULL_NAME, "Peace Church Suwon", "평안교회"],
        url: BASE,
        description:
          "평안을 함께 누리는 복음 공동체. 그리스도 중심적 설교와 세움 양육 프로그램으로 가정과 다음세대를 세워가는 대한예수교장로회 교회입니다.",
        address: {
          "@type": "PostalAddress",
          ...ADDRESS,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: GEO.latitude,
          longitude: GEO.longitude,
        },
        telephone: PHONE,
        email: "info@peacechurch.kr",
        logo: {
          "@type": "ImageObject",
          url: `${BASE}/UserData/pyunganch/Layouts/pyunganch2025_Layout/Images/1_logo_2.png`,
        },
        image: `${BASE}/og-image.png`,
        sameAs: [YOUTUBE, "https://www.peacechurch.kr"],
        hasMap: `https://map.naver.com/v5/search/${encodeURIComponent(CHURCH_NAME)}`,
        member: {
          "@type": "Person",
          name: "정재광",
          alternateName: "Jekwang Paul Jung",
          jobTitle: "담임목사",
          description:
            "Azusa Pacific University(M.div), Calvin Theological Seminary(Th.M), 총신대학교 신학대학원(M.div), Westminster Theological Seminary(D.min)",
          worksFor: { "@id": `${BASE}/#church` },
        },
        openingHoursSpecification: [
          { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "09:00", closes: "16:00" },
          { "@type": "OpeningHoursSpecification", dayOfWeek: "Wednesday", opens: "20:00", closes: "21:30" },
          { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "20:00", closes: "21:30" },
        ],
        event: [
          {
            "@type": "Event",
            name: "주일 1부예배",
            description: "수원평안교회 주일 1부 예배 (3층 대예배실)",
            eventSchedule: {
              "@type": "Schedule",
              repeatFrequency: "P1W",
              byDay: "https://schema.org/Sunday",
              startTime: "09:00",
              endTime: "10:30",
            },
            location: { "@type": "Place", name: CHURCH_NAME, address: { "@type": "PostalAddress", ...ADDRESS } },
          },
          {
            "@type": "Event",
            name: "주일 2부예배 (주예배)",
            description: "수원평안교회 주일 2부 대예배 – 담임목사 정재광 설교 (3층 대예배실)",
            eventSchedule: {
              "@type": "Schedule",
              repeatFrequency: "P1W",
              byDay: "https://schema.org/Sunday",
              startTime: "11:00",
              endTime: "12:30",
            },
            location: { "@type": "Place", name: CHURCH_NAME, address: { "@type": "PostalAddress", ...ADDRESS } },
          },
          {
            "@type": "Event",
            name: "주일 3부예배",
            description: "수원평안교회 주일 3부 예배 (3층 대예배실)",
            eventSchedule: {
              "@type": "Schedule",
              repeatFrequency: "P1W",
              byDay: "https://schema.org/Sunday",
              startTime: "14:00",
              endTime: "15:30",
            },
            location: { "@type": "Place", name: CHURCH_NAME, address: { "@type": "PostalAddress", ...ADDRESS } },
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${BASE}/#website`,
        url: BASE,
        name: CHURCH_NAME,
        description: "수원평안교회 정재광 목사 설교 말씀, 매일 묵상, 성경 찾기, 찬송가",
        publisher: { "@id": `${BASE}/#church` },
        inLanguage: "ko-KR",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE}/sermons?q={search_term_string}`,
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

// ─────────────────────────────────────────────────────────────
// 2. BreadcrumbList
// ─────────────────────────────────────────────────────────────
interface BreadcrumbItem { name: string; url: string }

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

// ─────────────────────────────────────────────────────────────
// 3. VideoObject (설교)
// ─────────────────────────────────────────────────────────────
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
  id, title, description, youtubeId, publishedAt, thumbnail, scripture, summary,
}: SermonSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || BASE;
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${baseUrl}/sermons/${id}`,
    name: title,
    description:
      summary || description ||
      `수원평안교회 정재광 목사님의 설교 말씀${scripture ? ` – ${scripture}` : ""}`,
    thumbnailUrl: thumbnail || `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
    uploadDate: new Date(publishedAt).toISOString(),
    embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    url: `${baseUrl}/sermons/${id}`,
    author: {
      "@type": "Person",
      name: "정재광",
      jobTitle: "담임목사",
      worksFor: { "@type": "Church", name: CHURCH_NAME, url: BASE },
    },
    publisher: {
      "@type": "Church",
      name: CHURCH_NAME,
      url: BASE,
      telephone: PHONE,
    },
    inLanguage: "ko-KR",
    genre: "Religious Sermon",
    keywords: [
      "정재광목사 설교", "수원평안교회 설교", "주일예배 설교",
      scripture, title,
    ].filter(Boolean).join(", "),
    about: scripture ? { "@type": "Thing", name: scripture } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// 4. FAQPage
// ─────────────────────────────────────────────────────────────
interface FAQItem { question: string; answer: string }

export function FAQSchema({ items }: { items: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// 5. Article (묵상)
// ─────────────────────────────────────────────────────────────
export function DevotionalArticleSchema({
  title, scripture, content, date,
}: { title: string; scripture: string; content: string; date: Date | string }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || BASE;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `오늘의 묵상: ${title}`,
    name: title,
    description: content.slice(0, 200),
    datePublished: new Date(date).toISOString(),
    dateModified: new Date(date).toISOString(),
    author: {
      "@type": "Person",
      name: "정재광",
      jobTitle: "담임목사",
      worksFor: { "@type": "Church", name: CHURCH_NAME, url: BASE },
    },
    publisher: {
      "@type": "Church",
      name: CHURCH_NAME,
      url: BASE,
      logo: { "@type": "ImageObject", url: `${baseUrl}/icons/icon-192.png` },
    },
    about: {
      "@type": "Thing",
      name: scripture,
      description: `성경 구절: ${scripture}`,
    },
    inLanguage: "ko-KR",
    articleSection: "매일묵상",
    keywords: ["묵상", "성경", "QT", scripture, "수원평안교회", "정재광목사"].join(", "),
    isPartOf: { "@type": "WebSite", url: BASE, name: CHURCH_NAME },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
