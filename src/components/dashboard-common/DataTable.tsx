"use client";

import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

// Column config design schema template
export interface ColumnConfig<T> {
  header: string;
  accessorKey: keyof T | string;
  // Custom cell renderer feature for custom badges, icons, images or actions
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  searchPlaceholder?: string;
  searchKey: keyof T; // Kis key par search execute karni hai (e.g., 'user' or 'name')
  filterKey?: keyof T; // Optional: Status mapping filter dropdown ke liye
  filterOptions?: string[];
}

export default function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Search records...",
  searchKey,
  filterKey,
  filterOptions = [],
}: DataTableProps<T>) {
  // Core UI Control States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Default items per page

  // 1. Core Filter Logic (Search + Dropdown filter sync)
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Global Search matching
      const targetValue = item[searchKey];
      const matchesSearch = targetValue
        ? String(targetValue).toLowerCase().includes(searchQuery.toLowerCase())
        : false;

      // Dropdown Filter state matching
      const matchesFilter =
        selectedFilter === "All" ||
        (filterKey && String(item[filterKey]) === selectedFilter);

      return matchesSearch && matchesFilter;
    });
  }, [data, searchQuery, selectedFilter, searchKey, filterKey]);

  // Reset page position if search string mutation occurs
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilter]);

  // 2. Pagination Calculations
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* 🛠️ Dynamic Action Control Bar (Search & Filter Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
        {/* Modern Search bar widget input */}
        <div className="relative w-full sm:max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-hidden focus:border-green-600/40 focus:ring-4 focus:ring-green-600/5 transition-all text-slate-800"
          />
        </div>

        {/* Filters and Controls alignment */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {filterKey && filterOptions.length > 0 && (
            <div className="relative flex items-center">
              <SlidersHorizontal className="absolute left-3.5 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer outline-hidden hover:border-slate-300 focus:border-green-600/40 transition-all appearance-none"
              >
                <option value="All">All Statuses</option>
                {filterOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dynamic Page Sizer Selector */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer outline-hidden hover:border-slate-300 focus:border-green-600/40 transition-all"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 📊 Core Mobile-Safe Adaptive Scroll Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs w-full">
        <div className="w-full overflow-x-auto block whitespace-nowrap">
          <table className="w-full text-left border-collapse min-w-[750px] md:min-w-full">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider select-none">
                {columns.map((col, index) => (
                  <th key={index} className={`py-4 px-6 ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-xs font-medium text-slate-700 divide-y divide-slate-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50/40 transition-colors">
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className={`py-4 px-6 ${col.className || ""}`}>
                        {col.cell ? (
                          col.cell(row)
                        ) : (
                          (row[col.accessorKey as keyof T] as React.ReactNode) || "-"
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-12 text-center text-slate-400 font-medium text-xs bg-slate-50/20"
                  >
                    No matching records found in database grid.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📉 Pagination Footer Metadata Area */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 select-none">
        <div className="text-[11px] font-medium text-slate-400 order-2 sm:order-1">
          Showing <span className="text-slate-700 font-bold">{filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{" "}
          <span className="text-slate-700 font-bold">
            {Math.min(currentPage * pageSize, filteredData.length)}
          </span>{" "}
          of <span className="text-slate-700 font-bold">{filteredData.length}</span> entries
        </div>

        {/* Navigation Triggers Cluster */}
        <div className="flex items-center gap-1.5 order-1 sm:order-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer inline-flex items-center disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Current Page State Marker */}
          <div className="min-w-[40px] px-2 h-9 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-center font-bold text-slate-800 text-xs">
            {currentPage} / {totalPages}
          </div>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer inline-flex items-center disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}