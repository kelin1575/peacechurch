import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200",
        className
      )}
    />
  );
}

export function SermonCardSkeleton() {
  return (
    <div className="card flex flex-col">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-20 mt-2" />
      </div>
    </div>
  );
}

export function SermonGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SermonCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DevotionalSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="bg-white rounded-2xl p-8 space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}
