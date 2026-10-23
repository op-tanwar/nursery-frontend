export default function BlogDetailLoading() {
  return (
    <div className="w-full min-h-screen bg-[var(--background)] px-4 pt-28 pb-16 sm:px-6 lg:px-8 max-w-[1140px] mx-auto overflow-hidden animate-pulse">
      <div className="space-y-6">
        <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-56 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-80 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-5/6" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-4/6" />
          </div>
          <div className="lg:col-span-4 hidden lg:block">
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
