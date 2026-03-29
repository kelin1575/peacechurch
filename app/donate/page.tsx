import { Heart, CreditCard, Building2, Copy, CheckCircle } from "lucide-react";
import DonateClient from "@/components/DonateClient";

export const metadata = {
  title: "후원하기",
};

const DONATION_ACCOUNTS = [
  {
    bankName: "국민은행",
    accountNumber: "000-000-000000",
    accountHolder: "수원평안교회",
    description: "교회 일반 헌금",
  },
  {
    bankName: "신한은행",
    accountNumber: "000-000-000000",
    accountHolder: "수원평안교회",
    description: "선교 헌금",
  },
];

const DONATION_WAYS = [
  {
    title: "십일조",
    description: "소득의 십분의 일을 하나님께 드리는 헌금입니다.",
    icon: "🙏",
  },
  {
    title: "주일 헌금",
    description: "주일 예배를 통해 드리는 감사 헌금입니다.",
    icon: "⛪",
  },
  {
    title: "선교 헌금",
    description: "국내외 선교를 위한 헌금입니다.",
    icon: "🌏",
  },
  {
    title: "건축 헌금",
    description: "교회 건축과 시설을 위한 헌금입니다.",
    icon: "🏗️",
  },
];

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gold-700 to-amber-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-gold-200 fill-gold-200" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">후원하기</h1>
          <p className="text-amber-100 max-w-xl mx-auto leading-relaxed">
            여러분의 헌금이 하나님 나라의 확장을 위해 사용됩니다.
            <br />
            하나님께서 넘치도록 갚아 주실 것입니다.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Scripture */}
        <div className="bg-primary-800 text-white rounded-2xl p-6 mb-10 text-center">
          <p className="text-primary-200 text-sm mb-2">말라기 3:10</p>
          <p className="text-lg font-serif italic leading-relaxed">
            &ldquo;만군의 여호와가 이르노라 너희의 온전한 십일조를 창고에 들여
            나의 집에 양식이 있게 하고 그것으로 나를 시험하여 내가 하늘 문을 열고
            너희에게 복을 쌓을 곳이 없도록 붓지 아니하나 보라&rdquo;
          </p>
        </div>

        {/* Account info */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary-600" />
            헌금 계좌 안내
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DONATION_ACCOUNTS.map((account, index) => (
              <DonateClient key={index} account={account} />
            ))}
          </div>
        </div>

        {/* Donation types */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6 text-gold-500" />
            헌금 종류
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DONATION_WAYS.map((way, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              >
                <div className="text-3xl mb-3">{way.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{way.title}</h3>
                <p className="text-sm text-gray-500">{way.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Online donation info */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 mb-8">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                온라인 헌금 안내
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 위의 계좌로 이체하실 때 헌금 종류를 메모란에 기입해 주세요</li>
                <li>• 예) "홍길동 십일조", "홍길동 선교헌금"</li>
                <li>• 헌금 영수증이 필요하신 분은 교회 사무실로 연락해 주세요</li>
                <li>• 문의: info@peacechurch.kr</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Thank you */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm leading-relaxed">
            여러분의 헌금과 섬김에 진심으로 감사드립니다.
            <br />
            하나님의 은혜가 여러분과 함께 하시기를 기도합니다.
          </p>
          <p className="mt-3 text-primary-700 font-medium">수원평안교회 정재광 목사</p>
        </div>
      </div>
    </div>
  );
}
