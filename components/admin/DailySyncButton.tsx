"use client";

import { useState } from "react";
import { Play, Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

interface SyncResult {
  ok: boolean;
  log: string[];
  synced?: number;
  devotionalCreated?: { id: string; title: string };
  devotionalSkipped?: string;
  error?: string;
  elapsedMs?: number;
}

export default function DailySyncButton({ debugSecret }: { debugSecret: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<SyncResult | null>(null);
  const [showLog, setShowLog] = useState(false);

  const run = async () => {
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch(`/api/daily-sync?secret=${encodeURIComponent(debugSecret)}`, {
        method: "POST",
      });
      const data: SyncResult = await res.json();
      setResult(data);
      setStatus(data.ok ? "success" : "error");
      setShowLog(true);
    } catch (e) {
      setResult({ ok: false, log: [], error: String(e) });
      setStatus("error");
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={run}
        disabled={status === "loading"}
        className="w-full flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium disabled:opacity-60"
      >
        {status === "loading" ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : status === "success" ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : status === "error" ? (
          <XCircle className="w-5 h-5 text-red-500" />
        ) : (
          <Play className="w-5 h-5" />
        )}
        {status === "loading" ? "배치 실행 중..." : "배치 수동 실행 (YouTube 동기화 + 묵상 생성)"}
      </button>

      {result && (
        <div className={`rounded-lg border text-xs overflow-hidden ${result.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <div className="px-3 py-2 flex items-center justify-between">
            <span className={result.ok ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
              {result.ok
                ? result.devotionalCreated
                  ? `✓ 묵상 생성: "${result.devotionalCreated.title}" | 동기화: ${result.synced}개 | ${result.elapsedMs}ms`
                  : `✓ 동기화: ${result.synced}개 완료 (묵상: ${result.devotionalSkipped}) | ${result.elapsedMs}ms`
                : `✗ 오류: ${result.error}`}
            </span>
            <button onClick={() => setShowLog(!showLog)} className="text-gray-500 hover:text-gray-700 ml-2">
              {showLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          {showLog && result.log.length > 0 && (
            <ul className="border-t border-gray-200 px-3 py-2 space-y-0.5 text-gray-600">
              {result.log.map((line, i) => <li key={i}>• {line}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
