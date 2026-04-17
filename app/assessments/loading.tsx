export default function AssessmentsLoading() {
  return (
    <div className="pt-24 pb-24 bg-montana-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-6">

        {/* Hero skeleton */}
        <div className="py-16 max-w-3xl space-y-4">
          <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
          <div className="h-12 w-2/3 bg-white/5 rounded animate-pulse" />
          <div className="h-5 w-full max-w-xl bg-white/5 rounded animate-pulse" />
        </div>

        {/* Stat strip skeleton */}
        <div className="grid grid-cols-3 gap-px border border-white/10 mb-16">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-montana-surface/30 space-y-2 animate-pulse">
              <div className="h-8 w-20 bg-white/5 rounded" />
              <div className="h-4 w-32 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* Assessment cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="border border-white/10 bg-montana-surface/30 p-8 space-y-4 animate-pulse">
              <div className="h-10 w-10 bg-white/5 rounded" />
              <div className="h-6 w-48 bg-white/5 rounded" />
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-4/5 bg-white/5 rounded" />
              <div className="h-10 w-36 bg-white/5 rounded mt-4" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
