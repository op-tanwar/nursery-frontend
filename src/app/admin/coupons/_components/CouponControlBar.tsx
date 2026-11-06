"use client";

import React from "react";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import { StatusFilter, DiscountFilter } from "../types";

interface CouponControlBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  discountFilter: DiscountFilter;
  onDiscountFilterChange: (type: DiscountFilter) => void;
  onResetFilters: () => void;
  isFiltered: boolean;
  totalMatching: number;
}

export default function CouponControlBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  discountFilter,
  onDiscountFilterChange,
  onResetFilters,
  isFiltered,
  totalMatching,
}: CouponControlBarProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* 🔍 Search Input with auto-uppercase indicator */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value.toUpperCase())}
          placeholder="Search by coupon code (e.g. MONSOON20)..."
          className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all placeholder:font-sans placeholder:normal-case placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 🎛️ Filter Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 pl-1">
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters:</span>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 text-slate-700 outline-hidden focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/10 cursor-pointer"
        >
          <option value="all">Status: All</option>
          <option value="active">Active Only</option>
          <option value="expired">Expired</option>
          <option value="inactive">Inactive / Draft</option>
        </select>

        {/* Discount Type Filter */}
        <select
          value={discountFilter}
          onChange={(e) => onDiscountFilterChange(e.target.value as DiscountFilter)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 text-slate-700 outline-hidden focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/10 cursor-pointer"
        >
          <option value="all">Type: All</option>
          <option value="percentage">Percentage (%)</option>
          <option value="flat">Flat Amount (₹)</option>
        </select>

        {/* Reset Filter Action */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
            title="Reset filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}

        <div className="text-[11px] font-bold text-slate-400 pl-2 hidden lg:inline">
          {totalMatching} {totalMatching === 1 ? "coupon" : "coupons"}
        </div>
      </div>
    </div>
  );
}
