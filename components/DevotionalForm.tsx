"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";

export default function DevotionalForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: "",
    scripture: "",
    content: "",
    prayer: "",
    date: today,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/devotionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("저장 실패");

      alert("묵상이 등록되었습니다!");
      router.push("/admin");
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            날짜
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="input-field"
            required
          />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            본문 성경구절
          </label>
          <input
            type="text"
            value={form.scripture}
            onChange={(e) => setForm({ ...form, scripture: e.target.value })}
            placeholder="예: 요한복음 3:16"
            className="input-field"
            required
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          제목
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="오늘의 묵상 제목..."
          className="input-field"
          required
        />
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          묵상 내용
        </label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={10}
          placeholder="오늘의 묵상 내용을 작성해주세요..."
          className="textarea-field"
          required
        />
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          기도문 (선택)
        </label>
        <textarea
          value={form.prayer}
          onChange={(e) => setForm({ ...form, prayer: e.target.value })}
          rows={4}
          placeholder="오늘의 기도문을 작성해주세요..."
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
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              등록하기
            </>
          )}
        </button>
      </div>
    </form>
  );
}
