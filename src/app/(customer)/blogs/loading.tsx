export default function BlogsLoading() {
  return (
    <div className="w-full min-h-screen bg-[var(--background)] px-4 pt-24 pb-20 sm:px-6 lg:px-8 max-w-[1240px] mx-auto animate-pulse">
      {/* Hero shimmer */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900/60 via-green-950/40 to-emerald-900/60 h-52 mb-10" />
      {/* Search + pills shimmer */}
      <div className="max-w-2xl mx-auto mb-8 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      <div className="flex justify-center gap-3 mb-12 flex-wrap">
        {[1,2,3,4,5].map(i => <div key={i} className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
      </div>
      {/* Grid shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden h-[400px] flex flex-col p-4">
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-3" />
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
