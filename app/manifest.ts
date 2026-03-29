import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "수원평안교회 | 정재광 목사 말씀",
    short_name: "수원평안교회",
    description:
      "수원평안교회 정재광 목사님의 주일예배 설교 말씀, 매일 묵상, 성경, 찬송가",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e3a8a",
    orientation: "portrait",
    lang: "ko",
    categories: ["religion", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/icons/icon-96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/icons/icon-128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "오늘의 묵상",
        short_name: "묵상",
        url: "/devotional",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "최신 말씀",
        short_name: "말씀",
        url: "/sermons",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "성경 찾기",
        short_name: "성경",
        url: "/bible",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
    ],
  };
}
