"use client";

import React from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Grid3X3,
  Grid2X2,
  LayoutGrid,
} from "lucide-react";
import { ShopTabType } from "./ShopCategoryChips";
import { ShopFilterValues } from "./ShopFilterSidebar";

export type SortOption = "default" | "bestselling" | "lowToHigh" | "highToLow" | "rating" | "newest";

export interface ActiveFilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

export interface ShopToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priceSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  filters: ShopFilterValues;
  totalActiveCount: number;
  onOpenMobileFilters: () => void;
  activeChips: ActiveFilterChip[];
  onResetAll: () => void;
  gridCols: number;
  onToggleGridCols: (cols: number) => void;
}

export default function ShopToolbar({
  searchQuery,
  onSearchChange,
  priceSort,
  onSortChange,
  totalActiveCount,
  onOpenMobileFilters,
  activeChips,
  onResetAll,
  gridCols,
  onToggleGridCols,
}: ShopToolbarProps) {
  return (
    <div className="space-y-3 mb-6">
      {/* ── Main Toolbar: Search + Mobile Trigger + Desktop Sort & Grid Switcher ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search live plants, ceramic pots, fertilizers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-9 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:bg-white transition-all font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search text"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Controls Group */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile & Tablet: "Filters" Trigger Button (Opens slide-over drawer) */}
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="lg:hidden h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50/50 text-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
            <span>Filters</span>
            {totalActiveCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[11px] font-bold flex items-center justify-center">
                {totalActiveCount}
              </span>
            )}
          </button>

          {/* Sort By Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <div className="relative flex items-center">
              <span className="hidden sm:inline-flex absolute left-3 pointer-events-none text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </span>
              <select
                value={priceSort}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                aria-label="Sort products by"
                className="w-full sm:w-auto h-11 bg-white border border-slate-200 rounded-xl pl-3 sm:pl-9 pr-8 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 cursor-pointer transition-all shadow-2xs appearance-none"
              >
                <option value="default">Sort by: Featured</option>
                <option value="bestselling">Best Sellers</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Desktop Grid Switcher (3 cols vs 4 cols) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => onToggleGridCols(3)}
              aria-label="Switch to 3 column view"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                gridCols === 3
                  ? "bg-white text-emerald-800 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Comfortable 3-Column Grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onToggleGridCols(4)}
              aria-label="Switch to 4 column view"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                gridCols === 4
                  ? "bg-white text-emerald-800 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Compact 4-Column Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Grid Switcher (1 col vs 2 cols) */}
          <div className="flex md:hidden items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => onToggleGridCols(gridCols === 1 ? 2 : 1)}
              aria-label="Toggle mobile 1 or 2 column view"
              className="p-1.5 rounded-lg bg-white text-emerald-800 shadow-2xs cursor-pointer"
              title="Toggle Grid View"
            >
              {gridCols === 1 ? <Grid2X2 className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Active Filter Chips Row (Appears when filters are active) ── */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 px-1">
          <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
            Active Filters:
          </span>

          {activeChips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-2.5 py-1 rounded-full text-xs font-semibold shadow-2xs transition-all hover:bg-emerald-100/70"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={`Remove filter: ${chip.label}`}
                className="w-4 h-4 rounded-full flex items-center justify-center text-emerald-700 hover:text-emerald-950 hover:bg-emerald-200/60 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {activeChips.length > 1 && (
            <button
              type="button"
              onClick={onResetAll}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer ml-1 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
