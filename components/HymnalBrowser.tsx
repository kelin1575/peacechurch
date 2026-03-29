"use client";

import { useState } from "react";
import { Search, Music, ExternalLink } from "lucide-react";

interface Hymn {
  number: number;
  title: string;
  category: string;
  firstLine: string;
}

interface HymnalBrowserProps {
  hymns: Hymn[];
  categories: string[];
}

export default function HymnalBrowser({ hymns, categories }: HymnalBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);

  const filtered = hymns.filter((h) => {
    const matchCategory = activeCategory === "전체" || h.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      h.title.includes(searchQuery) ||
      h.firstLine.includes(searchQuery) ||
      h.number.toString() === searchQuery;
    return matchCategory && matchSearch;
  });

  const getYouTubeSearchUrl = (hymn: Hymn) => {
    const query = encodeURIComponent(`찬송가 ${hymn.number}장 ${hymn.title}`);
    return `https://www.youtube.com/results?search_query=${query}`;
  };

  const getMusicNotesUrl = (hymn: Hymn) => {
    const query = encodeURIComponent(`찬송가 ${hymn.number}장 악보 ${hymn.title}`);
    return `https://www.google.com/search?q=${query}`;
  };

  return (
    <div>
      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="찬송가 번호, 제목, 가사로 검색..."
            className="input-field pl-11"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hymn list */}
        <div className="lg:col-span-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((hymn) => (
                <button
                  key={hymn.number}
                  onClick={() => setSelectedHymn(hymn)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selectedHymn?.number === hymn.number
                      ? "bg-orange-50 border-orange-300 shadow-sm"
                      : "bg-white border-gray-100 hover:border-orange-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {hymn.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {hymn.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {hymn.firstLine}
                      </p>
                      <span className="mt-1.5 inline-block text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                        {hymn.category}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          {selectedHymn ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center font-bold text-lg">
                  {selectedHymn.number}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedHymn.title}</h3>
                  <p className="text-xs text-orange-600">{selectedHymn.category}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-500 mb-1">첫 소절</p>
                <p className="text-gray-700 text-sm leading-relaxed italic">
                  &ldquo;{selectedHymn.firstLine}&rdquo;
                </p>
              </div>

              <div className="space-y-2">
                <a
                  href={getYouTubeSearchUrl(selectedHymn)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z"/>
                  </svg>
                  유튜브에서 찾기
                </a>
                <a
                  href={getMusicNotesUrl(selectedHymn)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  악보 찾기
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
              <Music className="w-12 h-12 mx-auto mb-3 text-orange-200" />
              <p className="text-gray-500 text-sm">
                찬송가를 선택하면 상세 정보를 볼 수 있습니다
              </p>
            </div>
          )}

          {/* Info */}
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <h4 className="font-semibold text-orange-800 text-sm mb-2">
              찬송가 안내
            </h4>
            <p className="text-orange-700 text-xs leading-relaxed">
              한국 교회에서 사용하는 찬송가 목록입니다.
              유튜브 링크를 통해 찬양을 들으실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
