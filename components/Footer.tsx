import Link from "next/link";
import { MapPin, Phone, Mail, Youtube, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Church info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">평</span>
              </div>
              <div>
                <p className="font-bold text-white text-lg">수원평안교회</p>
                <p className="text-primary-300 text-sm">담임목사 정재광</p>
              </div>
            </div>
            <p className="text-primary-300 text-sm leading-relaxed">
              하나님의 말씀 위에 세워진 교회,
              <br />
              모든 사람이 평안을 누리는 곳입니다.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">연락처</h3>
            <ul className="space-y-2 text-sm text-primary-300">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>경기도 수원시</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:031-000-0000" className="hover:text-white transition-colors">
                  031-000-0000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a
                  href="mailto:info@peacechurch.kr"
                  className="hover:text-white transition-colors"
                >
                  info@peacechurch.kr
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Youtube className="w-4 h-4 flex-shrink-0" />
                <a
                  href="https://youtube.com/channel/UC9c1llukhxYQ5nma3550-kg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  유튜브 채널 바로가기
                </a>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-white mb-4">바로가기</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/sermons"
                  className="text-primary-300 hover:text-white transition-colors"
                >
                  설교 말씀
                </Link>
              </li>
              <li>
                <Link
                  href="/devotional"
                  className="text-primary-300 hover:text-white transition-colors"
                >
                  매일 묵상
                </Link>
              </li>
              <li>
                <Link
                  href="/bible"
                  className="text-primary-300 hover:text-white transition-colors"
                >
                  성경 찾기 (개역개정)
                </Link>
              </li>
              <li>
                <Link
                  href="/hymnal"
                  className="text-primary-300 hover:text-white transition-colors"
                >
                  찬송가
                </Link>
              </li>
              <li>
                <Link
                  href="/donate"
                  className="text-primary-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Heart className="w-3 h-3" />
                  후원하기
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-8 text-center">
          <p className="text-primary-400 text-sm">
            © {new Date().getFullYear()} 수원평안교회. All rights reserved.
          </p>
          <p className="text-primary-500 text-xs mt-1">
            주일예배 매주 일요일 오전 11시
          </p>
        </div>
      </div>
    </footer>
  );
}
