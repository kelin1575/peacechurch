import { Heart, Building2, CheckCircle, Phone } from "lucide-react";
import DonateClient from "@/components/DonateClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "헌금 안내 | 수원평안교회",
  description: "수원평안교회 헌금 계좌 안내. 농협 351-1062-3026-93 (수원평안교회). 십일조, 주일헌금, 선교헌금, 감사헌금 등.",
};

const DONATION_ACCOUNTS = [
  {
    bankName: "농협은행",
    accountNumber: "351-1062-3026-93",
    accountHolder: "수원평안교회",
    description: "일반 헌금 (십일조·감사·주일헌금 등)",
  },
];

const DONATION_TYPES = [
  { icon: "🙏", title: "십일조",   desc: "소득의 십분의 일을 하나님께 드리는 헌금입니다. (말라기 3:10)" },
  { icon: "⛪", title: "주일 헌금", desc: "주일 예배를 통해 감사함으로 드리는 헌금입니다." },
  { icon: "🌏", title: "선교 헌금", desc: "국내외 선교사와 선교 사역을 위한 헌금입니다." },
  { icon: "🤲", title: "감사 헌금", desc: "하나님의 은혜에 감사하여 특별히 드리는 헌금입니다." },
  { icon: "🏗️", title: "건축 헌금", desc: "교회 건축 및 시설 유지를 위한 헌금입니다." },
  { icon: "💛", title: "구제 헌금", desc: "어려운 이웃과 지역 사회를 위해 사용되는 헌금입니다." },
];

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-700 to-amber-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 fill-amber-200 text-amber-200" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">헌금 안내</h1>
          <p className="text-amber-100 max-w-xl mx-auto leading-relaxed">
            여러분의 헌금이 하나님 나라의 확장을 위해 귀하게 사용됩니다.<br />
            드리는 기쁨으로 하나님께 영광을 돌립니다.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* 성경 말씀 */}
        <div className="bg-primary-800 text-white rounded-2xl p-6 text-center">
          <p className="text-primary-300 text-xs font-semibold mb-2">말라기 3:10</p>
          <p className="text-base md:text-lg font-serif italic leading-relaxed">
            &ldquo;만군의 여호와가 이르노라 너희의 온전한 십일조를 창고에 들여
            나의 집에 양식이 있게 하고 그것으로 나를 시험하여 내가 하늘 문을 열고
            너희에게 복을 쌓을 곳이 없도록 붓지 아니하나 보라&rdquo;
          </p>
        </div>

        {/* 계좌 안내 */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-600" />
            헌금 계좌 안내
          </h2>

          {/* 주요 계좌 카드 */}
          <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-6 mb-4">
            <p className="text-xs text-primary-500 font-semibold mb-1">일반 헌금 계좌</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-2xl font-bold text-primary-900 tracking-wide">351-1062-3026-93</p>
                <p className="text-sm text-primary-700 mt-0.5">농협은행 · 예금주: 수원평안교회</p>
              </div>
              <DonateClient account={DONATION_ACCOUNTS[0]} compact />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            * 추가 계좌(선교헌금 등)는 교회 사무실(<a href="tel:031-292-8119" className="text-primary-600 font-medium">031-292-8119</a>)로 문의해 주세요.
          </p>
        </section>

        {/* 온라인 헌금 방법 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            온라인 헌금 방법
          </h2>
          <ol className="space-y-3">
            {[
              "위 농협 계좌로 헌금을 이체합니다.",
              "이체 시 메모란에 '이름 + 헌금종류'를 기입합니다. (예: 홍길동 십일조, 홍길동 감사헌금)",
              "헌금 영수증이 필요하신 분은 교회 사무실로 연락해 주세요.",
              "기부금 영수증(연말정산용)은 교회 사무실을 통해 발급받으실 수 있습니다.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-700 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 헌금 종류 */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber-500" />
            헌금 종류
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DONATION_TYPES.map((d) => (
              <div key={d.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="text-3xl mb-3">{d.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{d.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 문의 */}
        <section className="bg-primary-50 rounded-2xl border border-primary-100 p-6 text-center">
          <Phone className="w-8 h-8 text-primary-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">헌금 관련 문의</h3>
          <p className="text-gray-600 text-sm mb-4">
            헌금 계좌, 영수증 발급, 기부금 영수증 등 궁금한 점은 교회 사무실로 연락해 주세요.
          </p>
          <a href="tel:031-292-8119"
            className="inline-flex items-center gap-2 bg-primary-700 text-white px-6 py-2.5 rounded-lg hover:bg-primary-800 transition-colors text-sm font-medium">
            <Phone className="w-4 h-4" /> 031-292-8119
          </a>
        </section>

        {/* 감사 인사 */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm leading-relaxed">
            여러분의 헌신과 섬김에 진심으로 감사드립니다.<br />
            하나님의 은혜가 여러분과 가정에 넘치기를 기도합니다.
          </p>
          <p className="mt-3 text-primary-700 font-semibold">수원평안교회 담임목사 정재광</p>
        </div>
      </div>
    </div>
  );
}
