"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Zap, PackageCheck, Sparkles, ShieldCheck } from "lucide-react";

interface ProductImageSectionProps {
  tag: string | null;
  emoji: string;
  name: string;
  galleryImages?: string[];
}

export default function ProductImageSection({
  tag,
  emoji,
  name,
  galleryImages = [],
}: ProductImageSectionProps) {
  // Main active image resolution state
  const [activeImage, setActiveImage] = useState<string>(emoji);

  useEffect(() => {
    setActiveImage(emoji);
  }, [emoji]);

  const isImageUrl = (url: string) => url?.startsWith("http") || url?.startsWith("/");

  // Gallery list compilation (Main image + Extra gallery images)
  const allImages = React.useMemo(() => {
    const list = [emoji, ...galleryImages].filter(Boolean);
    return Array.from(new Set(list));
  }, [emoji, galleryImages]);

  return (
    <div className="md:col-span-5 lg:col-span-5 flex flex-col gap-4">
      {/* 2-LAYER HERO IMAGE CANVAS */}
      <div className="relative w-full aspect-square bg-slate-50 border border-slate-200/80 rounded-3xl overflow-hidden flex items-center justify-center shadow-xs group">

        {isImageUrl(activeImage) ? (
          <>
            {/* LAYER 1: CSS-only blur wash (no second network image — saves LCP bandwidth) */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-20 blur-2xl scale-110 pointer-events-none bg-center bg-cover"
              style={{ backgroundImage: `url(${activeImage})` }}
            />

            {/* LAYER 2: Crisp Main Hero Image */}
            <div className="relative z-10 w-full h-full p-6 flex items-center justify-center">
              <Image
                src={activeImage}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105 drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
                priority
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YxZjVmOSIvPjwvc3ZnPg=="
              />
            </div>
          </>
        ) : (
          <span className="text-[10px] sm:text-[130px] select-none transition-transform duration-300 group-hover:scale-110 drop-shadow-md z-10">
            {activeImage}
          </span>
        )}

        {/* TAG BADGE */}
        {tag && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-full uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{tag}</span>
          </div>
        )}

        {/* QUALITY SEAL BADGE */}
        <div className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-md border border-slate-200/80 text-emerald-700 text-[10px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Quality</span>
        </div>
      </div>

      {/* GALLERY THUMBNAILS (If multiple images exist) */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {allImages.map((img, idx) => {
            const isActive = activeImage === img;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`relative w-16 h-16 shrink-0 rounded-2xl border-2 overflow-hidden bg-slate-50 transition-all duration-200 cursor-pointer ${isActive
                  ? "border-emerald-600 shadow-sm scale-105"
                  : "border-slate-200/80 opacity-70 hover:opacity-100 hover:border-slate-300"
                  }`}
              >
                {isImageUrl(img) ? (
                  <Image
                    src={img}
                    alt={`${name} thumbnail ${idx + 1}`}
                    fill
                    sizes="64px"
                    className="object-contain p-1.5"
                  />
                ) : (
                  <span className="text-xl flex items-center justify-center h-full">
                    {img}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* DISPATCH / DELIVERY CARD WITH LUCIDE ICONS */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-start gap-3 shadow-2xs">
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 shrink-0">
          <Zap className="w-4 h-4 fill-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-slate-900 m-0 uppercase tracking-wider">
              Hyperlocal Express Dispatch
            </h4>
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xs text-slate-500 m-0 mt-1 font-medium leading-relaxed">
            Indore hub location checkpoints se directly optimized dispatch routing enabled.
          </p>
        </div>
      </div>
    </div>
  );
}