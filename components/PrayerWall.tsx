"use client";

import { useEffect, useMemo, useState } from "react";
import { HeartHandshake, Send, Loader2, ShieldCheck } from "lucide-react";
import {
  PRAYER_CATEGORIES,
  prayerCategoryStyle,
  timeAgo,
} from "@/lib/prayer";
import { cn } from "@/lib/utils";

export interface PrayerItem {
  id: string;
  author: string;
  category: string;
  content: string;
  prayCount: number;
  isOfficial?: boolean;
  createdAt: string;
}

/** 이미 중보에 참여한 글은 브라우저에 기억해 중복 클릭을 막습니다. */
const STORAGE_KEY = "peacechurch:prayed";

function loadPrayed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function savePrayed(ids: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // 저장이 막힌 브라우저(시크릿 모드 등)에서는 그냥 넘어갑니다.
  }
}

export default function PrayerWall({
  initialPrayers,
  dbReady,
}: {
  initialPrayers: PrayerItem[];
  dbReady: boolean;
}) {
  const [prayers, setPrayers] = useState<PrayerItem[]>(initialPrayers);
  const [filter, setFilter] = useState<string>("전체");
  const [prayed, setPrayed] = useState<Set<string>>(new Set());

  const [author, setAuthor] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [category, setCategory] = useState<string>("기타");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setPrayed(loadPrayed());
  }, []);

  const visible = useMemo(
    () => (filter === "전체" ? prayers : prayers.filter((p) => p.category === filter)),
    [prayers, filter]
  );

  const totalPrayers = prayers.length;
  const totalIntercessions = prayers.reduce((sum, p) => sum + p.prayCount, 0);

  async function handlePray(id: string) {
    if (prayed.has(id)) return;

    // 화면을 먼저 올리고 서버에 알립니다. 기도 참여는 실패해도 되돌릴 만큼
    // 중요한 수치가 아니므로 사용자를 기다리게 하지 않습니다.
    const next = new Set(prayed);
    next.add(id);
    setPrayed(next);
    savePrayed(next);
    setPrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, prayCount: p.prayCount + 1 } : p))
    );

    try {
      await fetch(`/api/prayers/${id}/pray`, { method: "POST" });
    } catch {
      // 네트워크 실패는 조용히 넘깁니다.
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (content.trim().length < 2) {
      setError("기도제목을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: anonymous ? "익명" : author.trim() || "익명",
          category,
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "기도제목을 올리지 못했습니다.");
      }

      const created = (await res.json()) as PrayerItem;
      setPrayers((prev) => [created, ...prev]);
      setContent("");
      setDone(true);
      window.setTimeout(() => setDone(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ── 기도제목 올리기 ── */}
      <aside className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start space-y-4">
        {/* 표가 아직 없으면 눌러도 실패할 폼을 보여주지 않습니다 */}
        {dbReady && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 shadow-soft p-5"
          aria-label="기도제목 올리기"
        >
          <h2 className="font-bold text-gray-900 mb-1">기도제목 나누기</h2>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            길게 쓰지 않으셔도 됩니다. 한 줄이어도 저희가 함께 기도합니다.
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            어떤 기도인가요?
          </label>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {PRAYER_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  category === c
                    ? "bg-primary-700 text-white border-primary-700"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <label
            htmlFor="prayer-content"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            기도제목
          </label>
          <textarea
            id="prayer-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            maxLength={800}
            placeholder="예) 어머니 수술을 앞두고 있습니다. 주님의 손이 함께하시도록 기도 부탁드립니다."
            className="textarea-field text-sm"
            required
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {content.length} / 800
          </p>

          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
              />
              익명으로 올리기
            </label>
            {!anonymous && (
              <>
                <label htmlFor="prayer-author" className="sr-only">
                  이름
                </label>
                <input
                  id="prayer-author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  maxLength={20}
                  placeholder="이름 (예: 김성도)"
                  className="input-field text-sm py-2.5"
                />
              </>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm text-rose-600">
              {error}
            </p>
          )}
          {done && (
            <p role="status" className="mt-3 text-sm text-olive-700 font-medium">
              기도제목이 올라갔습니다. 함께 기도하겠습니다.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full mt-4 py-3 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                올리는 중
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                기도제목 올리기
              </>
            )}
          </button>

          <p className="flex items-start gap-2 text-xs text-gray-400 mt-3 leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            올리신 글은 바로 공개됩니다. 이름을 밝히기 어려운 기도제목은
            익명으로 올려 주세요. 개인정보(연락처·주소 등)는 적지 말아 주세요.
          </p>
        </form>
        )}

        {totalPrayers > 0 && (
          <div className="bg-primary-800 text-white rounded-2xl p-5">
            <p className="text-primary-200 text-xs font-semibold tracking-wide">
              지금까지
            </p>
            <p className="mt-2 text-sm text-primary-100 leading-relaxed">
              <strong className="text-gold-300 text-xl">{totalPrayers}</strong>개의
              기도제목에{" "}
              <strong className="text-gold-300 text-xl">
                {totalIntercessions.toLocaleString()}
              </strong>
              번의 중보가 함께했습니다.
            </p>
          </div>
        )}
      </aside>

      {/* ── 기도제목 목록 ── */}
      <section className="lg:col-span-2" aria-label="기도제목 목록">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
          {(["전체", ...PRAYER_CATEGORIES] as string[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={cn(
                "flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors",
                filter === c
                  ? "bg-primary-700 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {!dbReady ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <HeartHandshake
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
              aria-hidden="true"
            />
            <p className="font-semibold text-gray-700 mb-1">
              기도의 벽을 준비하고 있습니다
            </p>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
              곧 열어드리겠습니다. 그동안 기도가 필요하시면
              교회로 연락 주세요. 함께 기도하겠습니다.
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <HeartHandshake
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
              aria-hidden="true"
            />
            <p className="font-semibold text-gray-700 mb-1">
              {filter === "전체"
                ? "아직 올라온 기도제목이 없습니다"
                : `'${filter}' 기도제목이 아직 없습니다`}
            </p>
            <p className="text-sm text-gray-500">
              첫 번째 기도제목을 올려주세요. 함께 기도하겠습니다.
            </p>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {visible.map((p) => {
              const hasPrayed = prayed.has(p.id);
              return (
                <li
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full border",
                        prayerCategoryStyle(p.category)
                      )}
                    >
                      {p.category}
                    </span>
                    {p.isOfficial && (
                      <span className="text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-full">
                        교회 공동기도
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {p.author} · {timeAgo(p.createdAt)}
                    </span>
                  </div>

                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {p.content}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handlePray(p.id)}
                      disabled={hasPrayed}
                      aria-label={
                        hasPrayed
                          ? "이미 함께 기도하셨습니다"
                          : "이 기도제목에 함께 기도하기"
                      }
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors",
                        hasPrayed
                          ? "bg-gold-50 text-gold-700 border border-gold-200 cursor-default"
                          : "bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100"
                      )}
                    >
                      <HeartHandshake className="w-4 h-4" aria-hidden="true" />
                      {hasPrayed ? "함께 기도했습니다" : "함께 기도합니다"}
                    </button>
                    <span className="text-sm text-gray-400 tabular-nums">
                      {p.prayCount.toLocaleString()}명이 함께
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
