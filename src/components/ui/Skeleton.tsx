import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-200",
        className
      )}
      aria-hidden="true"
    />
  );
}

export function FeedCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
      <div className="flex items-center gap-2.5 p-3 pb-2.5">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <div className="flex gap-1">
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
      <div className="mx-3 mb-3 rounded-lg bg-neutral-50 p-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="h-8 w-px bg-neutral-200" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-3 px-3 pt-2" aria-label="로딩 중">
      {[...Array(3)].map((_, i) => (
        <FeedCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4" aria-label="로딩 중">
      <div className="bg-white px-4 pt-4 pb-0">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-1 pt-0.5">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        </div>
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-4/5 mb-4" />
        <div className="flex gap-2 pb-4">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>
      </div>
      <div className="bg-white px-4 py-3">
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <div className="bg-white px-4 py-3">
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="grid grid-cols-3 gap-0.5">
          <Skeleton className="aspect-square rounded-md" />
          <Skeleton className="aspect-square rounded-md" />
          <Skeleton className="aspect-square rounded-md" />
        </div>
      </div>
    </div>
  );
}
