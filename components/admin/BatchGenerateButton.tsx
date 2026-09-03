"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface GenerateAllResponse {
  message?: string;
  processed: number;
  success: number;
  failed: number;
  remaining: number;
  errors?: string[];
}

// 한 번의 API 호출은 시간 예산 안에서 처리할 수 있는 만큼만 끝내고
// remaining(남은 개수)을 돌려줍니다. 남은 것이 없어질 때까지 반복 호출해
// "한 번 누르면 전체가 끝난다"를 보장합니다.
const MAX_ROUNDS = 30; // 안전장치 — 이론상 최대 30 * 50 = 1500개까지 커버
const MAX_STALLS = 2; // 연속으로 진행이 없으면(모두 실패) 중단

export default function BatchGenerateButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleBatchGenerate = async () => {
    setLoading(true);
    setStatus("idle");
    setMessage("");

    let totalSuccess = 0;
    let totalFailed = 0;
    let stalls = 0;

    try {
      for (let round = 0; round < MAX_ROUNDS; round++) {
        const response = await fetch("/api/sermons/generate-all", { method: "POST" });
        if (!response.ok) throw new Error("일괄 생성 실패");

        const data: GenerateAllResponse = await response.json();

        if (data.processed === 0) {
          // 더 처리할 설교가 없음
          break;
        }

        totalSuccess += data.success;
        totalFailed += data.failed;
        setMessage(
          `생성 중... ${totalSuccess}개 완료${totalFailed ? ` (실패 ${totalFailed}개)` : ""}, 남은 설교 ${data.remaining}개`
        );

        if (data.success === 0) {
          stalls++;
          if (stalls >= MAX_STALLS) {
            throw new Error(
              `${totalFailed}개가 계속 실패해 중단했습니다. 잠시 후 다시 시도해주세요.`
            );
          }
        } else {
          stalls = 0;
        }

        if (data.remaining === 0) break;
      }

      setStatus("success");
      setMessage(`총 ${totalSuccess}개 생성 완료${totalFailed ? ` (실패 ${totalFailed}개)` : ""}`);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "생성 중 오류가 발생했습니다.");
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 4000);
    } finally {
      setLoading(false);
    }
  };

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
