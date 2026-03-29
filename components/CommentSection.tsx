"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { Send, User, MessageSquare } from "lucide-react";

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date | string;
}

interface CommentSectionProps {
  sermonId: string;
  initialComments: Comment[];
}

export default function CommentSection({
  sermonId,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) {
      setError("이름과 내용을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sermonId, author: author.trim(), content: content.trim() }),
      });

      if (!response.ok) throw new Error("댓글 등록에 실패했습니다.");

      const newComment = await response.json();
      setComments([newComment, ...comments]);
      setContent("");
    } catch {
      setError("댓글 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="이름"
            maxLength={20}
            className="input-field py-2.5 text-sm"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="말씀을 통해 받은 은혜를 나눠주세요..."
            rows={3}
            maxLength={500}
            className="textarea-field text-sm"
          />
          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-sm py-2.5 self-end"
          >
            <Send className="w-4 h-4" />
            {loading ? "등록 중..." : "은혜 나누기"}
          </button>
        </div>
      </form>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">첫 번째로 은혜를 나눠주세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-4 bg-gray-50 rounded-xl"
            >
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">
                    {comment.author}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
