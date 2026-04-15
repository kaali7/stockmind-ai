export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-container-high ${className}`}
    />
  );
}

export function KPICardsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl bg-surface-container p-4">
          <SkeletonLoader className="h-4 w-20" />
          <SkeletonLoader className="mt-3 h-8 w-32" />
          <SkeletonLoader className="mt-2 h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl bg-surface-container p-4">
      <SkeletonLoader className="h-5 w-24" />
      <div className="mt-4 flex gap-2">
        {[...Array(4)].map((_, i) => (
          <SkeletonLoader key={i} className="h-6 w-10" />
        ))}
      </div>
      <SkeletonLoader className="mt-6 h-72 w-full" />
    </div>
  );
}

export function CompanyInfoSkeleton() {
  return (
    <div className="rounded-xl bg-surface-container p-4">
      <SkeletonLoader className="h-5 w-24" />
      <div className="mt-4 space-y-4">
        <SkeletonLoader className="h-12 w-full" />
        <SkeletonLoader className="h-8 w-full" />
        <SkeletonLoader className="h-8 w-full" />
      </div>
    </div>
  );
}