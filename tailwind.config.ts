import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /**
         * primary — 성전의 깊은 남빛(Sanctuary Blue).
         * 700을 교회 로고 색(#1a6bba)에 맞춰
         * 버튼·링크·푸터가 하나의 색 체계 안에서 움직입니다.
         * 전체 밝기는 기존안보다 한 단계 올려 예배당의 아침 빛에 가깝게 잡았습니다.
         */
        primary: {
          50: "#f2f8fd",
          100: "#e3f0fb",
          200: "#c4e0f6",
          300: "#97c9ee",
          400: "#62ade2",
          500: "#3a90d1",
          600: "#2478c2",
          700: "#1a6bba",
          800: "#17568f",
          900: "#164672",
          950: "#0f2f52",
        },
        /**
         * gold — 등경 위의 불빛(계 1:20). 노란 형광빛 대신
         * 따뜻하고 밝은 금빛으로 조정해 경건함과 밝기를 함께 잡았습니다.
         */
        gold: {
          50: "#fdfaf2",
          100: "#faf2dd",
          200: "#f2e3b8",
          300: "#e6cd87",
          400: "#d8b65c",
          500: "#c69c3c",
          600: "#a87d28",
          700: "#86611f",
          800: "#6f4f20",
          900: "#5d431f",
        },
        /** olive — 감람나무. 묵상·평안 영역의 보조색 */
        olive: {
          50: "#f5f9f1",
          100: "#e8f2df",
          200: "#d3e5c3",
          300: "#b2d19b",
          400: "#8dba72",
          500: "#6ca152",
          600: "#54843e",
          700: "#436834",
          800: "#38542e",
          900: "#304628",
        },
      },
      fontFamily: {
        sans: [
          "Noto Sans KR",
          "Apple SD Gothic Neo",
          "Pretendard",
          "system-ui",
          "sans-serif",
        ],
        serif: ["Noto Serif KR", "Nanum Myeongjo", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 47, 82, 0.04), 0 8px 24px -12px rgba(15, 47, 82, 0.13)",
        lift: "0 2px 6px rgba(15, 47, 82, 0.06), 0 18px 40px -18px rgba(15, 47, 82, 0.24)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
