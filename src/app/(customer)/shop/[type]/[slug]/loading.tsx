// Next.js route-level loading UI for PDP — shown instantly while the async RSC shell resolves
export default function PDPLoading() {
  return (
    <main className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-6 animate-pulse">
      <div className="w-full max-w-[1100px] mx-auto">
        {/* Back button shimmer */}
        <div className="h-4 w-40 bg-slate-200 rounded mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start mb-12">
          {/* Product image block */}
          <div className="md:col-span-5">
            <div className="aspect-square w-full bg-slate-100 rounded-2xl border border-slate-200/60" />
          </div>

          {/* Product info block */}
          <div className="md:col-span-7 space-y-5">
            <div className="h-4 w-20 bg-slate-200 rounded" />
            <div className="h-8 w-2/3 bg-slate-200 rounded" />
            <div className="flex gap-2 items-center">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-4 w-16 bg-slate-100 rounded" />
            </div>
            <div className="h-4 w-1/2 bg-slate-100 rounded" />
            <div className="h-10 w-1/4 bg-slate-200 rounded" />
            <div className="h-20 w-full bg-slate-100 rounded" />
            <div className="flex gap-3">
              <div className="h-12 flex-1 bg-slate-200 rounded-xl" />
              <div className="h-12 flex-1 bg-slate-100 rounded-xl" />
            </div>
            {/* Trust badges row */}
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 h-16 bg-slate-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Tabs shimmer */}
        <div className="h-12 w-full bg-slate-100 rounded-xl mb-6" />
        <div className="h-40 w-full bg-slate-100 rounded-xl" />
      </div>
    </main>
  );
}
