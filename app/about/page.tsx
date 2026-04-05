import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, Phone, Youtube, BookOpen, Heart, Users } from "lucide-react";
import { BreadcrumbSchema } from "@/components/JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";

export const metadata: Metadata = {
  title: "교회 소개",
  description:
    "평안을 함께 누리는 복음 공동체, 수원평안교회. 그리스도 중심적 설교와 세움 양육 프로그램을 통해 가정과 다음세대를 세워가는 교회입니다.",
  keywords: [
    "수원평안교회 소개", "정재광 목사", "수원 교회", "권선구 교회",
    "호매실 교회", "대한예수교장로회", "주일예배 시간", "세움 양육",
  ],
  openGraph: {
    title: "수원평안교회 소개 | 정재광 담임목사",
    description: "평안을 함께 누리는 복음 공동체, 수원평안교회. 정재광 담임목사.",
    url: `${BASE_URL}/about`,
  },
  alternates: { canonical: `${BASE_URL}/about` },
};

const VALUES = [
  {
    icon: BookOpen,
    title: "말씀 중심",
    desc: "그리스도 중심적 설교를 통해 말씀 위에 성장하는 건강한 교회입니다.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    icon: Heart,
    title: "가정을 세우는 교회",
    desc: "'세움' 양육 프로그램으로 학부모를 세우고 가정을 세워 다음세대를 키웁니다.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: Users,
    title: "선교적 공동체",
    desc: "지역공동체를 예수님의 마음으로 섬기며 하나님의 사랑을 흘려보내는 교회입니다.",
    color: "bg-green-50 text-green-700",
  },
];

// 주일예배
const SUNDAY = [
  { name: "1부예배", time: "오전 9:00",  place: "3층 대예배실" },
  { name: "2부예배", time: "오전 11:00", place: "3층 대예배실", main: true },
  { name: "3부예배", time: "오후 2:00",  place: "3층 대예배실" },
];

// 주중예배
const WEEKDAY = [
  { name: "수요예배",   time: "오후 8:00", place: "3층 대예배실" },
  { name: "금요기도회", time: "오후 8:00", place: "3층 대예배실" },
];

// 다음세대 예배
const NEXT_GEN = [
  { name: "유아·유치부 1부",         time: "오전 11:00",       place: "1층 유치부실" },
  { name: "아동부(유·초등부) 1부",   time: "오전 11:00",       place: "2층 중예배실" },
  { name: "아동부(유·초등부) 2부",   time: "오후 2:00",        place: "2층 중예배실" },
  { name: "청소년부(중고등부)",       time: "오전 9:30",        place: "2층 중예배실" },
  { name: "청년부",                  time: "오후 3:30",        place: "2층 청년부실" },
  { name: "어와나 Sparks·T&T",      time: "오후 3:30",        place: "4층 체육관" },
  { name: "어와나 Trek·Journey",    time: "토요일 오전 10:00", place: "4층 체육관" },
  { name: "영어주일학교(RTA)",       time: "오후 2:00",        place: "2층 유년부실" },
];

const TRANSPORT = [
  { icon: "🚌", title: "버스",     lines: ["호매실지구 방면 버스 이용", "평안교회 정류장 하차"] },
  { icon: "🚇", title: "지하철",   lines: ["수원역(1호선) 하차", "버스 환승 → 호매실 방면"] },
  { icon: "🚗", title: "자가용",   lines: ["호매실로 218번길 110", "교회 주차장 이용 가능"] },
];

