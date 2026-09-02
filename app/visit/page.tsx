import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Car,
  Bus,
  Phone,
  Baby,
  Shirt,
  Wallet,
  UserCheck,
  ChevronRight,
  Play,
  BookOpen,
  HeartHandshake,
} from "lucide-react";
import { BreadcrumbSchema } from "@/components/JsonLd";
import {
  CHURCH,
  SUNDAY_SERVICES,
  WEEKDAY_SERVICES,
  NEXT_GEN_SERVICES,
  FLOORS,
} from "@/lib/church";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";

export const metadata: Metadata = {
  title: "처음 오신 분",
  description:
    "수원평안교회에 처음 오시나요? 예배 시간, 주차 안내, 자녀 동반, 복장까지 미리 알려드립니다. 아무 준비 없이 오셔도 괜찮습니다.",
  keywords: [
    "수원평안교회 처음",
    "수원 교회 방문",
    "호매실 교회",
    "권선구 교회 예배시간",
    "새가족 등록",
    "교회 처음 가는 법",
  ],
  openGraph: {
    title: "처음 오신 분께 | 수원평안교회",
    description:
      "예배 시간, 주차, 자녀 동반, 복장 안내. 처음 오시는 걸음이 편안하시도록 미리 알려드립니다.",
    url: `${BASE_URL}/visit`,
  },
  alternates: { canonical: `${BASE_URL}/visit` },
};

/** 처음 오시는 분이 실제로 걱정하시는 것들 */
const WORRIES = [
  {
    icon: Shirt,
    q: "무엇을 입고 가야 하나요?",
    a: "편안한 평상복이면 충분합니다. 정장을 갖춰 입으실 필요 없습니다. 하나님은 옷이 아니라 마음을 보십니다.",
  },
  {
    icon: Wallet,
    q: "헌금을 꼭 해야 하나요?",
    a: "아닙니다. 헌금은 성도가 자원하는 마음으로 드리는 것이지 방문객께 요구하는 것이 아닙니다. 헌금 시간에 그냥 앉아 계셔도 아무도 신경 쓰지 않습니다.",
  },
  {
    icon: UserCheck,
    q: "앞에 나가서 소개해야 하나요?",
    a: "원하지 않으시면 하지 않으셔도 됩니다. 조용히 예배만 드리고 돌아가셔도 좋습니다. 준비되셨을 때 안내데스크에 말씀해 주시면 그때 인사드리겠습니다.",
  },
  {
    icon: Clock,
    q: "예배는 얼마나 걸리나요?",
    a: "약 1시간 10분 정도입니다. 찬양, 기도, 성경 봉독, 설교, 축도 순으로 진행됩니다.",
  },
];

/** 예배 순서 — 처음 오신 분이 흐름을 미리 아시도록 */
const ORDER_OF_SERVICE = [
  { step: "예배의 부름", desc: "다 함께 자리에 앉아 예배를 시작합니다" },
  { step: "찬양", desc: "찬송가와 찬양. 가사는 화면에 나옵니다" },
  { step: "대표 기도", desc: "한 분이 회중을 대표해 기도합니다" },
  { step: "성경 봉독", desc: "그날의 본문을 함께 읽습니다" },
  { step: "설교", desc: "정재광 담임목사 · 약 35분" },
  { step: "봉헌과 광고", desc: "헌금과 교회 소식 안내" },
  { step: "축도", desc: "축복 기도로 예배를 마칩니다" },
];

