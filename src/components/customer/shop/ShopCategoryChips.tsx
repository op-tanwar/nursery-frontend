"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type ShopTabType =
  | "All"
  | "Plants"
  | "Pots"
  | "Accessories"
  | "Gardening Tools"
  | "Plant Care"
  | "Seeds & Bulbs"
  | "Plant Stands"
  | "Artificial & Dried Plants";

interface CategoryChipOption {
  type: ShopTabType;
  label: string;
  icon: string;
}

const CATEGORY_CHIPS: CategoryChipOption[] = [
  { type: "All", label: "All Plants & Essentials", icon: "🌱" },
  { type: "Plants", label: "Live Plants", icon: "🌿" },
  { type: "Pots", label: "Pots & Planters", icon: "🏺" },
  { type: "Plant Care", label: "Plant Care & Bio", icon: "🧪" },
  { type: "Gardening Tools", label: "Gardening Tools", icon: "🛠️" },
  { type: "Seeds & Bulbs", label: "Seeds & Bulbs", icon: "🌾" },
  { type: "Plant Stands", label: "Stands & Shelves", icon: "🪜" },
  { type: "Accessories", label: "Accessories", icon: "🪴" },
  { type: "Artificial & Dried Plants", label: "Artificial & Dried", icon: "🌵" },
];

export interface ShopCategoryChipsProps {
  activeType: ShopTabType;
  onTypeChange: (type: ShopTabType) => void;
  availableSubCategories: string[];
  activeSubCategory: string;
  onSubCategoryChange: (sub: string) => void;
}

export default function ShopCategoryChips({
  activeType,
  onTypeChange,
  availableSubCategories,
  activeSubCategory,
  onSubCategoryChange,
}: ShopCategoryChipsProps) {
  const primaryScrollRef = useRef<HTMLDivElement>(null);
  const secondaryScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {/* ── Primary Category Pills (Horizontal Scroll) ── */}
      <div className="relative group">
        {/* Left Scroll Trigger Button (Desktop) */}
        <button
          type="button"
          onClick={() => scrollContainer(primaryScrollRef, "left")}
          aria-label="Scroll categories left"
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={primaryScrollRef}
          className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none py-1 px-1 -mx-1 scroll-smooth"
        >
          {CATEGORY_CHIPS.map((chip) => {
            const isActive = activeType === chip.type;
            return (
              <button
                key={chip.type}
                type="button"
                onClick={() => onTypeChange(chip.type)}
                className={`group shrink-0 inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold tracking-normal transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                  isActive
                    ? "bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-700/50"
                    : "bg-white text-slate-700 border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-900 shadow-2xs"
                }`}
              >
                <span className="text-sm shrink-0" role="img" aria-hidden="true">
                  {chip.icon}
                </span>
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Trigger Button (Desktop) */}
        <button
          type="button"
          onClick={() => scrollContainer(primaryScrollRef, "right")}
          aria-label="Scroll categories right"
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Secondary Subcategory Pills (Appears when subcategories exist) ── */}
      {availableSubCategories && availableSubCategories.length > 1 && (
        <div className="relative group bg-stone-50/80 border border-stone-200/70 rounded-2xl p-2 sm:p-2.5">
          <div className="flex items-center justify-between px-1 mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="inline-flex items-center gap-1.5 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Popular in {activeType === "All" ? "Everything" : activeType}
            </span>
          </div>

          <div
            ref={secondaryScrollRef}
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 px-0.5 scroll-smooth"
          >
            {availableSubCategories.map((sub) => {
              const isActive = activeSubCategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => onSubCategoryChange(sub)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer select-none active:scale-95 ${
                    isActive
                      ? "bg-emerald-800 text-white font-semibold shadow-2xs"
                      : "bg-white text-slate-600 border border-slate-200/80 hover:bg-emerald-50/50 hover:text-emerald-900 hover:border-emerald-200"
                  }`}
                >
                  {sub === "All" ? `All ${activeType}` : sub}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
