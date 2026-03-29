import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { OrganizationSchema } from "@/components/JsonLd";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";
const BASE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "수원평안교회 | 정재광 목사 설교 말씀",
    template: "%s | 수원평안교회 정재광 목사",
  },
  description:
    "수원평안교회 정재광 목사님의 주일예배 설교 말씀을 카테고리별로 시청하고, 매일 묵상, 개역개정 성경 찾기, 찬송가를 만나보세요. 경기도 수원시 소재.",
  keywords: [
    "수원평안교회",
    "정재광목사",
    "정재광",
    "수원교회",
    "평안교회",
    "설교",
    "말씀",
    "주일예배",
    "묵상",
    "성경",
    "찬송가",
    "경기도교회",
    "수원시교회",
    "peacechurch",
    "기독교",
  ],
  authors: [{ name: "정재광 목사", url: BASE_URL }],
  creator: "수원평안교회",
  publisher: "수원평안교회",
  category: "religion",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: BASE_URL,
    siteName: "수원평안교회",
    title: "수원평안교회 | 정재광 목사 설교 말씀",
    description:
      "수원평안교회 정재광 목사님의 주일예배 설교 말씀, 매일 묵상, 성경 찾기(개역개정), 찬송가를 한 곳에서 만나보세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "수원평안교회 정재광 목사 설교 말씀",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "수원평안교회 | 정재광 목사 설교 말씀",
    description:
      "주일예배 설교 말씀, 매일 묵상, 성경 찾기, 찬송가 | 수원평안교회 정재광 목사",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add Google Search Console, Naver verification codes here
    // google: "YOUR_GOOGLE_VERIFICATION_CODE",
    // other: { "naver-site-verification": "YOUR_NAVER_CODE" },
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "ko-KR": BASE_URL,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e3a8a" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a8a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&family=Noto+Serif+KR:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Preload critical fonts */}
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <OrganizationSchema />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1" id="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