export default function VisitPage() {
  const breadcrumbs = [
    { name: "홈", url: BASE_URL },
    { name: "처음 오신 분", url: `${BASE_URL}/visit` },
  ];

  const recommended = SUNDAY_SERVICES.find((s) => s.recommended) ?? SUNDAY_SERVICES[1];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="bg-gray-50">
        {/* ── Hero ── */}
        <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white">
          <div className="container-page py-16 md:py-20">
            <nav
              aria-label="breadcrumb"
              className="flex items-center gap-2 text-primary-200 text-sm mb-5"
            >
              <Link href="/" className="hover:text-white transition-colors">
                홈
              </Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <span className="text-white">처음 오신 분</span>
            </nav>

            <p className="eyebrow text-gold-300 mb-3">Welcome · 환영합니다</p>
            <h1 className="text-3xl md:text-5xl font-bold mb-5 leading-tight">
              처음 오시는 걸음이
              <br />
              편안하시길 바랍니다
            </h1>
            <p className="scripture text-primary-100 text-base md:text-lg max-w-2xl">
              무엇을 믿는지, 어디까지 알고 있는지 묻지 않습니다.
              그저 오셔서 앉아 계시면 됩니다.
              필요한 것은 저희가 미리 준비해 두겠습니다.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={CHURCH.naverMap}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-base"
              >
                <MapPin className="w-5 h-5" aria-hidden="true" />
                지도에서 길찾기
              </a>
              <a href={`tel:${CHURCH.phone}`} className="btn-ghost-light text-base">
                <Phone className="w-5 h-5" aria-hidden="true" />
                {CHURCH.phone}
              </a>
            </div>
          </div>
        </section>

        <div className="container-page py-14 space-y-16">
          {/* ── 어느 예배로 오실까요 ── */}
          <section aria-labelledby="which-service">
            <p className="eyebrow">Step 1</p>
            <h2 id="which-service" className="section-title mt-2">
              어느 예배로 오실까요?
            </h2>
            <p className="section-subtitle">
              처음이시라면 <strong className="text-primary-700">{recommended.name} ({recommended.time})</strong>를
              권해 드립니다. 가장 많은 분이 모이고, 안내해 드릴 분도 가장 많습니다.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {SUNDAY_SERVICES.map((s) => (
                <div
                  key={s.name}
                  className={
                    s.recommended
                      ? "rounded-xl border-2 border-primary-600 bg-white p-5 shadow-soft relative"
                      : "rounded-xl border border-gray-200 bg-white p-5"
                  }
                >
                  {s.recommended && (
                    <span className="absolute -top-3 left-5 bg-primary-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      처음이라면 이 예배
                    </span>
                  )}
                  <p className="font-bold text-gray-900">{s.name}</p>
                  <p className="text-2xl font-bold text-primary-700 mt-1">{s.time}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.place}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-gray-900 mb-3">주중에도 모입니다</p>
              <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-600" role="list">
                {WEEKDAY_SERVICES.map((s) => (
                  <li key={s.name}>
                    <span className="font-medium text-gray-800">{s.name}</span>{" "}
                    <span className="text-primary-700">{s.time}</span>{" "}
                    <span className="text-gray-400">· {s.place}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── 오시는 길 ── */}
          <section aria-labelledby="how-to-come">
            <p className="eyebrow">Step 2</p>
            <h2 id="how-to-come" className="section-title mt-2">
              오시는 길과 주차
            </h2>
            <p className="section-subtitle">
              예배 시작 10분 전쯤 도착하시면 여유롭게 자리를 잡으실 수 있습니다.
            </p>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl bg-white border border-gray-200 p-5">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mb-3">
                  <Car className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">자가용</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  내비게이션에 <strong>{CHURCH.name}</strong> 또는{" "}
                  <strong>{CHURCH.addressShort}</strong>를 입력하세요.
                  교회 주차장을 이용하실 수 있습니다.
                </p>
              </div>

              <div className="rounded-xl bg-white border border-gray-200 p-5">
                <div className="w-10 h-10 rounded-xl bg-olive-50 text-olive-700 flex items-center justify-center mb-3">
                  <Bus className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">대중교통</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  1호선 <strong>수원역</strong> 하차 후 호매실 방면 버스로 환승,
                  호매실지구에서 내리시면 됩니다.
                </p>
              </div>

              <div className="rounded-xl bg-white border border-gray-200 p-5">
                <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">주소</p>
                <p className="text-sm text-gray-600 leading-relaxed">{CHURCH.address}</p>
                <a
                  href={CHURCH.naverMap}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-700 font-medium hover:underline mt-2 inline-block"
                >
                  네이버 지도로 열기 →
                </a>
              </div>
            </div>
          </section>

          {/* ── 도착하시면 ── */}
          <section aria-labelledby="on-arrival">
            <p className="eyebrow">Step 3</p>
            <h2 id="on-arrival" className="section-title mt-2">
              도착하시면
            </h2>
            <p className="section-subtitle">
              입구에서 안내하는 분께 &ldquo;처음 왔습니다&rdquo;라고만 말씀해 주세요. 나머지는 저희가 안내해 드립니다.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
                <p className="px-5 py-3 bg-primary-50 font-semibold text-primary-800 text-sm">
                  건물 층별 안내
                </p>
                <ul className="divide-y divide-gray-100" role="list">
                  {FLOORS.map((f) => (
                    <li key={f.floor} className="flex gap-4 px-5 py-3.5">
                      <span className="font-bold text-primary-700 w-10 flex-shrink-0">
                        {f.floor}
                      </span>
                      <span className="text-sm text-gray-600">{f.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
                <p className="px-5 py-3 bg-primary-50 font-semibold text-primary-800 text-sm">
                  예배 순서 미리보기
                </p>
                <ol className="divide-y divide-gray-100">
                  {ORDER_OF_SERVICE.map((o, i) => (
                    <li key={o.step} className="flex gap-4 px-5 py-3">
                      <span
                        className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <span>
                        <span className="text-sm font-medium text-gray-900 block">
                          {o.step}
                        </span>
                        <span className="text-xs text-gray-500">{o.desc}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          {/* ── 자녀와 함께 ── */}
          <section aria-labelledby="with-children">
            <div className="rounded-2xl bg-olive-50 border border-olive-200 p-6 md:p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-olive-600 text-white flex items-center justify-center flex-shrink-0">
                  <Baby className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="with-children" className="text-xl font-bold text-olive-900">
                    자녀와 함께 오신다면
                  </h2>
                  <p className="text-sm text-olive-800 mt-1 leading-relaxed max-w-2xl">
                    아이가 울거나 떠들어도 괜찮습니다. 아이 소리는 교회에서 소음이 아니라
                    다음세대가 자라는 소리입니다. 각 부서로 맡기셔도 좋고, 함께 예배드리셔도 좋습니다.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {NEXT_GEN_SERVICES.map((n) => (
                  <div
                    key={n.name}
                    className="bg-white rounded-xl border border-olive-200 p-4"
                  >
                    <p className="text-xs text-olive-700 font-semibold">{n.age}</p>
                    <p className="font-semibold text-gray-900 text-sm mt-0.5">{n.name}</p>
                    <p className="text-xs text-gray-500 mt-1.5">{n.time}</p>
                    <p className="text-xs text-gray-400">{n.place}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 걱정되시는 것들 ── */}
          <section aria-labelledby="worries">
            <p className="eyebrow">솔직한 답변</p>
            <h2 id="worries" className="section-title mt-2">
              이런 것이 걱정되셨나요
            </h2>
            <p className="section-subtitle">
              많은 분이 말은 못 하고 속으로 궁금해하시는 것들입니다.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {WORRIES.map((w) => (
                <div key={w.q} className="rounded-xl bg-white border border-gray-200 p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <w.icon className="w-4 h-4 text-primary-700" aria-hidden="true" />
                    <p className="font-semibold text-gray-900 text-sm">{w.q}</p>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{w.a}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-gray-500">
              더 궁금하신 점은{" "}
              <Link href="/faq" className="text-primary-700 font-medium hover:underline">
                자주 묻는 질문
              </Link>
              에서 확인하시거나,{" "}
              <a
                href={`tel:${CHURCH.phone}`}
                className="text-primary-700 font-medium hover:underline"
              >
                {CHURCH.phone}
              </a>
              로 전화 주세요.
            </p>
          </section>

          {/* ── 오시기 전에 ── */}
          <section aria-labelledby="before-you-come">
            <div className="rounded-2xl bg-primary-800 text-white p-6 md:p-10">
              <p className="eyebrow text-gold-300">오시기 전에</p>
              <h2 id="before-you-come" className="text-2xl font-bold mt-2 mb-3">
                먼저 온라인으로 만나보셔도 좋습니다
              </h2>
              <p className="text-primary-100 max-w-2xl leading-relaxed mb-7">
                교회 문턱이 아직 높게 느껴지신다면, 설교부터 들어보세요.
                어떤 말씀을 전하는 교회인지 아시고 오시면 첫 걸음이 훨씬 가볍습니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/sermons"
                  className="group rounded-xl bg-white/10 border border-white/20 p-5 hover:bg-white/20 transition-colors"
                >
                  <Play className="w-6 h-6 text-gold-300 mb-3" aria-hidden="true" />
                  <p className="font-semibold">설교 말씀</p>
                  <p className="text-sm text-primary-200 mt-1">
                    정재광 목사님의 주일 말씀 전체
                  </p>
                </Link>
                <Link
                  href="/devotional"
                  className="group rounded-xl bg-white/10 border border-white/20 p-5 hover:bg-white/20 transition-colors"
                >
                  <BookOpen className="w-6 h-6 text-gold-300 mb-3" aria-hidden="true" />
                  <p className="font-semibold">매일 묵상</p>
                  <p className="text-sm text-primary-200 mt-1">
                    오늘의 본문과 짧은 기도
                  </p>
                </Link>
                <Link
                  href="/prayer"
                  className="group rounded-xl bg-white/10 border border-white/20 p-5 hover:bg-white/20 transition-colors"
                >
                  <HeartHandshake className="w-6 h-6 text-gold-300 mb-3" aria-hidden="true" />
                  <p className="font-semibold">기도의 벽</p>
                  <p className="text-sm text-primary-200 mt-1">
                    기도제목을 남겨주시면 함께 기도합니다
                  </p>
                </Link>
              </div>
            </div>
          </section>

          {/* ── 맺음 ── */}
          <section className="text-center pb-4">
            <blockquote className="max-w-2xl mx-auto">
              <p className="scripture text-lg md:text-xl text-gray-800">
                &ldquo;수고하고 무거운 짐 진 자들아 다 내게로 오라
                내가 너희를 쉬게 하리라&rdquo;
              </p>
              <footer className="mt-4 text-sm font-semibold text-gold-700">
                마태복음 11:28
              </footer>
            </blockquote>
            <p className="mt-8 text-gray-600">
              오시는 날, 문 앞에서 기다리겠습니다.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {CHURCH.fullName} · {CHURCH.pastorTitle} {CHURCH.pastor}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
