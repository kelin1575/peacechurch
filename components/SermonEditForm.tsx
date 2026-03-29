"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";

interface Sermon {
  id: string;
  title: string;
  scripture: string | null;
  summary: string | null;
  interpretation: string | null;
  category: string;
}

const CATEGORIES = ["주일예배", "특별집회", "수요예배", "새벽기도"];

export default function SermonEditForm({ sermon }: { sermon: Sermon }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    title: sermon.title,
    scripture: sermon.scripture || "",
    summary: sermon.summary || "",
    interpretation: sermon.interpretation || "",
    category: sermon.category,
  });

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
