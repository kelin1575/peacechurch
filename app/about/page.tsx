import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, Phone, Youtube, BookOpen, Heart, Users, Cross } from "lucide-react";
import { BreadcrumbSchema } from "@/components/JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";

export const metadata: Metadata = {
  title: "교회 소개",
  description:
    "대한예수교장로회 수원평안교회는 경기도 수원시 권선구에 위치한 교회입니다. 담임목사 정재광이 섬기는 말씀 중심 공동체입니다.",
  keywords: [
    "수원평안교회 소개", "정재광 목사", "수원 교회", "권선구 교회",
    "호매실 교회", "대한예수교장로회", "주일예배 시간",
  ],
  openGraph: {
    title: "수원평안교회 소개 | 정재광 담임목사",
    description: "대한예수교장로회 수원평안교회 정재광 목사님이 섬기는 말씀 중심 교회.",
    url: `${BASE_URL}/about`,
  },
  alternates: { canonical: `${BASE_URL}/about` },
};

const VALUES = [
  {
    icon: BookOpen,
    title: "말씀 중심",
    desc: "오직 하나님의 말씀 위에 서서 말씀이 삶과 공동체의 중심이 되는 교회입니다.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    icon: Heart,
    title: "사랑의 공동체",
    desc: "서로 사랑하고 섬기며 함께 성장하는 따뜻한 가족 공동체입니다.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: Users,
    title: "열린 교회",
    desc: "모든 사람을 환영하며 다음세대를 품는 선교적 교회입니다.",
    color: "bg-green-50 text-green-700",
  },
];

const SCHEDULES = [
  { day: "주일", time: "오전 09:00", name: "주일 1부예배", desc: "본당", main: false },
  { day: "주일", time: "오전 11:00", name: "주일 2부예배", desc: "본당", main: true },
  { day: "수요일", time: "저녁 07:30", name: "수요예배", desc: "본당", main: false },
  { day: "금요일", time: "저녁 07:30", name: "금요기도회", desc: "본당", main: false },
  { day: "매일", time: "오전 05:30", name: "새벽기도회", desc: "본당", main: false },
];

const TRANSPORT = [
  {
    icon: "🚌",
    title: "버스",
    lines: [
      "호매실지구 방면 버스 이용",
      "평안교회 정류장 하차",
    ],
  },
  {
    icon: "🚇",
    title: "지하철",
    lines: [
      "수원역 (1호선) 하차",
      "버스 환승 → 호매실 방면",
    ],
  },
  {
    icon: "🚗",
    title: "자가용",
    lines: [
      "호매실로 218번길 110",
      "교회 주차장 이용 가능",
    ],
  },
];

