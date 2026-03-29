import { prisma } from "@/lib/db";
import { formatDate, formatDateShort } from "@/lib/utils";
import { BookOpen, Calendar, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

async function getTodayDevotional() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    return await prisma.devotional.findFirst({
      where: { date: { gte: today, lt: tomorrow } },
    });
  } catch {
    return null;
  }
}

async function getRecentDevotionals(skip = 1) {
  try {
    return await prisma.devotional.findMany({
      orderBy: { date: "desc" },
      skip,
      take: 7,
    });
  } catch {
    return [];
  }
}

export default async function DevotionalPage() {
  const [todayDevotional, recentDevotionals] = await Promise.all([
    getTodayDevotional(),
    getRecentDevotionals(),
  ]);

  const mockDevotional = {
    id: "mock",
    title: "하나님의 은혜로 충분합니다",
    scripture: "고린도후서 12:9",
    content: `오늘의 본문은 사도 바울이 "가시"라고 부른 고난을 통해 하나님의 은혜를 깊이 경험하는 이야기입니다.

바울은 세 번이나 이 고통을 제거해 달라고 간구했습니다. 그러나 하나님의 응답은 예상과 달랐습니다. "내 은혜가 네게 족하도다."

우리도 인생의 여러 어려움 앞에서 하나님께 제거해 달라고 기도합니다. 때로는 질병, 때로는 관계의 상처, 때로는 경제적 어려움... 그런데 하나님은 때때로 상황을 바꾸시는 대신 우리 안에 역사하시는 은혜를 주십니다.

"내 능력이 약한 데서 온전하여짐이라" - 이 말씀은 우리의 약함이 하나님의 강함이 나타나는 통로가 됨을 가르쳐 줍니다. 오늘 우리의 약함을 인정하고, 그 자리에서 하나님의 은혜를 경험하는 하루가 되기를 소망합니다.`,
    prayer: `하나님 아버지, 오늘 저의 연약함을 주님 앞에 내려놓습니다. 제 힘으로 해결하려 했던 문제들을 주님께 맡깁니다. 주님의 은혜가 제게 족함을 믿으며, 그 은혜 안에서 오늘 하루를 걸어가게 하소서. 예수님의 이름으로 기도합니다. 아멘.`,
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const devotional = todayDevotional || mockDevotional;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-800 to-green-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-4 text-green-300" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">매일 묵상</h1>
          <p className="text-green-200">
            {formatDate(new Date())}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main devotional */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scripture */}
            <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl p-6 text-white">
              <p className="text-primary-300 text-xs font-medium mb-1">오늘의 본문</p>
              <p className="text-gold-400 font-bold text-xl mb-1">{devotional.scripture}</p>
              <p className="text-white font-bold text-2xl">{devotional.title}</p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-6 bg-green-500 rounded-full" />
                <h2 className="font-bold text-gray-900">오늘의 묵상</h2>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                  {devotional.content}
                </p>
              </div>
            </div>

            {/* Prayer */}
            {devotional.prayer && (
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-amber-600" />
                  <h2 className="font-bold text-amber-800">오늘의 기도</h2>
                </div>
                <p className="text-amber-900 leading-relaxed italic text-sm">
                  {devotional.prayer}
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 text-gray-500 hover:text-primary-700 text-sm transition-colors">
                <ChevronLeft className="w-4 h-4" />
                이전 묵상
              </button>
              <button className="flex items-center gap-2 text-gray-500 hover:text-primary-700 text-sm transition-colors">
                다음 묵상
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendar hint */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">최근 묵상</h3>
              </div>
              {recentDevotionals.length > 0 ? (
                <ul className="space-y-2">
                  {recentDevotionals.map((d) => (
                    <li key={d.id}>
                      <a
                        href={`/devotional?date=${d.date.toISOString().split("T")[0]}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-xs text-gray-400 mb-0.5">
                          {formatDateShort(d.date)}
                        </p>
                        <p className="text-sm text-gray-700 font-medium line-clamp-1">
                          {d.title}
                        </p>
                        <p className="text-xs text-primary-600 mt-0.5">
                          {d.scripture}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  등록된 묵상이 없습니다
                </p>
              )}
            </div>

            {/* Bible link */}
            <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
              <h3 className="font-semibold text-primary-800 mb-2">성경 본문 찾기</h3>
              <p className="text-sm text-primary-600 mb-3">
                오늘의 본문을 성경에서 직접 읽어보세요
              </p>
              <Link
                href={`/bible?q=${encodeURIComponent(devotional.scripture)}`}
                className="btn-primary text-sm py-2.5 w-full justify-center"
              >
                <BookOpen className="w-4 h-4" />
                {devotional.scripture} 보기
              </Link>
            </div>

            {/* Sermon link */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">관련 설교 말씀</h3>
              <p className="text-sm text-gray-500 mb-3">
                목사님의 설교 말씀과 함께 묵상해보세요
              </p>
              <Link
                href="/sermons"
                className="btn-secondary text-sm py-2.5 w-full justify-center"
              >
                설교 말씀 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
