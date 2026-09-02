import Link from "next/link";
import { MapPin, Phone, Mail, Youtube, Clock } from "lucide-react";
import ChurchLogo from "@/components/ChurchLogo";

const QUICK_LINKS = [
  { label: "교회소개", href: "/about" },
  { label: "처음 오신 분", href: "/visit" },
  { label: "예배 설교", href: "/sermons" },
  { label: "매일 묵상", href: "/devotional" },
  { label: "기도의 벽", href: "/prayer" },
  { label: "평안소식", href: "/news" },
  { label: "성경 찾기 (개역개정)", href: "/bible" },
  { label: "찬송가", href: "/hymnal" },
  { label: "자주 묻는 질문", href: "/faq" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0d2a5e] text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-5" aria-label="수원평안교회 홈">
              <div className="bg-white rounded-lg px-3 py-2 inline-flex items-center">
                <ChurchLogo className="h-9 w-auto" />
              </div>
            </Link>
            <p className="text-blue-200 text-sm leading-relaxed mb-4">
              대한예수교장로회 수원평안교회<br />
              평안을 함께 누리는 복음 공동체<br />
              담임목사 정재광
            </p>
            <a
              href="https://youtube.com/channel/UC9c1llukhxYQ5nma355O-kg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 text-white text-xs px-3 py-1.5 rounded-full hover:bg-red-500 transition-colors"
              aria-label="평안교회 유튜브 채널"
            >
              <Youtube className="w-3.5 h-3.5" aria-hidden="true" />
              유튜브 채널
            </a>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wide border-b border-blue-700 pb-2">
              연락처
            </h3>
            <address className="not-italic">
              <ul className="space-y-3 text-sm text-blue-200">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" aria-hidden="true" />
                  <span>
                    경기도 수원시 권선구<br />
                    호매실로 218번길 110
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0 text-blue-400" aria-hidden="true" />
                  <a href="tel:031-292-8119" className="hover:text-white transition-colors">
                    031-292-8119
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0 text-blue-400" aria-hidden="true" />
                  <a href="mailto:info@peacechurch.kr" className="hover:text-white transition-colors">
                    info@peacechurch.kr
                  </a>
                </li>
                <li className="flex items-start gap-2 pt-2 border-t border-blue-800">
                  <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" aria-hidden="true" />
                  <div>
                    <p className="text-white font-semibold">주일예배</p>
                    <p>매주 일요일 오전 11:00</p>
                  </div>
                </li>
              </ul>
            </address>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wide border-b border-blue-700 pb-2">
              바로가기
            </h3>
            <nav aria-label="푸터 메뉴">
              <ul className="space-y-2 text-sm">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-blue-200 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Church info for SEO + GEO */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wide border-b border-blue-700 pb-2">
              교회 안내
            </h3>
            <div className="text-sm text-blue-200 space-y-2 leading-relaxed">
              <p>담임목사 <strong className="text-white">정재광</strong></p>
              <p>대한예수교장로회 (통합)</p>
              <p className="pt-1">
                <a
                  href="https://www.peacechurch.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline underline-offset-2"
                >
                  www.peacechurch.kr
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-blue-400 text-xs">
            © {currentYear} 대한예수교장로회 평안교회. All rights reserved.
          </p>
          <p className="text-blue-500 text-xs">
            Powered by Peace Church Digital Ministry
          </p>
        </div>
      </div>
    </footer>
  );
}
