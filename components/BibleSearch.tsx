"use client";

import { useState } from "react";
import { Search, BookOpen, ChevronRight, ExternalLink } from "lucide-react";

interface BibleBook {
  id: string;
  name: string;
  abbr: string;
  chapters: number;
}

interface FamousVerse {
  ref: string;
  text: string;
}

interface BibleBooksData {
  구약: BibleBook[];
  신약: BibleBook[];
}

interface BibleSearchProps {
  bibleBooks: BibleBooksData;
  famousVerses: FamousVerse[];
}

export default function BibleSearch({ bibleBooks, famousVerses }: BibleSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"구약" | "신약">("구약");

  const filteredBooks = searchQuery
    ? [...bibleBooks.구약, ...bibleBooks.신약].filter(
        (b) =>
          b.name.includes(searchQuery) ||
          b.abbr.includes(searchQuery)
      )
    : bibleBooks[activeTab];

  const handleBookSelect = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(null);
  };

  const getBibleGatewayUrl = (book: BibleBook, chapter: number) => {
    // Map Korean book names to YouVersion/Bible.com URL slugs
    const bookSlugMap: Record<string, string> = {
      gen: "GEN", exo: "EXO", lev: "LEV", num: "NUM", deu: "DEU",
      jos: "JOS", jdg: "JDG", rut: "RUT", "1sa": "1SA", "2sa": "2SA",
      "1ki": "1KI", "2ki": "2KI", "1ch": "1CH", "2ch": "2CH",
      ezr: "EZR", neh: "NEH", est: "EST", job: "JOB", psa: "PSA",
      pro: "PRO", ecc: "ECC", sng: "SNG", isa: "ISA", jer: "JER",
      lam: "LAM", ezk: "EZK", dan: "DAN", hos: "HOS", jol: "JOL",
      amo: "AMO", oba: "OBA", jon: "JON", mic: "MIC", nam: "NAM",
      hab: "HAB", zep: "ZEP", hag: "HAG", zec: "ZEC", mal: "MAL",
      mat: "MAT", mrk: "MRK", luk: "LUK", jhn: "JHN", act: "ACT",
      rom: "ROM", "1co": "1CO", "2co": "2CO", gal: "GAL", eph: "EPH",
      php: "PHP", col: "COL", "1th": "1TH", "2th": "2TH", "1ti": "1TI",
      "2ti": "2TI", tit: "TIT", phm: "PHM", heb: "HEB", jas: "JAS",
      "1pe": "1PE", "2pe": "2PE", "1jn": "1JN", "2jn": "2JN",
      "3jn": "3JN", jud: "JUD", rev: "REV",
    };
    const slug = bookSlugMap[book.id] || book.id.toUpperCase();
    return `https://www.bible.com/ko/bible/1//${slug}.${chapter}.NKRV`;
  };

  return (
    <div className="space-y-8">
      {/* Search bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="성경책 이름으로 검색... (예: 창세기, 요한복음, 시편)"
            className="input-field pl-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Book list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs */}
            {!searchQuery && (
              <div className="flex border-b border-gray-100">
                {(["구약", "신약"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-primary-700 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab} ({tab === "구약" ? "39권" : "27권"})
                  </button>
                ))}
              </div>
            )}

            <div className="max-h-96 overflow-y-auto">
              {filteredBooks.map((book) => (
                <button
                  key={book.id}
                  onClick={() => handleBookSelect(book)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                    selectedBook?.id === book.id
                      ? "bg-primary-50 text-primary-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <span>
                    <span className="font-semibold mr-2 text-gray-400 text-xs w-6 inline-block">
                      {book.abbr}
                    </span>
                    {book.name}
                  </span>
                  <span className="text-xs text-gray-400">{book.chapters}장</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chapter selection & content */}
        <div className="lg:col-span-2 space-y-6">
          {selectedBook ? (
            <>
              {/* Book info */}
              <div className="bg-primary-700 rounded-xl p-5 text-white">
                <h2 className="text-xl font-bold mb-1">{selectedBook.name}</h2>
                <p className="text-primary-200 text-sm">
                  총 {selectedBook.chapters}장
                </p>
              </div>

              {/* Chapter grid */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">장 선택</h3>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(
                    (ch) => (
                      <button
                        key={ch}
                        onClick={() => setSelectedChapter(ch)}
                        className={`aspect-square flex items-center justify-center text-sm rounded-lg font-medium transition-colors ${
                          selectedChapter === ch
                            ? "bg-primary-700 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700"
                        }`}
                      >
                        {ch}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Read link */}
              {selectedChapter && (
                <div className="bg-gradient-to-br from-purple-50 to-primary-50 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">
                      {selectedBook.name} {selectedChapter}장
                    </h3>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                      개역개정
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Bible.com에서 개역개정 성경을 읽으세요
                  </p>
                  <a
                    href={getBibleGatewayUrl(selectedBook, selectedChapter)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm py-2.5 w-full justify-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {selectedBook.abbr} {selectedChapter}장 읽기
                  </a>
                </div>
              )}
            </>
          ) : (
            /* Famous verses */
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                주요 성경 구절
              </h3>
              <div className="space-y-4">
                {famousVerses.map((verse, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors cursor-pointer"
                  >
                    <p className="text-primary-700 font-bold text-sm mb-1.5">
                      {verse.ref}
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {verse.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
