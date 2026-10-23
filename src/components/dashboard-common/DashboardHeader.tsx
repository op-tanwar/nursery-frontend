"use client";

import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { TimeframeFilter, ICustomDateRange } from "@/types/dashboard.types";

export interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  timeframe: TimeframeFilter;
  onTimeframeChange: (timeframe: TimeframeFilter) => void;
  customDateRange: ICustomDateRange;
  onCustomDateApply: (range: ICustomDateRange) => void;
  /** When true, shows yesterday / last_week / last_year options */
  extendedOptions?: boolean;
}

const BASE_OPTIONS: { value: TimeframeFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom Date Range" },
];

const EXTENDED_OPTIONS: { value: TimeframeFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
  { value: "custom", label: "Custom Date Range" },
];

export default function DashboardHeader({
  title,
  subtitle,
  timeframe,
  onTimeframeChange,
  customDateRange,
  onCustomDateApply,
  extendedOptions = false,
}: DashboardHeaderProps) {
  const [localStartDate, setLocalStartDate] = useState(
    customDateRange.startDate || ""
  );
  const [localEndDate, setLocalEndDate] = useState(
    customDateRange.endDate || ""
  );

  const options = extendedOptions ? EXTENDED_OPTIONS : BASE_OPTIONS;

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localStartDate && localEndDate) {
      onCustomDateApply({ startDate: localStartDate, endDate: localEndDate });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {timeframe === "custom" && (
          <form
            onSubmit={handleCustomDateSubmit}
            className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs"
          >
            <input
              type="date"
              aria-label="Start Date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
              required
            />
            <span className="text-xs font-bold text-slate-400">to</span>
            <input
              type="date"
              aria-label="End Date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow-xs cursor-pointer"
            >
              Apply
            </button>
          </form>
        )}

        <div className="relative">
          <select
            value={timeframe}
            onChange={(e) =>
              onTimeframeChange(e.target.value as TimeframeFilter)
            }
            aria-label="Select Timeframe"
            className="w-full sm:w-52 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none pr-10"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
