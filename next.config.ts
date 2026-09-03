import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "peacechurch.kr" },
      { protocol: "https", hostname: "www.peacechurch.kr" },
      // 주보 이미지가 올라가는 곳(교회 홈페이지 CMS).
      // http 로만 열리더라도 next/image 가 서버에서 받아 우리 도메인(https)으로
      // 다시 내보내므로, 브라우저의 혼합 콘텐츠 차단에 걸리지 않습니다.
      { protocol: "http", hostname: "data.dimode.co.kr" },
      { protocol: "https", hostname: "data.dimode.co.kr" },
    ],
  },
};

export default nextConfig;
