"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function BatchGenerateButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleBatchGenerate = async () => {
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/sermons/generate-all", {
        method: "POST",
      });

      if (!response.ok) throw new Error("일괄 생성 실패");

      const data = await response.json();
      setStatus("success");
      setMessage(
        data.message ?? `${data.success ?? 0}개 생성 완료 (실패: ${data.failed ?? 0}개)`
      );
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch {
      setStatus("error");
      setMessage("생성 중 오류가 발생했습니다.");
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span
          className={`text-sm font-medium ${
            status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </span>
      )}
      <button
        type="button"
        onClick={handleBatchGenerate}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
          ${status === "success"
            ? "bg-green-600 text-white hover:bg-green-700"
            : status === "error"
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-purple-600 text-white hover:bg-purple-700"
          } disabled:opacity-60`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            생성 중...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            전체 AI 자동 생성
          </>
        )}
      </button>
    </div>
  );
}
