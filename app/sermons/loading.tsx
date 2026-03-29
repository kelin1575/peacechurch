import { SermonGridSkeleton } from "@/components/Skeleton";
import { Skeleton } from "@/components/Skeleton";

export default function SermonsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <Skeleton className="h-10 w-48 mx-auto bg-primary-700" />
          <Skeleton className="h-5 w-64 mx-auto bg-primary-700" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-24 w-full rounded-xl mb-8" />
        <SermonGridSkeleton count={8} />
      </div>
    </div>
  );
}
