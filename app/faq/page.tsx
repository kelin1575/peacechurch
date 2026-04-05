import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema, BreadcrumbSchema } from "@/components/JsonLd";
import { ChevronDown } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";

export const metadata: Metadata = {
  title: "자주 묻는 질문 (FAQ)",
  description:
    "수원평안교회에 대한 자주 묻는 질문들입니다. 예배 시간, 오시는 길, 온라인 설교 시청, 헌금 안내, 새가족 등록 방법을 확인하세요.",
  keywords: [
    "수원평안교회 FAQ", "정재광목사 설교", "주일예배 시간",
    "온라인예배", "교회 안내", "새가족 등록",
  ],
  openGraph: {
    title: "수원평안교회 자주 묻는 질문 | 정재광 목사",
    description: "예배 시간, 오시는 길, 헌금 안내 등 수원평안교회 자주 묻는 질문들",
    url: `${BASE_URL}/faq`,
  },
  alternates: { canonical: `${BASE_URL}/faq` },
};

const FAQ_GROUPS = [
  {
    group: "예배 안내",
    items: [
      {
        question: "주일예배는 몇 시에 드리나요?",
        answer:
          "수원평안교회 주일예배는 1부 오전 9시, 2부 오전 11시 두 차례 드립니다. 2부 예배가 주예배이며 담임목사 정재광 목사님께서 직접 말씀을 전하십니다. 예배는 찬양, 기도, 말씀, 헌금 순서로 진행됩니다.",
      },
      {
        question: "주일 외 평일 예배도 있나요?",
        answer:
          "네, 수요일 저녁 7시 30분 수요예배, 금요일 저녁 7시 30분 금요기도회, 매일 새벽 5시 30분 새벽기도회가 있습니다. 모두 본당에서 드립니다.",
      },
      {
        question: "온라인으로도 예배를 드릴 수 있나요?",
        answer:
          "네, 수원평안교회 공식 유튜브 채널에서 주일예배 설교를 무료로 시청하실 수 있습니다. 또한 이 사이트의 '설교 말씀' 메뉴에서 카테고리별로 정리된 설교 목록과 말씀 요약, 해석을 확인하실 수 있습니다.",
      },
    ],
  },
  {
    group: "오시는 길 & 연락처",
    items: [
      {
        question: "교회 주소가 어떻게 되나요?",
        answer:
          "수원평안교회는 경기도 수원시 권선구 호매실로 218번길 110에 위치해 있습니다. 네이버 지도나 카카오맵에서 '수원평안교회'로 검색하시면 찾아오실 수 있습니다. 교회 주차장을 이용하실 수 있습니다.",
      },
      {
        question: "전화번호와 연락처가 어떻게 되나요?",
        answer:
          "교회 대표 전화번호는 031-292-8119입니다. 평일 오전 9시 ~ 오후 6시 사이에 연락 주시면 안내를 받으실 수 있습니다.",
      },
      {
        question: "대중교통으로 어떻게 오나요?",
        answer:
          "버스 이용 시 호매실지구 방면 버스를 타고 평안교회 정류장에서 하차하시면 됩니다. 수원역(1호선)에서 버스로 환승하여 호매실 방면으로 오실 수 있습니다. 자세한 교통편은 교회 사무실(031-292-8119)로 문의해 주세요.",
      },
    ],
  },
  {
    group: "새가족 & 등록",
    items: [
      {
        question: "처음 교회에 오는데 어떻게 해야 하나요?",
        answer:
          "처음 방문하시는 분들은 주일 오전 11시 2부 예배에 편안하게 참석하시면 됩니다. 예배 후 새가족 안내를 받으실 수 있습니다. 교회 사무실(031-292-8119)에 미리 연락하시면 더욱 세심한 안내를 받으실 수 있습니다.",
      },
      {
        question: "온라인으로 새가족 등록을 할 수 있나요?",
        answer:
          "네, 교회 홈페이지(peacechurch.kr) 또는 이 사이트에서 새가족 등록 신청을 하실 수 있습니다. 등록 후 교회에서 연락을 드립니다. 직접 방문하여 등록하시는 것도 가능합니다.",
      },
      {
        question: "어린이·청소년도 함께할 수 있나요?",
        answer:
          "네, 수원평안교회는 모든 세대를 위한 교회입니다. 어린이예배, 청소년예배, 청년예배 등 연령별 예배와 교육 프로그램이 운영됩니다. 자세한 내용은 교회 사무실로 문의해 주세요.",
      },
    ],
  },
  {
    group: "헌금 & 후원",
    items: [
      {
        question: "헌금 계좌를 알고 싶습니다.",
        answer:
          "정확한 헌금 계좌번호는 교회 사무실(031-292-8119)로 문의하시거나, 이 사이트의 '섬김 > 후원하기' 페이지를 확인해 주세요. 이체 시 반드시 이름과 헌금 종류를 메모란에 기입해 주세요. (예: 홍길동 십일조)",
      },
      {
        question: "헌금 영수증(기부금 영수증)을 받을 수 있나요?",
        answer:
          "네, 발급 가능합니다. 헌금 영수증이 필요하신 분은 교회 사무실(031-292-8119)로 연락해 주세요. 연말정산 시기에 맞춰 기부금 영수증을 발급해 드립니다.",
      },
    ],
  },
  {
    group: "설교 & 콘텐츠",
    items: [
      {
        question: "정재광 목사님의 설교를 어디서 볼 수 있나요?",
        answer:
          "수원평안교회 공식 유튜브 채널에서 무료로 시청하실 수 있습니다. 또한 이 사이트의 '설교 말씀' 메뉴에서 카테고리(주일예배, 수요예배 등)별로 설교 목록을 확인하고, 말씀 요약과 신학적 해석도 함께 보실 수 있습니다.",
      },
      {
        question: "매일 묵상은 어떻게 이용하나요?",
        answer:
          "이 사이트 상단 '양육과훈련 > 매일 묵상' 메뉴를 통해 오늘의 묵상 말씀, 성경 본문, 기도문을 만나실 수 있습니다. 매일 오전 7시에 최신 설교를 기반으로 AI가 생성한 묵상이 등록됩니다. 과거 묵상도 날짜별로 찾아볼 수 있습니다.",
      },
      {
        question: "성경은 어떤 번역본을 사용하나요?",
        answer:
          "수원평안교회는 한국 교회의 표준 번역본인 개역개정 성경을 사용합니다. 이 사이트의 '성경 찾기' 메뉴에서 구약 39권, 신약 27권 전체를 검색하고 읽으실 수 있습니다.",
      },
    ],
  },
];

