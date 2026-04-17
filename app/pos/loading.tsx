export default function POSLoading() {
  return (
    <div className="pt-24 pb-24 bg-montana-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-6">

        {/* Progress bar skeleton */}
        <div className="flex items-center justify-between mb-12 pt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 flex-1">
              <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse shrink-0" />
              <div className="h-px flex-1 bg-white/5" />
            </div>
          ))}
          <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse shrink-0" />
        </div>

        {/* Card skeleton */}
        <div className="border border-white/10 bg-montana-surface/30 p-8 space-y-6">
          <div className="h-7 w-56 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-80 bg-white/5 rounded animate-pulse" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 border border-white/5 bg-white/[0.02] animate-pulse" />
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <div className="h-11 w-36 bg-white/5 rounded animate-pulse" />
          </div>
        </div>

      </div>
    </div>
  );
}
