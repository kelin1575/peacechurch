import DevotionalForm from "@/components/DevotionalForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewDevotionalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-900 text-white py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-2 text-primary-300 hover:text-white text-sm mb-2">
            <ChevronLeft className="w-4 h-4" />
            대시보드
          </Link>
          <h1 className="text-xl font-bold">묵상 등록</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DevotionalForm />
      </div>
    </div>
  );
}
