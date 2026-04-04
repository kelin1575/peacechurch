"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";

interface Props {
  id: string;
  initialData: {
    title: string;
    scripture: string;
    content: string;
    prayer: string;
    date: string;
  };
}

export default function DevotionalEditForm({ id, initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/devotionals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `오류 코드: ${res.status}`);

      alert("묵상이 수정되었습니다!");
      router.push("/admin/devotionals");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정 중 오류가 발생했습니다.");
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
          className="input-field"
          required
        />
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">묵상 내용</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={12}
          className="textarea-field"
          required
        />
        <p className="text-xs text-gray-400 mt-1">{form.content.length}자</p>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">기도문 (선택)</label>
        <textarea
          value={form.prayer}
          onChange={(e) => setForm({ ...form, prayer: e.target.value })}
          rows={4}
          className="textarea-field"
        />
        <p className="text-xs text-gray-400 mt-1">{form.prayer.length}자</p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">
          취소
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" />저장하기</>}
        </button>
      </div>
    </form>
  );
}
