"use client";

import { Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  url?: string;
  label?: string;
  className?: string;
}

export default function ShareButton({
  title,
  url,
  label = "공유하기",
  className = "inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors",
}: ShareButtonProps) {
  const handleShare = () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    if (typeof navigator === "undefined") return;
    if (navigator.share) {
      navigator.share({ title, url: shareUrl }).catch(() => null);
    } else {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => alert("링크가 복사되었습니다."))
        .catch(() => null);
    }
  };

  return (
    <button onClick={handleShare} className={className}>
      <Share2 className="w-4 h-4" aria-hidden="true" />
      {label}
    </button>
  );
}
