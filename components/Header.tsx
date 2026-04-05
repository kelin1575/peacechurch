"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "교회소개",
    href: "/about",
    children: [
      { label: "교회 소개", href: "/about" },
      { label: "자주 묻는 질문", href: "/faq" },
    ],
  },
  {
    label: "예배",
    href: "/sermons",
    children: [
      { label: "전체 설교", href: "/sermons" },
      { label: "주일예배", href: "/sermons?category=주일예배" },
      { label: "수요예배", href: "/sermons?category=수요예배" },
      { label: "새벽기도", href: "/sermons?category=새벽기도회" },
      { label: "특별집회", href: "/sermons?category=특별집회" },
    ],
  },
  {
    label: "다음세대",
    href: "/sermons?category=어린이예배",
    children: [
      { label: "어린이예배", href: "/sermons?category=어린이예배" },
      { label: "청년예배", href: "/sermons?category=청년예배" },
    ],
  },
  {
    label: "섬김",
    href: "/donate",
    children: [
      { label: "후원하기", href: "/donate" },
    ],
  },
  {
    label: "양육과훈련",
    href: "/devotional",
    children: [
      { label: "매일 묵상", href: "/devotional" },
      { label: "성경 찾기", href: "/bible" },
      { label: "찬송가", href: "/hymnal" },
    ],
  },
  {
    label: "평안소식",
    href: "/faq",
  },
  {
    label: "새가족등록",
    href: "/about#contact",
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href !== "/" &&
    (pathname === href || pathname.startsWith(href.split("?")[0].split("#")[0]));

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0" aria-label="수원평안교회 홈">
            <Image
              src="https://peacechurch.kr/UserData/pyunganch/Layouts/pyunganch2025_Layout/Images/1_logo_2.png"
              alt="수원평안교회 PEACE CHURCH"
              width={180}
              height={52}
              priority
              className="h-12 w-auto"
              onError={(e) => { (e.target as HTMLImageElement).src = "/logo.svg"; }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0" aria-label="주요 메뉴">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-0.5 px-4 py-2 text-[15px] font-medium transition-colors whitespace-nowrap",
                    isActive(item.href)
                      ? "text-[#1a6bba]"
                      : "text-gray-700 hover:text-[#1a6bba]"
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown className="w-3 h-3 ml-0.5 opacity-50" aria-hidden="true" />
                  )}
                </Link>

                {/* Dropdown */}
                {item.children && activeDropdown === item.label && (
                  <div
                    className="absolute top-full left-0 mt-0 w-44 bg-white shadow-lg border border-gray-100 py-1 z-50"
                    role="menu"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-5 py-2.5 text-sm text-gray-700 hover:text-[#1a6bba] hover:bg-blue-50 transition-colors"
                        onClick={() => setActiveDropdown(null)}
                        role="menuitem"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right: 로그인/회원가입 style links */}
          <div className="hidden lg:flex items-center gap-3 text-sm text-gray-500">
            <Link href="/about#contact" className="hover:text-[#1a6bba] transition-colors">
              새가족등록
            </Link>
            <span className="text-gray-300">|</span>
            <a
              href="https://youtube.com/channel/UC9c1llukhxYQ5nma355O-kg"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-600 transition-colors"
            >
              유튜브
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="lg:hidden border-t border-gray-100 bg-white"
          aria-label="모바일 메뉴"
        >
          <div className="max-w-7xl mx-auto px-4 py-2 space-y-0.5">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-3 text-sm font-medium rounded transition-colors",
                    isActive(item.href)
                      ? "text-[#1a6bba] bg-blue-50"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && item.children.length > 1 && (
                  <div className="ml-4 space-y-0.5 mb-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-3 py-2 text-sm text-gray-500 hover:text-[#1a6bba] hover:bg-blue-50 rounded transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
