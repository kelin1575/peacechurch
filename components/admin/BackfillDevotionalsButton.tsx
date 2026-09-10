"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface BackfillResponse {
  error?: string;
  processed: number;
  success: number;
  failed: number;
  remaining: number;
  errors: string[];
  filled: { date: string; title: string }[];
}

// 한 번의 호출은 시간 예산 안에서 채울 수 있는 날짜만 채우고 remaining을
// 돌려줍니다. 남은 것이 없어질 때까지 반복 호출해 한 번만 눌러도 되게 합니다.
const MAX_ROUNDS = 10;
const MAX_STALLS = 2;

export default function BackfillDevotionalsButton({ missingCount }: { missingCount: number }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleBackfill = async () => {
    setLoading(true);
    setStatus("idle");
    setMessage("");

    let totalSuccess = 0;
    let totalFailed = 0;
    let stalls = 0;
    const filledTitles: string[] = [];

    try {
      for (let round = 0; round < MAX_ROUNDS; round++) {
        const response = await fetch("/api/devotionals/backfill", { method: "POST" });
        const data: BackfillResponse = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || `채우기 실패 (HTTP ${response.status})`);
        }

        if (data.processed === 0) break;

        totalSuccess += data.success;
        totalFailed += data.failed;
        filledTitles.push(...data.filled.map((f) => `${f.date} "${f.title}"`));
        setMessage(
          `채우는 중... ${totalSuccess}일 완료${totalFailed ? ` (실패 ${totalFailed}일)` : ""}, 남은 날짜 ${data.remaining}일`
        );

        if (data.success === 0) {
          stalls++;
          if (stalls >= MAX_STALLS) {
            const detail = data.errors?.[0];
            throw new Error(detail ? `계속 실패합니다: ${detail}` : "계속 실패해 중단했습니다.");
          }
        } else {
          stalls = 0;
        }

        if (data.remaining === 0) break;
      }

      setStatus("success");
      setMessage(
        totalSuccess > 0
          ? `${totalSuccess}일 채움 완료${totalFailed ? ` (실패 ${totalFailed}일)` : ""}`
          : "빠진 날짜가 없습니다."
      );
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "채우는 중 오류가 발생했습니다.");
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  if (missingCount === 0) return null;

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span
          className={`text-sm font-medium ${
            status === "error" ? "text-red-600" : status === "success" ? "text-green-600" : "text-gray-600"
          }`}
        >
          {message}
        </span>
      )}
      <button
        type="button"
        onClick={handleBackfill}
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
            채우는 중...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            빠진 묵상 {missingCount}일 채우기
          </>
        )}
      </button>
    </div>
  );
}
