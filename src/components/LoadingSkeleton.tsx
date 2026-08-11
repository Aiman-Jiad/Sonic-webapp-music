export function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-44 shrink-0 space-y-3">
          <div className="aspect-square w-full rounded-lg skeleton" />
          <div className="h-4 w-3/4 rounded skeleton" />
          <div className="h-3 w-1/2 rounded skeleton" />
        </div>
      ))}
    </div>
  );
}

export function RowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded skeleton" />
            <div className="h-3 w-1/4 rounded skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShelfSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 rounded skeleton" />
      <LoadingSkeleton />
    </div>
  );
}
