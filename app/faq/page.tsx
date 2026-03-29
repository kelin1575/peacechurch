import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema, BreadcrumbSchema } from "@/components/JsonLd";
import { ChevronDown } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://peacechurch.kr";

export const metadata: Metadata = {
  title: "자주 묻는 질문 (FAQ)",
  description:
    "수원평안교회 정재광 목사에 대한 자주 묻는 질문들입니다. 예배 시간, 온라인 설교 시청 방법, 헌금 안내 등을 확인하세요.",
  keywords: [
    "수원평안교회 FAQ",
    "정재광목사 설교",
    "주일예배 시간",
    "온라인예배",
    "교회 안내",
  ],
  openGraph: {
    title: "수원평안교회 자주 묻는 질문 | 정재광 목사",
    description:
      "예배 시간, 설교 시청, 헌금 안내 등 수원평안교회에 대한 자주 묻는 질문들",
    url: `${BASE_URL}/faq`,
  },
  alternates: { canonical: `${BASE_URL}/faq` },
};

const FAQ_ITEMS = [
  {
    question: "수원평안교회 주일예배는 몇 시에 시작하나요?",
    answer:
      "수원평안교회 주일예배는 매주 일요일 오전 11시에 시작합니다. 담임목사 정재광이 직접 설교를 인도합니다. 예배는 찬양, 기도, 말씀, 헌금 순서로 진행됩니다.",
  },
  {
    question: "정재광 목사님의 설교를 온라인으로 볼 수 있나요?",
    answer:
      "네, 수원평안교회 공식 유튜브 채널(UC9c1llukhxYQ5nma3550-kg)에서 주일예배 설교를 무료로 시청하실 수 있습니다. 또한 이 사이트의 '설교 말씀' 메뉴에서 카테고리별로 정리된 설교 목록과 말씀 요약, 해석을 확인하실 수 있습니다.",
  },
  {
    question: "수원평안교회는 어디에 위치해 있나요?",
    answer:
      "수원평안교회는 경기도 수원시에 위치해 있습니다. 정확한 주소와 오시는 길은 교회 소개 페이지를 참고하시거나, 031-000-0000으로 문의해 주세요.",
  },
  {
    question: "매일 묵상은 어떻게 이용하나요?",
    answer:
      "사이트 상단 '매일묵상' 메뉴를 클릭하시면 오늘의 묵상 말씀, 성경 본문, 기도문을 만나실 수 있습니다. 매일 새로운 묵상 내용이 등록되며, 과거 묵상도 날짜별로 찾아볼 수 있습니다.",
  },
  {
    question: "성경은 어떤 번역본을 사용하나요?",
    answer:
      "수원평안교회는 한국 교회에서 표준으로 사용하는 개역개정 성경을 사용합니다. 사이트의 '성경 찾기' 메뉴에서 구약 39권, 신약 27권 총 66권을 찾아보실 수 있으며, Bible.com과 연동하여 개역개정 성경 본문을 읽으실 수 있습니다.",
  },
  {
    question: "헌금은 어떻게 할 수 있나요?",
    answer:
      "온라인 헌금은 '후원하기' 페이지에서 계좌번호를 확인하신 후 이체하실 수 있습니다. 이체 시 이름과 헌금 종류(예: 홍길동 십일조)를 메모란에 기입해 주세요. 직접 예배에 참석하셔서 헌금하실 수도 있습니다.",
  },
  {
    question: "설교 말씀 요약이나 해석은 어디서 볼 수 있나요?",
    answer:
      "각 설교 상세 페이지에서 '말씀 요약'과 '말씀 해석 & 적용' 섹션을 확인하실 수 있습니다. 설교 목록에서 원하는 설교를 클릭하시면 유튜브 영상과 함께 요약, 해석, 본문 성경구절이 제공됩니다.",
  },
  {
    question: "댓글로 은혜를 나눌 수 있나요?",
    answer:
      "네, 각 설교 페이지 하단의 '은혜 나눔' 섹션에서 이름과 내용을 입력하여 말씀을 통해 받은 은혜를 나눌 수 있습니다. 형제자매와 함께 은혜를 나누는 공간이니 많이 참여해 주세요.",
  },
  {
    question: "찬송가는 어떻게 찾나요?",
    answer:
      "사이트 '찬송가' 메뉴에서 번호, 제목, 가사 첫 소절로 검색하실 수 있습니다. 카테고리별(찬양과 경배, 구원, 헌신 등) 분류도 제공하며, 유튜브 찬양 영상으로 바로 이동할 수 있습니다.",
  },
  {
    question: "교회에 처음 오는데 어떻게 해야 하나요?",
    answer:
      "처음 방문하시는 분들은 주일 오전 11시 예배에 편안하게 참석하시면 됩니다. 교회 사무실(031-000-0000)에 미리 연락하시면 안내를 받으실 수 있습니다. 온라인으로 먼저 예배를 드려보고 싶으신 분은 유튜브 채널이나 이 사이트에서 설교 말씀을 들어보세요.",
  },
];

export default function FAQPage() {
  const breadcrumbs = [
    { name: "홈", url: BASE_URL },
    { name: "FAQ", url: `${BASE_URL}/faq` },
  ];

  return (
    <>
      <FAQSchema items={FAQ_ITEMS} />
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-primary-800 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              자주 묻는 질문
            </h1>
            <p className="text-primary-200">
              수원평안교회에 대해 궁금한 점들을 모았습니다
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <FAQItem key={index} question={item.question} answer={item.answer} />
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-12 bg-primary-50 rounded-2xl p-8 border border-primary-100 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              더 궁금한 점이 있으신가요?
            </h2>
            <p className="text-gray-600 mb-6">
              아래 연락처로 문의하시거나, 교회에 직접 방문해 주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:031-000-0000"
                className="btn-primary px-6 py-2.5 text-sm"
              >
                전화 문의
              </a>
              <a
                href="mailto:info@peacechurch.kr"
                className="btn-secondary px-6 py-2.5 text-sm"
              >
                이메일 문의
              </a>
              <Link href="/about" className="btn-secondary px-6 py-2.5 text-sm">
                교회 소개 보기
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
          <p className="text-gray-600 leading-relaxed text-sm md:text-base">
            {answer}
          </p>
        </div>
      </div>
    </details>
  );
}
