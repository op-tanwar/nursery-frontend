import React from "react";

interface FeaturedGridSkeletonProps {
  title: string;
  subtitle: string;
  bgColor?: string;
}

export default function FeaturedGridSkeleton({
  title,
  subtitle,
  bgColor = "bg-[#f8fdf9]",
}: FeaturedGridSkeletonProps) {
  return (
    <section className={`py-20 px-6 ${bgColor} animate-pulse`}>
      <div className="w-full max-w-[1200px] mx-auto">
        {/* Header Block Shimmer */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-9 gap-4">
          <div>
            <span className="text-[13px] font-semibold text-brand-primary/60 tracking-[0.08em] uppercase">
              {subtitle}
            </span>
            <h2 className="text-[clamp(26px,4vw,40px)] font-black m-0 mt-2 tracking-[-0.02em] text-foreground">
              {title}
            </h2>
          </div>

          <div className="h-11 w-36 bg-slate-200/80 rounded-xl" />
        </div>

        {/* 4 Card Skeleton Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col h-full bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-xs"
            >
              {/* Image Shimmer */}
              <div className="w-full aspect-square bg-slate-100/90 relative" />

              {/* Content Shimmer */}
              <div className="p-5 flex flex-col flex-1 space-y-3">
                <div className="h-3 w-16 bg-slate-200/70 rounded" />
                <div className="h-4 w-3/4 bg-slate-200/80 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-5 w-20 bg-slate-200/80 rounded" />
                  <div className="h-9 w-24 bg-slate-200/80 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
