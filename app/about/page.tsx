import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, Phone, Mail, Youtube, Users, BookOpen, Heart } from "lucide-react";
import { BreadcrumbSchema } from "@/components/JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";

export const metadata: Metadata = {
  title: "교회 소개",
  description:
    "수원평안교회는 경기도 수원시에 위치한 교회로, 담임목사 정재광이 섬기는 공동체입니다. 매주 일요일 오전 11시 주일예배를 드립니다.",
  keywords: [
    "수원평안교회 소개",
    "정재광 목사",
    "수원 교회",
    "경기도 교회",
    "주일예배 시간",
  ],
  openGraph: {
    title: "수원평안교회 소개 | 정재광 담임목사",
    description:
      "수원평안교회 정재광 목사님이 섬기는 하나님의 교회. 매주 일요일 오전 11시 주일예배.",
    url: `${BASE_URL}/about`,
  },
  alternates: { canonical: `${BASE_URL}/about` },
};

const VALUES = [
  {
    icon: BookOpen,
    title: "말씀 중심",
    desc: "하나님의 말씀이 우리 삶과 공동체의 중심이 됩니다.",
  },
  {
    icon: Heart,
    title: "사랑의 공동체",
    desc: "서로 사랑하고 돌보는 따뜻한 가족 공동체입니다.",
  },
  {
    icon: Users,
    title: "열린 교회",
    desc: "모든 사람을 환영하며 함께 성장하는 교회입니다.",
  },
];

const SCHEDULES = [
  { day: "주일", time: "오전 11:00", name: "주일예배", main: true },
  { day: "수요일", time: "저녁 7:30", name: "수요예배", main: false },
  { day: "매일", time: "오전 5:30", name: "새벽기도", main: false },
  { day: "금요일", time: "저녁 7:30", name: "금요기도회", main: false },
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
        <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              수원평안교회를 소개합니다
            </h1>
            <p className="text-primary-200 text-lg max-w-2xl mx-auto leading-relaxed">
              하나님의 말씀 위에 세워진 교회,
              <br />
              모든 사람이 평안을 누리는 곳입니다
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Pastor intro */}
          <section
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            aria-labelledby="pastor-heading"
          >
            <div className="p-8 md:flex items-center gap-10">
              <div className="flex-shrink-0 mb-6 md:mb-0">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary-700 font-bold text-5xl">정</span>
                </div>
              </div>
              <div>
                <h2
                  id="pastor-heading"
                  className="text-2xl font-bold text-gray-900 mb-1"
                >
                  정재광 목사
                </h2>
                <p className="text-primary-700 font-semibold mb-4">
                  수원평안교회 담임목사
                </p>
                <p className="text-gray-600 leading-relaxed">
                  정재광 목사는 하나님의 말씀을 삶 속에서 살아내는 교회를 꿈꾸며
                  수원평안교회를 섬기고 있습니다. 매주 주일 하나님의 살아있는
                  말씀을 통해 성도들의 삶이 변화되고, 그 변화가 가정과 사회로
                  흘러가기를 소망합니다.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
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

          {/* Core values */}
          <section aria-labelledby="values-heading">
            <h2
              id="values-heading"
              className="text-2xl font-bold text-gray-900 mb-6"
            >
              핵심 가치
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {VALUES.map((v) => (
                <div
                  key={v.title}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
                >
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-7 h-7 text-primary-700" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {v.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Worship schedule */}
          <section aria-labelledby="schedule-heading">
            <h2
              id="schedule-heading"
              className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"
            >
              <Clock className="w-6 h-6 text-primary-600" />
              예배 시간 안내
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {SCHEDULES.map((s, idx) => (
                <div
                  key={s.name}
                  className={`flex items-center justify-between px-6 py-4 ${
                    idx < SCHEDULES.length - 1 ? "border-b border-gray-50" : ""
                  } ${s.main ? "bg-primary-50" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-semibold w-16 ${
                        s.main ? "text-primary-700" : "text-gray-500"
                      }`}
                    >
                      {s.day}
                    </span>
                    <span
                      className={`font-bold ${
                        s.main ? "text-primary-900 text-lg" : "text-gray-800"
                      }`}
                    >
                      {s.name}
                    </span>
                    {s.main && (
                      <span className="text-xs bg-primary-700 text-white px-2 py-0.5 rounded-full">
                        주예배
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-semibold ${
                      s.main ? "text-primary-700 text-lg" : "text-gray-600"
                    }`}
                  >
                    {s.time}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Location & Contact */}
          <section
            aria-labelledby="contact-heading"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            <h2
              id="contact-heading"
              className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"
            >
              <MapPin className="w-6 h-6 text-primary-600" />
              오시는 길 & 연락처
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">주소</p>
                    <p className="text-gray-600 text-sm">경기도 수원시</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">전화</p>
                    <a
                      href="tel:031-000-0000"
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      031-000-0000
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">이메일</p>
                    <a
                      href="mailto:info@peacechurch.kr"
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      info@peacechurch.kr
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Youtube className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">유튜브</p>
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
              <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MapPin className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">지도</p>
                  <a
                    href="https://map.naver.com/v5/search/수원평안교회"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-primary-600 hover:underline"
                  >
                    네이버 지도에서 찾기 →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center py-6">
            <p className="text-gray-500 mb-6">
              온라인으로도 함께 예배드릴 수 있습니다
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sermons" className="btn-primary px-8 py-3">
                최신 설교 말씀 보기
              </Link>
              <Link href="/devotional" className="btn-secondary px-8 py-3">
                오늘의 묵상
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
