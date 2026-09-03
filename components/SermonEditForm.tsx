"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Sparkles } from "lucide-react";

interface Sermon {
  id: string;
  title: string;
  scripture: string | null;
  summary: string | null;
  interpretation: string | null;
  category: string;
}

const CATEGORIES = [
  "주일예배", "해피밀", "홍보영상", "아동부", "유아유치부",
  "청소년부", "미니홈피", "어와나", "Shorts",
];

export default function SermonEditForm({ sermon }: { sermon: Sermon }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<"idle" | "success" | "error">("idle");
  const [form, setForm] = useState({
    title: sermon.title,
    scripture: sermon.scripture || "",
    summary: sermon.summary || "",
    interpretation: sermon.interpretation || "",
    category: sermon.category,
  });

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateStatus("idle");

    try {
      const response = await fetch(`/api/sermons/${sermon.id}/generate`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("생성 실패");

      const data = await response.json();
      setForm((prev) => ({
        ...prev,
        scripture: data.scripture ?? prev.scripture,
        summary: data.summary ?? prev.summary,
        interpretation: data.interpretation ?? prev.interpretation,
      }));
      setGenerateStatus("success");
      setTimeout(() => setGenerateStatus("idle"), 3000);
    } catch {
      setGenerateStatus("error");
      setTimeout(() => setGenerateStatus("idle"), 3000);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/sermons/${sermon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("저장 실패");

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push("/admin/sermons");
      }, 1500);
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          제목
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input-field"
          required
        />
      </div>

      {/* Category & Scripture */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              본문 성경구절
            </label>
            <input
              type="text"
              value={form.scripture}
              onChange={(e) => setForm({ ...form, scripture: e.target.value })}
              placeholder="예: 요한복음 3:16"
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* AI Generate */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">AI를 사용해 요약과 해석을 자동으로 생성합니다.</span>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
            ${generateStatus === "success"
              ? "bg-green-600 text-white hover:bg-green-700"
              : generateStatus === "error"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-purple-600 text-white hover:bg-purple-700"
            } disabled:opacity-60`}
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              생성 중...
            </>
          ) : generateStatus === "success" ? (
            <>
              <Sparkles className="w-4 h-4" />
              생성 완료 ✓
            </>
          ) : generateStatus === "error" ? (
            <>
              <Sparkles className="w-4 h-4" />
              생성 실패 — 재시도
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              AI 자동 생성
            </>
          )}
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          말씀 요약
        </label>
        <textarea
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          rows={6}
          placeholder="설교 내용을 요약해주세요..."
          className="textarea-field"
        />
      </div>

      {/* Interpretation */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          말씀 해석 & 적용
        </label>
        <textarea
          value={form.interpretation}
          onChange={(e) => setForm({ ...form, interpretation: e.target.value })}
          rows={6}
          placeholder="말씀의 해석과 삶에 적용하는 방법을 작성해주세요..."
          className="textarea-field"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary flex-1"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading || saved}
          className={`btn-primary flex-1 ${saved ? "bg-green-600 hover:bg-green-600" : ""}`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            "저장됨 ✓"
          ) : (
            <>
              <Save className="w-4 h-4" />
              저장하기
            </>
          )}
        </button>
      </div>
    </form>
  );
}