export default function FAQPage() {
  const breadcrumbs = [
    { name: "홈", url: BASE_URL },
    { name: "FAQ", url: `${BASE_URL}/faq` },
  ];

  const allItems = FAQ_GROUPS.flatMap((g) => g.items);

  return (
    <>
      <FAQSchema items={allItems} />
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-primary-800 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">자주 묻는 질문</h1>
            <p className="text-primary-200">수원평안교회에 대해 궁금한 점들을 모았습니다</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {FAQ_GROUPS.map((group) => (
            <section key={group.group}>
              <h2 className="text-lg font-bold text-primary-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary-700 rounded-full inline-block" />
                {group.group}
              </h2>
              <div className="space-y-2">
                {group.items.map((item, i) => (
                  <FAQItem key={i} question={item.question} answer={item.answer} />
                ))}
              </div>
            </section>
          ))}

          {/* 추가 문의 */}
          <div className="bg-primary-50 rounded-2xl p-8 border border-primary-100 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-3">더 궁금한 점이 있으신가요?</h2>
            <p className="text-gray-600 mb-6">
              아래 연락처로 문의하시거나 교회에 직접 방문해 주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:031-292-8119" className="btn-primary px-6 py-2.5 text-sm">
                📞 031-292-8119
              </a>
              <Link href="/about" className="btn-secondary px-6 py-2.5 text-sm">
                교회 소개 보기
              </Link>
              <Link href="/about#contact" className="btn-secondary px-6 py-2.5 text-sm">
                오시는 길 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none hover:bg-gray-50 transition-colors">
        <h3 className="font-semibold text-gray-900 pr-4 text-sm md:text-base">
          {question}
        </h3>
        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-6 pb-5 pt-0">
        <div className="border-t border-gray-100 pt-4">
          <p className="text-gray-600 leading-relaxed text-sm md:text-base">{answer}</p>
        </div>
      </div>
    </details>
  );
}
