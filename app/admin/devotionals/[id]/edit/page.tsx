import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import DevotionalEditForm from "@/components/admin/DevotionalEditForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditDevotionalPage({ params }: Props) {
  const { id } = await params;

  let devotional;
  try {
    devotional = await prisma.devotional.findUnique({ where: { id } });
  } catch {
    devotional = null;
  }

  if (!devotional) notFound();

  // 날짜를 KST YYYY-MM-DD로 변환
  const dateKST = new Date(devotional.date.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = `${dateKST.getUTCFullYear()}-${String(dateKST.getUTCMonth() + 1).padStart(2, "0")}-${String(dateKST.getUTCDate()).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-900 text-white py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/admin/devotionals" className="flex items-center gap-2 text-primary-300 hover:text-white text-sm mb-2">
            <ChevronLeft className="w-4 h-4" />
            묵상 목록
          </Link>
          <h1 className="text-xl font-bold">묵상 수정</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DevotionalEditForm
          id={devotional.id}
          initialData={{
            title: devotional.title,
            scripture: devotional.scripture,
            content: devotional.content,
            prayer: devotional.prayer ?? "",
            date: dateStr,
          }}
        />
      </div>
    </div>
  );
}
