"use client";

import React from "react";

interface PlantLoaderProps {
  readonly text?: string;
  readonly fullScreen?: boolean;
}

export default function PlantLoader({
  text = "Growing your green space...",
  fullScreen = true,
}: PlantLoaderProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md"
    : "flex flex-col items-center justify-center p-8 w-full min-h-[250px]";

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Glowing Background Pulse */}
        <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping duration-1000" />
        <div className="absolute inset-2 bg-emerald-100 rounded-full animate-pulse" />

        {/* Animated Plant SVG */}
        <svg
          className="w-16 h-16 relative z-10 text-emerald-600 overflow-visible"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pot */}
          <path
            d="M20 44L23 56C23.2 56.8 24 57.5 25 57.5H39C40 57.5 40.8 56.8 41 56L44 44H20Z"
            className="fill-emerald-800/20 stroke-emerald-800 stroke-[2.5] stroke-linejoin-round"
          />
          <path
            d="M18 40H46V44H18V40Z"
            className="fill-emerald-800 stroke-emerald-800 stroke-[2] stroke-linejoin-round"
          />

          {/* Growing Stem */}
          <path
            d="M32 40V20"
            className="stroke-emerald-600 stroke-[3] stroke-linecap-round animate-[growStem_1.8s_infinite_ease-in-out]"
          />

          {/* Left Leaf */}
          <path
            d="M32 30C25 28 20 22 22 15C29 15 32 24 32 30Z"
            className="fill-emerald-500 stroke-emerald-600 stroke-[1.5] origin-bottom-right animate-[leafWiggleLeft_1.8s_infinite_ease-in-out]"
          />

          {/* Right Leaf */}
          <path
            d="M32 24C39 22 44 16 42 9C35 9 32 18 32 24Z"
            className="fill-emerald-400 stroke-emerald-600 stroke-[1.5] origin-bottom-left animate-[leafWiggleRight_1.8s_infinite_ease-in-out]"
          />

          {/* Top Sprout / Bud */}
          <circle
            cx="32"
            cy="18"
            r="2.5"
            className="fill-emerald-300 animate-pulse"
          />
        </svg>
      </div>

      {/* Loading Text with Shimmer Effect */}
      {text && (
        <p className="mt-4 text-xs font-bold tracking-wider text-emerald-800 uppercase animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

// 3. Usage Examples
// Full Page Loading (Next.js loading.tsx mein):
// TypeScript
// import PlantLoader from "@/components/common/PlantLoader";

// export default function Loading() {
//   return <PlantLoader fullScreen text="Loading fresh plants..." />;
// }
// Section / Component Level Loading (e.g. Cart, Product Grid):
// TypeScript
// if (loading) {
//   return <PlantLoader fullScreen={false} text="Fetching items..." />;
// }