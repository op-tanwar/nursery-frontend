// Next.js route-level loading UI for Vendor Profile — shown instantly while async RSC shell resolves
export default function VendorLoading() {
  return (
    <main className="min-h-screen bg-slate-50/60 pb-16 font-sans animate-pulse">
      {/* Hero shimmer */}
      <div
        className="relative border-b border-emerald-100/60 py-16 md:py-20"
        style={{ background: "linear-gradient(160deg, #f0fdf4 0%, #dcfce7 35%, #fcfdfc 70%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar shimmer */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-slate-200/60 shrink-0" />
            {/* Text block shimmer */}
            <div className="flex-1 space-y-3 text-center sm:text-left w-full">
              <div className="h-8 w-48 bg-slate-200/70 rounded mx-auto sm:mx-0" />
              <div className="h-4 w-32 bg-slate-100 rounded mx-auto sm:mx-0" />
              <div className="h-16 w-full max-w-lg bg-slate-100 rounded mx-auto sm:mx-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid shimmer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-48 rounded-2xl bg-emerald-900/30" />
          <div className="h-48 rounded-2xl bg-slate-100 border border-slate-200/60" />
          <div className="h-48 rounded-2xl bg-slate-100 border border-slate-200/60 md:col-span-2 lg:col-span-1" />
        </div>
      </div>

      {/* Catalog shimmer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="h-16 bg-white rounded-2xl border border-slate-200/60 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="flex flex-col bg-white border border-slate-200/60 rounded-2xl overflow-hidden"
            >
              <div className="w-full aspect-square bg-slate-100" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-14 bg-slate-200 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="h-5 w-20 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
