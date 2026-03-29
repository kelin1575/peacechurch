"use client";

import { useState } from "react";
import { Youtube, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface SyncResult {
  synced: number;
  total: number;
}

export default function YoutubeSyncButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<SyncResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSync() {
    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/youtube", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "동기화 실패");
      }

      setResult(data);
      setStatus("success");

      // 3초 후 페이지 새로고침 (설교 목록 반영)
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "알 수 없는 오류");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleSync}
        disabled={status === "loading"}
        className="w-full flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Youtube className="w-5 h-5" />
        )}
        {status === "loading" ? "동기화 중..." : "유튜브 설교 동기화"}
      </button>

      {status === "success" && result && (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            총 {result.total}개 중 <strong>{result.synced}개</strong> 동기화 완료.
            잠시 후 새로고침됩니다.
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
