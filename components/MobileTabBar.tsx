"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Play, Sunrise, HeartHandshake, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 모바일 하단 고정 탭바.
 * 교회 사이트 방문의 대부분은 주일 아침 휴대폰이고, 그때 찾는 것은 정해져 있습니다 —
 * 말씀, 묵상, 기도, 성경. 햄버거 메뉴를 열지 않고 한 번에 닿게 합니다.
 * 관리자 화면에서는 감춥니다.
 */
const TABS = [
  { href: "/", label: "홈", icon: Home, exact: true },
  { href: "/sermons", label: "말씀", icon: Play },
  { href: "/devotional", label: "묵상", icon: Sunrise },
  { href: "/prayer", label: "기도", icon: HeartHandshake },
  { href: "/bible", label: "성경", icon: BookOpen },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="빠른 이동"
    >
      <ul className="grid grid-cols-5" role="list">
        {TABS.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary-700" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <tab.icon
                  className={cn("w-[22px] h-[22px]", active && "stroke-[2.4]")}
                  aria-hidden="true"
                />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