function ScheduleTable({ rows }: { rows: { name: string; time: string; place: string; main?: boolean }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-primary-50">
            <th className="text-left px-4 py-2.5 font-semibold text-primary-800 w-1/3">구분</th>
            <th className="text-left px-4 py-2.5 font-semibold text-primary-800 w-1/3">시간</th>
            <th className="text-left px-4 py-2.5 font-semibold text-primary-800">장소</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((r) => (
            <tr key={r.name} className={r.main ? "bg-primary-50/60 font-semibold" : ""}>
              <td className="px-4 py-3 text-gray-800">
                {r.name}
                {r.main && <span className="ml-2 text-xs bg-primary-700 text-white px-1.5 py-0.5 rounded-full">주예배</span>}
              </td>
              <td className="px-4 py-3 text-gray-700">{r.time}</td>
              <td className="px-4 py-3 text-gray-500">{r.place}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
            <p className="text-primary-300 text-sm font-semibold tracking-widest uppercase mb-3">대한예수교장로회</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-5">수원평안교회</h1>
            <p className="text-primary-200 text-lg max-w-2xl mx-auto leading-relaxed">
              평안을 함께 누리는 복음 공동체
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">

          {/* 인사말 */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-7 bg-primary-700 rounded-full" />
              <h2 className="text-2xl font-bold text-gray-900">인사말</h2>
            </div>
            <div className="space-y-5 text-gray-700 leading-relaxed">
              <p className="text-lg font-semibold text-primary-800">
                평안을 함께 누리는 복음 공동체, 수원평안교회입니다.
              </p>
              <p>
                수원평안교회는 <strong>그리스도 중심적 설교</strong>를 통해 말씀 위에 성장하는 건강한 교회입니다.
                또한 <strong>&lsquo;세움&rsquo; 양육 프로그램</strong>을 통해 학부모를 세우고 가정을 세움으로,
                그 위에 예수님의 눈으로 다음세대를 세워가는 교회입니다.
              </p>
              <p>
                수원평안교회는 한 사람의 변화가 가정을 살리고, 가정의 회복이 교회를 살리며,
                교회의 섬김이 지역사회와 시대를 살린다는 믿음을 가지고 성장을 이루어 가는
                <strong> 역동적인 교회</strong>입니다.
              </p>
              <p>
                수원평안교회는 성도의 풍성한 교제가 있는 복음 공동체로서, 지역공동체를 예수님의 마음으로
                섬기고, 그 속에서 하나님의 사랑을 흘려보내는 사명을 소중히 여기는
                <strong> 선교적 공동체</strong>입니다.
              </p>
              <p>
                수원평안교회는 오늘도 하나님의 일하심을 기대하며 여러분을 기다립니다.
                하나님이 주시는 참된 평안과 복음의 소망을 깨달아 가는 여정에 여러분을 기쁨으로 초대합니다.
                주 안에서 사랑하고 축복합니다.
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-gray-500 text-sm">수원평안교회 담임목사</p>
                <p className="text-xl font-bold text-gray-900 mt-1">정재광</p>
              </div>
            </div>
          </section>

          {/* 담임목사 약력 */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-10 md:flex items-start gap-10">
              <div className="flex-shrink-0 mb-6 md:mb-0 text-center">
                <div className="w-36 h-36 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <span className="text-primary-700 font-bold text-6xl">정</span>
                </div>
                <p className="mt-3 text-sm text-gray-500">담임목사</p>
                <p className="font-bold text-gray-900">정재광 목사</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-primary-600 font-semibold mb-1">Jekwang (Paul) Jung</p>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">학력 및 이력</h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  {[
                    "Azusa Pacific University (M.div)",
                    "Calvin Theological Seminary (Th.M)",
                    "총신대학교 신학대학원 (M.div Equiv)",
                    "Westminster Theological Seminary (D.min)",
                  ].map((edu) => (
                    <li key={edu} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-600 flex-shrink-0" />
                      {edu}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="https://youtube.com/channel/UC9c1llukhxYQ5nma355O-kg"
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Youtube className="w-4 h-4" /> 유튜브 설교 채널
                  </a>
                  <Link href="/sermons" className="inline-flex items-center gap-2 bg-primary-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors">
                    <BookOpen className="w-4 h-4" /> 설교 말씀 보기
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
            <div className="space-y-6">
              {/* 주일예배 */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-700 inline-block" />
                  주일예배
                </h3>
                <ScheduleTable rows={SUNDAY} />
              </div>
              {/* 주중예배 */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-700 inline-block" />
                  주중예배
                </h3>
                <ScheduleTable rows={WEEKDAY} />
              </div>
              {/* 다음세대 */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-700 inline-block" />
                  다음세대 주일예배
                </h3>
                <ScheduleTable rows={NEXT_GEN} />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-right">※ 예배 시간은 교회 사정에 따라 변경될 수 있습니다.</p>
          </section>

          {/* 오시는 길 & 연락처 */}
          <section id="contact" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary-600" />
              오시는 길 &amp; 연락처
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">주소</p>
                    <p className="text-gray-600 text-sm leading-relaxed">경기도 수원시 권선구<br />호매실로 218번길 110</p>
                    <a href="https://map.naver.com/v5/search/수원평안교회" target="_blank" rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-primary-600 hover:underline font-medium">
                      네이버 지도에서 찾기 →
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">전화</p>
                    <a href="tel:031-292-8119" className="text-primary-600 hover:text-primary-700 text-sm font-medium">031-292-8119</a>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <Youtube className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">유튜브</p>
                    <a href="https://youtube.com/channel/UC9c1llukhxYQ5nma355O-kg" target="_blank" rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm">수원평안교회 유튜브 채널</a>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-4">교통 안내</h3>
                <div className="space-y-3">
                  {TRANSPORT.map((t) => (
                    <div key={t.title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <span className="text-2xl flex-shrink-0">{t.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm mb-1">{t.title}</p>
                        {t.lines.map((line, i) => <p key={i} className="text-xs text-gray-600">{line}</p>)}
                      </div>
                    </div>
                  ))}
                </div>
                <a href="https://map.naver.com/v5/search/수원평안교회" target="_blank" rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-3 border-2 border-primary-200 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-50 transition-colors">
                  <MapPin className="w-4 h-4" /> 네이버 지도로 길찾기
                </a>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center py-4">
            <p className="text-gray-500 mb-6">온라인으로도 함께 예배드릴 수 있습니다</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sermons" className="btn-primary px-8 py-3">최신 설교 말씀 보기</Link>
              <Link href="/devotional" className="btn-secondary px-8 py-3">오늘의 묵상</Link>
              <Link href="/donate" className="btn-secondary px-8 py-3">헌금 안내</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
