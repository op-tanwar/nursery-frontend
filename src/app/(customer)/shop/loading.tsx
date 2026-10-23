// Next.js route-level loading UI — shown instantly on navigation before the page streams in
export default function ShopLoading() {
  return (
    <main className="min-h-screen bg-background pt-28 pb-16 px-4 sm:px-6 animate-pulse">
      <div className="w-full max-w-[1200px] mx-auto">
        {/* Filter panel shimmer */}
        <div className="bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary rounded-2xl p-6 mb-10 h-[160px]" />
        {/* Product grid shimmer */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="flex flex-col bg-white border border-slate-200/60 rounded-2xl overflow-hidden"
            >
              <div className="w-full aspect-square bg-slate-100" />
              <div className="p-5 space-y-3 flex-1">
                <div className="h-3 w-14 bg-slate-200 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-5 w-20 bg-slate-200 rounded" />
                  <div className="h-9 w-24 bg-slate-200 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
