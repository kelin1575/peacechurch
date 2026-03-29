import Link from "next/link";
import Image from "next/image";
import { Calendar, BookOpen, Play } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

interface SermonCardProps {
  id: string;
  youtubeId: string;
  title: string;
  scripture?: string | null;
  summary?: string | null;
  category: string;
  publishedAt: Date | string;
  thumbnail?: string | null;
}

export default function SermonCard({
  id,
  youtubeId,
  title,
  scripture,
  summary,
  category,
  publishedAt,
  thumbnail,
}: SermonCardProps) {
  const thumbUrl =
    thumbnail ||
    `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;

  return (
    <Link href={`/sermons/${id}`} className="group card flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <Image
          src={thumbUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-primary-700 fill-primary-700 ml-1" />
          </div>
        </div>
        {/* Category badge */}
        <span className="absolute top-2 left-2 bg-primary-700/90 text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {scripture && (
          <div className="flex items-center gap-1.5 text-primary-600 text-xs font-medium mb-2">
            <BookOpen className="w-3 h-3" />
            <span>{scripture}</span>
          </div>
        )}

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 group-hover:text-primary-700 transition-colors line-clamp-2">
          {title}
        </h3>

        {summary && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-3">
            {summary}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-auto">
          <Calendar className="w-3 h-3" />
          <span>{formatDateShort(publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
