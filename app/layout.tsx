import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "수원평안교회 | 정재광 목사 설교 말씀",
    template: "%s | 수원평안교회",
  },
  description:
    "수원평안교회 정재광 목사님의 주일예배 설교 말씀, 매일 묵상, 성경 찾기, 찬송가를 만나보세요.",
  keywords: ["수원평안교회", "정재광목사", "설교", "말씀", "주일예배", "묵상"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://peacechurch.kr",
    siteName: "수원평안교회",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