export default function AboutPage() {
  const breadcrumbs = [
    { name: "홈", url: BASE_URL },
    { name: "교회 소개", url: `${BASE_URL}/about` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-primary-300 text-sm font-semibold tracking-widest uppercase mb-3">
              대한예수교장로회
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-5">수원평안교회</h1>
            <p className="text-primary-200 text-lg max-w-2xl mx-auto leading-relaxed">
              하나님의 말씀 위에 세워진 교회,<br />
              모든 사람이 하나님 안에서 참된 평안을 누리는 곳입니다.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">

          {/* 교회 소개 */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-7 bg-primary-700 rounded-full" />
              <h2 className="text-2xl font-bold text-gray-900">교회 소개</h2>
            </div>
            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                수원평안교회는 <strong>대한예수교장로회</strong> 소속으로,
                경기도 수원시 권선구 호매실 지역에 위치한 교회입니다.
                하나님의 말씀을 선포하고 가르치며, 성도들이 말씀 안에서 자라가는
                건강한 교회 공동체를 이루고자 합니다.
              </p>
              <p>
                우리 교회는 <strong>"말씀으로 세워지는 교회, 사랑으로 하나 되는 공동체"</strong>를
                비전으로 삼아, 예배와 말씀 묵상, 기도와 섬김을 통해 하나님과
                이웃을 사랑하는 성도들을 키워가고 있습니다.
              </p>
              <p>
                어린이·청소년·청년·장년 등 모든 세대가 함께하는 공동체로,
                다음세대를 말씀으로 양육하며 지역 사회를 섬기는 교회입니다.
              </p>
            </div>
          </section>

          {/* 담임목사 */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-10 md:flex items-center gap-10">
              <div className="flex-shrink-0 mb-6 md:mb-0">
                <div className="w-36 h-36 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <span className="text-primary-700 font-bold text-6xl">정</span>
                </div>
              </div>
              <div>
                <p className="text-primary-600 text-sm font-semibold mb-1">담임목사</p>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">정재광 목사</h2>
                <p className="text-gray-500 text-sm mb-4">수원평안교회 담임목사</p>
                <p className="text-gray-600 leading-relaxed mb-5">
                  정재광 목사는 하나님의 말씀을 삶 속에서 살아내는 교회를 꿈꾸며
                  수원평안교회를 섬기고 있습니다. 매주 주일 하나님의 살아있는
                  말씀을 통해 성도들의 삶이 변화되고, 그 변화가 가정과 지역 사회로
                  흘러가기를 소망합니다.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://youtube.com/channel/UC9c1llukhxYQ5nma355O-kg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                    유튜브 설교 채널
                  </a>
                  <Link
                    href="/sermons"
                    className="inline-flex items-center gap-2 bg-primary-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    설교 말씀 보기
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 핵심 가치 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-7 bg-primary-700 rounded-full inline-block" />
              핵심 가치
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {VALUES.map((v) => (
                <div key={v.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${v.color}`}>
                    <v.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 예배 시간 */}
          <section id="worship">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary-600" />
              예배 시간 안내
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {SCHEDULES.map((s, idx) => (
                <div
                  key={s.name}
                  className={`flex items-center justify-between px-6 py-4 ${
                    idx < SCHEDULES.length - 1 ? "border-b border-gray-50" : ""
                  } ${s.main ? "bg-primary-50 border-l-4 border-l-primary-700" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-semibold w-16 flex-shrink-0 ${s.main ? "text-primary-700" : "text-gray-500"}`}>
                      {s.day}
                    </span>
                    <div>
                      <span className={`font-bold block ${s.main ? "text-primary-900 text-lg" : "text-gray-800"}`}>
                        {s.name}
                        {s.main && (
                          <span className="ml-2 text-xs bg-primary-700 text-white px-2 py-0.5 rounded-full font-normal align-middle">
                            주예배
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-400">{s.desc}</span>
                    </div>
                  </div>
                  <span className={`font-semibold flex-shrink-0 ${s.main ? "text-primary-700 text-lg" : "text-gray-600"}`}>
                    {s.time}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">※ 예배 시간은 교회 사정에 따라 변경될 수 있습니다.</p>
          </section>

          {/* 오시는 길 & 연락처 */}
          <section id="contact" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary-600" />
              오시는 길 &amp; 연락처
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 연락처 정보 */}
              <div className="space-y-5">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">주소</p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      경기도 수원시 권선구<br />
                      호매실로 218번길 110
                    </p>
                    <a
                      href="https://map.naver.com/v5/search/수원평안교회"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-primary-600 hover:underline font-medium"
                    >
                      네이버 지도에서 찾기 →
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">전화</p>
                    <a href="tel:031-292-8119" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      031-292-8119
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <Youtube className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">유튜브</p>
                    <a
                      href="https://youtube.com/channel/UC9c1llukhxYQ5nma355O-kg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      수원평안교회 유튜브 채널
                    </a>
                  </div>
                </div>
              </div>

              {/* 교통편 */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4">교통 안내</h3>
                <div className="space-y-3">
                  {TRANSPORT.map((t) => (
                    <div key={t.title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <span className="text-2xl flex-shrink-0">{t.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm mb-1">{t.title}</p>
                        {t.lines.map((line, i) => (
                          <p key={i} className="text-xs text-gray-600">{line}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 지도 링크 */}
                <a
                  href="https://map.naver.com/v5/search/수원평안교회"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-3 border-2 border-primary-200 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-50 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  네이버 지도로 길찾기
                </a>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center py-4">
            <p className="text-gray-500 mb-6">온라인으로도 함께 예배드릴 수 있습니다</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sermons" className="btn-primary px-8 py-3">
                최신 설교 말씀 보기
              </Link>
              <Link href="/devotional" className="btn-secondary px-8 py-3">
                오늘의 묵상
              </Link>
              <Link href="/donate" className="btn-secondary px-8 py-3">
                헌금 안내
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
