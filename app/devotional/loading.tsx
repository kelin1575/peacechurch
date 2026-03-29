import { DevotionalSkeleton, Skeleton } from "@/components/Skeleton";

export default function DevotionalLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <Skeleton className="h-10 w-48 mx-auto bg-green-700" />
          <Skeleton className="h-5 w-40 mx-auto bg-green-700" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DevotionalSkeleton />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
