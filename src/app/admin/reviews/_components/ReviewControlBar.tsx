"use client";

import React from "react";
import { Search, X, CheckCircle, ShieldAlert, XCircle, Filter, ArrowUpDown } from "lucide-react";
import { ReviewStatus } from "@/types/review.types";

interface ReviewControlBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: "all" | ReviewStatus;
  onStatusChange: (status: "all" | ReviewStatus) => void;
  ratingFilter: "all" | number;
  onRatingChange: (rating: "all" | number) => void;
  sortBy: string;
  onSortChange: (sort: "createdAt:desc" | "createdAt:asc" | "rating:desc" | "rating:asc") => void;
  selectedCount: number;
  onBulkAction: (action: ReviewStatus) => void;
  onClearSelection: () => void;
  isBulkLoading: boolean;
}

export default function ReviewControlBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  ratingFilter,
  onRatingChange,
  sortBy,
  onSortChange,
  selectedCount,
  onBulkAction,
  onClearSelection,
  isBulkLoading,
}: ReviewControlBarProps) {
  const statusTabs: { label: string; value: "all" | ReviewStatus }[] = [
    { label: "All Reviews", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Flagged", value: "flagged" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      {/* Top row: Status Tabs & Bulk Action Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        {/* Status navigation tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100/80 p-1 rounded-lg">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onStatusChange(tab.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Bulk Action Bar (when rows are selected) */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs animate-in fade-in duration-150">
            <span className="font-bold text-emerald-900">
              {selectedCount} selected
            </span>
            <div className="h-4 w-px bg-emerald-300 mx-1" />
            <button
              onClick={() => onBulkAction("approved")}
              disabled={isBulkLoading}
              className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-0.5 rounded hover:bg-emerald-100 disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Approve
            </button>
            <button
              onClick={() => onBulkAction("flagged")}
              disabled={isBulkLoading}
              className="flex items-center gap-1 font-semibold text-amber-700 hover:text-amber-900 px-2 py-0.5 rounded hover:bg-amber-100 disabled:opacity-50"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Flag
            </button>
            <button
              onClick={() => onBulkAction("rejected")}
              disabled={isBulkLoading}
              className="flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900 px-2 py-0.5 rounded hover:bg-rose-100 disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
            <button
              onClick={onClearSelection}
              className="text-slate-500 hover:text-slate-700 ml-1 p-0.5 rounded hover:bg-slate-200"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom row: Search input, Rating filter, Sort order */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, product, or review text..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Rating filter */}
        <div className="sm:col-span-3 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={ratingFilter}
            onChange={(e) =>
              onRatingChange(
                e.target.value === "all" ? "all" : (Number(e.target.value) as number)
              )
            }
            aria-label="Filter by rating"
            className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
          >
            <option value="all">All Ratings (1 - 5 ★)</option>
            <option value="5">5 Stars only (★★★★★)</option>
            <option value="4">4 Stars only (★★★★☆)</option>
            <option value="3">3 Stars only (★★★☆☆)</option>
            <option value="2">2 Stars only (★★☆☆☆)</option>
            <option value="1">1 Star only (★☆☆☆☆)</option>
          </select>
        </div>

        {/* Sort order */}
        <div className="sm:col-span-3 flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(
                e.target.value as
                  | "createdAt:desc"
                  | "createdAt:asc"
                  | "rating:desc"
                  | "rating:asc"
              )
            }
            aria-label="Sort reviews by"
            className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="rating:desc">Highest Rating</option>
            <option value="rating:asc">Lowest Rating</option>
          </select>
        </div>
      </div>
    </div>
  );
}
