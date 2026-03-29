import { HYMNS, HYMN_CATEGORIES } from "@/lib/hymnal-data";
import HymnalBrowser from "@/components/HymnalBrowser";
import { Music } from "lucide-react";

export const metadata = {
  title: "찬송가",
};

export default function HymnalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-800 to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Music className="w-10 h-10 mx-auto mb-4 text-orange-200" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">찬송가</h1>
          <p className="text-orange-200">
            찬양과 경배로 하나님께 나아가세요
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <HymnalBrowser hymns={HYMNS} categories={HYMN_CATEGORIES} />
      </div>
    </div>
  );
}
