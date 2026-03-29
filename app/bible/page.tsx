import { BIBLE_BOOKS, FAMOUS_VERSES } from "@/lib/bible-data";
import BibleSearch from "@/components/BibleSearch";
import { BookOpen } from "lucide-react";

export const metadata = {
  title: "성경 찾기 (개역개정)",
};

export default function BiblePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-4 text-purple-300" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">성경 찾기</h1>
          <p className="text-purple-200">개역개정 | 구약 39권 · 신약 27권</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <BibleSearch bibleBooks={BIBLE_BOOKS} famousVerses={FAMOUS_VERSES} />
      </div>
    </div>
  );
}
