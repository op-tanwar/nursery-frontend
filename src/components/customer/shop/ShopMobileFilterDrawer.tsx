"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Star,
  Sun,
} from "lucide-react";
import { ShopTabType } from "./ShopCategoryChips";
import { ShopFilterValues } from "./ShopFilterSidebar";

export interface ShopMobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ShopFilterValues;
  availableSubCategories: string[];
  totalActiveCount: number;
  matchingCount: number;
  onTypeChange: (type: ShopTabType) => void;
  onSubCategoryChange: (sub: string) => void;
  onPricePresetChange: (preset: ShopFilterValues["pricePreset"]) => void;
  onCustomPriceApply: (min: string, max: string) => void;
  onInStockChange: (inStock: boolean) => void;
  onTagChange: (tag: string) => void;
  onRatingChange: (rating: number) => void;
  onCareLevelChange: (level: string) => void;
  onResetAll: () => void;
}

const CATEGORY_ITEMS: { type: ShopTabType; label: string; icon: string }[] = [
  { type: "All", label: "Everything", icon: "🌱" },
  { type: "Plants", label: "Live Plants", icon: "🌿" },
  { type: "Pots", label: "Pots & Planters", icon: "🏺" },
  { type: "Plant Care", label: "Plant Care & Nutrition", icon: "🧪" },
  { type: "Gardening Tools", label: "Gardening Tools", icon: "🛠️" },
  { type: "Seeds & Bulbs", label: "Seeds & Bulbs", icon: "🌾" },
  { type: "Plant Stands", label: "Stands & Shelves", icon: "🪜" },
  { type: "Accessories", label: "Accessories", icon: "🪴" },
  { type: "Artificial & Dried Plants", label: "Artificial & Dried", icon: "🌵" },
];

const PRICE_PRESETS: { id: ShopFilterValues["pricePreset"]; label: string }[] = [
  { id: "all", label: "All Prices" },
  { id: "under-499", label: "Under ₹499" },
  { id: "500-999", label: "₹500 – ₹999" },
  { id: "1000-1999", label: "₹1,000 – ₹1,999" },
  { id: "2000-plus", label: "₹2,000 & Above" },
];

const BADGE_OPTIONS = [
  { id: "All Tags", label: "All Badges" },
  { id: "Bestseller", label: "Bestseller 🔥" },
  { id: "Trending", label: "Trending ✨" },
  { id: "Featured", label: "Staff Pick / Featured" },
  { id: "New Arrival", label: "New Arrival 🌿" },
];

const CARE_OPTIONS = [
  { id: "All", label: "Any Care Level" },
  { id: "Easy", label: "Beginner Friendly" },
  { id: "Low Light", label: "Low Light Tolerant" },
  { id: "Indirect Light", label: "Bright Indirect Sunlight" },
  { id: "Direct Sun", label: "Direct Outdoor Sun" },
];

export default function ShopMobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  availableSubCategories,
  totalActiveCount,
  matchingCount,
  onTypeChange,
  onSubCategoryChange,
  onPricePresetChange,
  onCustomPriceApply,
  onInStockChange,
  onTagChange,
  onRatingChange,
  onCareLevelChange,
  onResetAll,
}: ShopMobileFilterDrawerProps) {
  const [localMin, setLocalMin] = useState(filters.minPrice);
  const [localMax, setLocalMax] = useState(filters.maxPrice);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    subCategory: true,
    price: true,
    availability: true,
    badges: false,
    rating: false,
    care: false,
  });

  const toggleSection = (s: string) => {
    setOpenSections((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filter products drawer"
      className="fixed inset-0 z-[120] lg:hidden"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-[130] w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-emerald-800" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Filter Products</h2>
            {totalActiveCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center">
                {totalActiveCount}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="w-11 h-11 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 divide-y divide-slate-100">
          {/* 1. Category Accordion */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => toggleSection("category")}
              className="w-full min-h-[44px] flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer"
            >
              <span>Category</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.category ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.category && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                {CATEGORY_ITEMS.map((item) => {
                  const isSelected = filters.activeType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => onTypeChange(item.type)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer text-left border ${
                        isSelected
                          ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      <span className="text-base" role="img" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Sub-Category (if present) */}
          {availableSubCategories.length > 1 && (
            <div className="pt-4">
              <button
                type="button"
                onClick={() => toggleSection("subCategory")}
                className="w-full min-h-[44px] flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer"
              >
                <span>Sub-Category</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openSections.subCategory ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.subCategory && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {availableSubCategories.map((sub) => {
                    const isSelected = filters.activeSubCategory === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => onSubCategoryChange(sub)}
                        className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-emerald-800 text-white border-emerald-800 font-bold"
                            : "bg-stone-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. Price Range */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => toggleSection("price")}
              className="w-full min-h-[44px] flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer"
            >
              <span>Price Range</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.price ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.price && (
              <div className="space-y-2 pt-2">
                {PRICE_PRESETS.map((preset) => {
                  const isSelected = filters.pricePreset === preset.id;
                  return (
                    <label
                      key={preset.id}
                      className="min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200/80 text-xs font-medium cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="mobilePricePreset"
                        checked={isSelected}
                        onChange={() => onPricePresetChange(preset.id)}
                        className="w-4 h-4 accent-emerald-700 cursor-pointer"
                      />
                      <span className={isSelected ? "font-bold text-emerald-900" : "text-slate-700"}>
                        {preset.label}
                      </span>
                    </label>
                  );
                })}

                {/* Custom inputs */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={localMin}
                    onChange={(e) => setLocalMin(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-800"
                  />
                  <span className="text-slate-400">–</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={localMax}
                    onChange={(e) => setLocalMax(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => onCustomPriceApply(localMin, localMax)}
                    className="h-11 px-4 bg-emerald-800 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Availability */}
          <div className="pt-4">
            <label className="min-h-[48px] flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 bg-stone-50 cursor-pointer">
              <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                In Stock Items Only
              </span>
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => onInStockChange(e.target.checked)}
                className="w-5 h-5 accent-emerald-700 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* 5. Highlights & Badges */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => toggleSection("badges")}
              className="w-full min-h-[44px] flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer"
            >
              <span>Highlights</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.badges ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.badges && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                {BADGE_OPTIONS.map((badge) => {
                  const isSelected = filters.selectedTag === badge.id;
                  return (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => onTagChange(badge.id)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-800 text-white border-emerald-800 font-bold"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      {badge.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 6. Ratings */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => toggleSection("rating")}
              className="w-full min-h-[44px] flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer"
            >
              <span>Customer Rating</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.rating ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.rating && (
              <div className="space-y-2 pt-2">
                {[
                  { rating: 0, label: "All Ratings" },
                  { rating: 4.5, label: "4.5★ & Above" },
                  { rating: 4.0, label: "4.0★ & Above" },
                ].map((r) => {
                  const isSelected = filters.minRating === r.rating;
                  return (
                    <label
                      key={r.rating}
                      className="min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 text-xs cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="mobileMinRating"
                        checked={isSelected}
                        onChange={() => onRatingChange(r.rating)}
                        className="w-4 h-4 accent-emerald-700 cursor-pointer"
                      />
                      <span className={isSelected ? "font-bold text-emerald-900" : "text-slate-700"}>
                        {r.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Sticky Footer with CTAs */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
          {totalActiveCount > 0 && (
            <button
              type="button"
              onClick={onResetAll}
              className="min-h-[48px] px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Show {matchingCount} Results</span>
          </button>
        </div>
      </div>
    </div>
  );
}
