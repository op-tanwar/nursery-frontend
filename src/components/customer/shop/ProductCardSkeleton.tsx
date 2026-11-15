"use client";

import React from "react";

/**
 * 🌿 ProductCardSkeleton
 * Pixel-perfect skeleton loader matching the exact geometry, aspect ratio,
 * padding, and visual hierarchy of `ShopItemCard` to eliminate Cumulative Layout Shift (CLS).
 */
export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="group relative flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs animate-pulse"
    >
      {/* Image Canvas Skeleton (aspect 4/3 matching ShopItemCard) */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-slate-100 to-slate-200/60 flex items-center justify-center overflow-hidden">
        {/* Placeholder Badge (Top-Left) */}
        <div className="absolute top-2.5 left-2.5 h-5 w-20 bg-slate-200/80 rounded-full" />
        {/* Placeholder Wishlist Button (Top-Right) */}
        <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-200/80" />
        {/* Center plant silhouette placeholder */}
        <div className="w-16 h-16 rounded-full bg-slate-200/50" />
      </div>

      {/* Card Body Skeleton */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        {/* Top Info */}
        <div className="space-y-2">
          {/* Vendor line */}
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200" />
            <div className="h-3 w-24 bg-slate-200 rounded-md" />
          </div>

          {/* Product Title (2 lines) */}
          <div className="space-y-1.5 pt-0.5">
            <div className="h-4 w-11/12 bg-slate-200 rounded-md" />
            <div className="h-4 w-3/5 bg-slate-200 rounded-md" />
          </div>

          {/* Star Rating & Reviews */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="w-3 h-3 rounded-full bg-slate-200" />
              ))}
            </div>
            <div className="h-3 w-12 bg-slate-200 rounded-md" />
          </div>
        </div>

        {/* Bottom Pricing & Action Button */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <div className="h-6 w-20 bg-slate-200 rounded-md" />
            <div className="h-4 w-14 bg-slate-200/70 rounded-md" />
          </div>
          <div className="h-9 sm:h-10 w-full bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductGridSkeleton({ count = 8, className }: ProductGridSkeletonProps) {
  return (
    <div
      className={
        className ||
        "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3.5 sm:gap-4 md:gap-6"
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default ProductCardSkeleton;
