import Link from "next/link";
import { MapPin, Phone, Mail, Youtube, Heart, Clock } from "lucide-react";

const QUICK_LINKS = [
  { label: "교회 소개", href: "/about" },
  { label: "설교 말씀", href: "/sermons" },
  { label: "매일 묵상", href: "/devotional" },
  { label: "성경 찾기 (개역개정)", href: "/bible" },
  { label: "찬송가", href: "/hymnal" },
  { label: "자주 묻는 질문", href: "/faq" },
  { label: "후원하기", href: "/donate" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-3 mb-4"
              aria-label="수원평안교회 홈"
            >
              <div
                className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <span className="text-white font-bold text-lg">평</span>
              </div>
              <div>
                <p className="font-bold text-white text-lg leading-tight">
                  수원평안교회
                </p>
                <p className="text-primary-400 text-xs">담임목사 정재광</p>
              </div>
            </Link>
            <p className="text-primary-300 text-sm leading-relaxed mb-4">
              하나님의 말씀 위에 세워진 교회,
              <br />
              모든 사람이 평안을 누리는 공동체입니다.
            </p>
            <a
              href="https://youtube.com/channel/UC9c1llukhxYQ5nma3550-kg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600/90 text-white text-xs px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors"
              aria-label="수원평안교회 유튜브 채널 (새 창)"
            >
              <Youtube className="w-3.5 h-3.5" aria-hidden="true" />
              유튜브 채널
            </a>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              연락처
            </h3>
            <address className="not-italic">
              <ul className="space-y-2.5 text-sm text-primary-300">
                <li className="flex items-start gap-2">
                  <MapPin
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>경기도 수원시</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <a
                    href="tel:031-000-0000"
                    className="hover:text-white transition-colors"
                  >
                    031-000-0000
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <a
                    href="mailto:info@peacechurch.kr"
                    className="hover:text-white transition-colors"
                  >
                    info@peacechurch.kr
                  </a>
                </li>
                <li className="flex items-start gap-2 pt-1 border-t border-primary-700">
                  <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p>
                      <strong className="text-white">주일예배</strong>
                    </p>
                    <p>매주 일요일 오전 11:00</p>
                  </div>
                </li>
              </ul>
            </address>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              바로가기
            </h3>
            <nav aria-label="푸터 메뉴">
              <ul className="space-y-2 text-sm">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-primary-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Donation CTA */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              후원
            </h3>
            <p className="text-primary-300 text-sm leading-relaxed mb-4">
              여러분의 헌금으로 하나님 나라를 함께 세워가요.
            </p>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 bg-gold-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gold-600 transition-colors"
            >
              <Heart className="w-4 h-4 fill-white/30" aria-hidden="true" />
              후원하기
            </Link>

            {/* SEO rich-text for AI */}
            <div className="mt-6 text-xs text-primary-500 leading-relaxed space-y-1">
              <p>수원평안교회 정재광 목사</p>
              <p>경기도 수원시 소재 교회</p>
              <p>주일예배 매주 일요일 오전 11시</p>
              <p>개역개정 성경 · 찬송가</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-primary-400 text-xs">
            © {currentYear} 수원평안교회. All rights reserved.
          </p>
          <p className="text-primary-500 text-xs">
            <a
              href="https://www.peacechurch.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-300 transition-colors"
            >
              www.peacechurch.kr
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
