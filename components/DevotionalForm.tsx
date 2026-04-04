"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";

export default function DevotionalForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 한국 시간 기준 오늘 날짜
  const todayKST = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })
  );
  const today = `${todayKST.getFullYear()}-${String(todayKST.getMonth() + 1).padStart(2, "0")}-${String(todayKST.getDate()).padStart(2, "0")}`;

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
    setError(null);

    try {
      const response = await fetch("/api/devotionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `오류 코드: ${response.status}`);
      }

      alert("묵상이 등록되었습니다!");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          <strong>오류:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">날짜</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="input-field"
            required
          />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">본문 성경구절</label>
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">제목</label>
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">묵상 내용</label>
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">기도문 (선택)</label>
        <textarea
          value={form.prayer}
          onChange={(e) => setForm({ ...form, prayer: e.target.value })}
          rows={4}
          placeholder="오늘의 기도문을 작성해주세요..."
          className="textarea-field"
        />
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">
          취소
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" />등록하기</>}
        </button>
      </div>
    </form>
  );
}
