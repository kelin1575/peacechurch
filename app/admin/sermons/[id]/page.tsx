import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import SermonEditForm from "@/components/SermonEditForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function AdminSermonEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let sermon;
  try {
    sermon = await prisma.sermon.findUnique({ where: { id } });
  } catch {
    sermon = null;
  }

  if (!sermon) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-900 text-white py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/admin/sermons" className="flex items-center gap-2 text-primary-300 hover:text-white text-sm mb-2">
            <ChevronLeft className="w-4 h-4" />
            설교 목록
          </Link>
          <h1 className="text-xl font-bold">설교 편집</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video preview */}
        <div className="bg-black rounded-xl overflow-hidden mb-6">
          <div className="relative aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${sermon.youtubeId}?rel=0`}
              title={sermon.title}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          </div>
        </div>

        <SermonEditForm sermon={sermon} />
      </div>
    </div>
  );
}
