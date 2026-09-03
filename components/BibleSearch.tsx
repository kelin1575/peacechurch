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

  /**
   * 대한성서공회(개역개정의 실제 저작권자·발행처) 온라인 성경 읽기 페이지.
   * https://www.bskorea.or.kr — book 코드가 이 프로젝트에서 쓰는 book.id(gen, jhn, 1co 등)와
   * 그대로 일치해 별도 매핑표가 필요 없습니다. version=GAE 가 개역개정을 가리킵니다.
   *
   * 예전에는 bible.com(YouVersion)으로 연결했는데, 버전 번호(1)가 실제로는 영어 KJV를
   * 가리키고 있어 한글이 아니라 영어로 열리는 문제가 있었습니다.
   */
  const getBibleReadingUrl = (book: BibleBook, chapter: number) => {
    return `https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE&book=${book.id}&chap=${chapter}`;
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
                    대한성서공회에서 개역개정 성경을 읽으세요
                  </p>
                  <a
                    href={getBibleReadingUrl(selectedBook, selectedChapter)}
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
