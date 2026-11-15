"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  Check,
  Star,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { ShopTabType } from "./ShopCategoryChips";

export interface ShopFilterValues {
  activeType: ShopTabType;
  activeSubCategory: string;
  pricePreset: "all" | "under-499" | "500-999" | "1000-1999" | "2000-plus" | "custom";
  minPrice: string;
  maxPrice: string;
  inStockOnly: boolean;
  selectedTag: string;
  minRating: number;
  careLevel: string;
}

export interface ShopFilterSidebarProps {
  filters: ShopFilterValues;
  availableSubCategories: string[];
  totalActiveCount: number;
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
  { id: "All Tags", label: "All Products" },
  { id: "Bestseller", label: "Bestseller 🔥" },
  { id: "Trending", label: "Trending Now ✨" },
  { id: "Featured", label: "Staff Pick / Featured" },
  { id: "New Arrival", label: "New Arrival 🌿" },
];

const CARE_OPTIONS = [
  { id: "All", label: "Any Care Level" },
  { id: "Easy", label: "Beginner Friendly (Easy)" },
  { id: "Low Light", label: "Low Light Tolerant" },
  { id: "Indirect Light", label: "Bright Indirect Sunlight" },
  { id: "Direct Sun", label: "Direct Outdoor Sun" },
];

export default function ShopFilterSidebar({
  filters,
  availableSubCategories,
  totalActiveCount,
  onTypeChange,
  onSubCategoryChange,
  onPricePresetChange,
  onCustomPriceApply,
  onInStockChange,
  onTagChange,
  onRatingChange,
  onCareLevelChange,
  onResetAll,
}: ShopFilterSidebarProps) {
  // Accordion open/close states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    subCategory: true,
    price: true,
    availability: true,
    badges: true,
    rating: false,
    care: false,
  });

  const [localMin, setLocalMin] = useState(filters.minPrice);
  const [localMax, setLocalMax] = useState(filters.maxPrice);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    onCustomPriceApply(localMin, localMax);
  };

  return (
    <aside
      aria-label="Product filters"
      className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 scrollbar-thin space-y-4"
    >
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs divide-y divide-slate-100">
        {/* ── Sidebar Header ── */}
        <div className="pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Filters</h2>
            {totalActiveCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center">
                {totalActiveCount}
              </span>
            )}
          </div>

          {totalActiveCount > 0 && (
            <button
              type="button"
              onClick={onResetAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        {/* ── 1. Department / Category Accordion ── */}
        <div className="py-4">
          <button
            type="button"
            onClick={() => toggleSection("category")}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer group"
          >
            <span className="flex items-center gap-1.5">
              Category
              {filters.activeType !== "All" && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              )}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                openSections.category ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.category && (
            <div className="mt-3 space-y-1">
              {CATEGORY_ITEMS.map((item) => {
                const isSelected = filters.activeType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => onTypeChange(item.type)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-900 font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm" role="img" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 2. Sub-Category Accordion (When available) ── */}
        {availableSubCategories.length > 1 && (
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleSection("subCategory")}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer group"
            >
              <span className="flex items-center gap-1.5">
                Sub-Category
                {filters.activeSubCategory !== "All" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                )}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                  openSections.subCategory ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.subCategory && (
              <div className="mt-3 max-h-48 overflow-y-auto scrollbar-thin pr-1 space-y-1">
                {availableSubCategories.map((sub) => {
                  const isSelected = filters.activeSubCategory === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => onSubCategoryChange(sub)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50 text-emerald-900 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="truncate">{sub}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── 3. Price Range Accordion ── */}
        <div className="py-4">
          <button
            type="button"
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer group"
          >
            <span className="flex items-center gap-1.5">
              Price Range
              {filters.pricePreset !== "all" && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              )}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                openSections.price ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.price && (
            <div className="mt-3 space-y-2">
              {PRICE_PRESETS.map((preset) => {
                const isSelected = filters.pricePreset === preset.id;
                return (
                  <label
                    key={preset.id}
                    className="flex items-center gap-2.5 px-2 py-1 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none rounded-md hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="pricePreset"
                      checked={isSelected}
                      onChange={() => onPricePresetChange(preset.id)}
                      className="w-4 h-4 accent-emerald-700 cursor-pointer"
                    />
                    <span className={isSelected ? "font-bold text-emerald-900" : ""}>
                      {preset.label}
                    </span>
                  </label>
                );
              })}

              {/* Custom Price Inputs */}
              <form onSubmit={handleApplyCustomPrice} className="pt-2 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500">Custom Price (₹)</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={localMin}
                    onChange={(e) => setLocalMin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                  <span className="text-slate-400 text-xs">–</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={localMax}
                    onChange={(e) => setLocalMax(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Go
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ── 4. Availability & Stock Accordion ── */}
        <div className="py-4">
          <button
            type="button"
            onClick={() => toggleSection("availability")}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer group"
          >
            <span className="flex items-center gap-1.5">
              Availability
              {filters.inStockOnly && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                openSections.availability ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.availability && (
            <div className="mt-3">
              <label className="flex items-center justify-between p-2 rounded-xl border border-slate-200/70 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer select-none transition-all">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  In Stock Only
                </span>
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => onInStockChange(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>

        {/* ── 5. Badges & Collections Accordion ── */}
        <div className="py-4">
          <button
            type="button"
            onClick={() => toggleSection("badges")}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer group"
          >
            <span className="flex items-center gap-1.5">
              Highlights
              {filters.selectedTag !== "All Tags" && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              )}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                openSections.badges ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.badges && (
            <div className="mt-3 space-y-1">
              {BADGE_OPTIONS.map((badge) => {
                const isSelected = filters.selectedTag === badge.id;
                return (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => onTagChange(badge.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-900 font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{badge.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 6. Rating Filter Accordion ── */}
        <div className="py-4">
          <button
            type="button"
            onClick={() => toggleSection("rating")}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer group"
          >
            <span className="flex items-center gap-1.5">
              Customer Rating
              {filters.minRating > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                openSections.rating ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.rating && (
            <div className="mt-3 space-y-1.5">
              {[
                { rating: 0, label: "All Ratings" },
                { rating: 4.5, label: "4.5★ & Above" },
                { rating: 4.0, label: "4.0★ & Above" },
                { rating: 3.5, label: "3.5★ & Above" },
              ].map((r) => {
                const isSelected = filters.minRating === r.rating;
                return (
                  <label
                    key={r.rating}
                    className="flex items-center gap-2.5 px-2 py-1 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none rounded-md hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="minRating"
                      checked={isSelected}
                      onChange={() => onRatingChange(r.rating)}
                      className="w-4 h-4 accent-emerald-700 cursor-pointer"
                    />
                    <span className={`flex items-center gap-1 ${isSelected ? "font-bold text-emerald-900" : ""}`}>
                      {r.rating > 0 && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                      {r.label}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 7. Care & Sunlight Requirements (For live plants) ── */}
        {(filters.activeType === "Plants" || filters.activeType === "All") && (
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleSection("care")}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer group"
            >
              <span className="flex items-center gap-1.5">
                Care & Sunlight
                {filters.careLevel !== "All" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                )}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                  openSections.care ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections.care && (
              <div className="mt-3 space-y-1">
                {CARE_OPTIONS.map((c) => {
                  const isSelected = filters.careLevel === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onCareLevelChange(c.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50 text-emerald-900 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>{c.label}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trust Mini Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-slate-700 text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          Nursery Direct Guarantee
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Plants are inspected by botanists, potted in custom organic soil, and packed with root
          moisture locks for zero transit stress.
        </p>
      </div>
    </aside>
  );
}
