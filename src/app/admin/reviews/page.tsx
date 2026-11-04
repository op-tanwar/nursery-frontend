"use client";

import React, { useState } from "react";
import DataTable, { ColumnConfig } from "@/components/dashboard-common/DataTable";
import { productService } from "@/services/productService";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setProductLoading,
  setProductError,
  setProductReviews,
  deleteReviewFromState,
} from "@/redux/slices/productSlice";
import { MessageSquare, ShieldAlert, Trash2, Search, RefreshCw, Star } from "lucide-react";

interface ReviewRecord {
  _id?: string;
  user?: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export default function AdminPlantReviews() {
  const dispatch = useAppDispatch();
  const { currentReviews, isLoading, error } = useAppSelector((state) => state.product);

  const [productIdInput, setProductIdInput] = useState<string>("");
  const [searchedProductId, setSearchedProductId] = useState<string>("");

  const fetchReviewsData = async (targetId: string) => {
    if (!targetId.trim()) return;

    dispatch(setProductLoading(true));
    dispatch(setProductError(null));

    try {
      const response = await productService.getProductByIdOrSlug(targetId.trim());
      const extractedReviews = response.product?.reviews || [];

      dispatch(setProductReviews(extractedReviews));
      setSearchedProductId(targetId.trim());
    } catch (err: any) {
      dispatch(
        setProductError(
          err?.response?.data?.message || err?.message || "No product found or failed to fetch reviews."
        )
      );
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviewsData(productIdInput);
  };

  const handleReload = () => {
    if (searchedProductId) {
      fetchReviewsData(searchedProductId);
    }
  };

  const handleDeleteReview = async (reviewId: string, authorName: string) => {
    if (!searchedProductId) return;

    if (
      window.confirm(
        `Are you absolutely sure you want to completely purge the review submitted by "${authorName}"?`
      )
    ) {
      try {
        await productService.deleteProductReview(searchedProductId, reviewId);
        dispatch(deleteReviewFromState(reviewId));
        alert("Review record deleted successfully.");
      } catch (err: any) {
        alert(err?.response?.data?.message || err?.message || "Operation failed.");
      }
    }
  };

  const columns: ColumnConfig<ReviewRecord>[] = [
    {
      header: "Review ID",
      accessorKey: "_id",
      className: "font-mono text-[11px] text-slate-400 font-semibold tracking-tight",
    },
    {
      header: "User Identity Context",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-900 text-xs">{row.name}</span>
          <span className="text-slate-400 text-[10px] font-mono select-all">UID: {row.user || "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Rating Metric Score",
      accessorKey: "rating",
      cell: (row) => {
        const ratingColors =
          row.rating >= 4
            ? "text-amber-600 bg-amber-50 border-amber-100"
            : "text-slate-600 bg-slate-50 border-slate-150";
        return (
          <span
            className={`inline-flex items-center font-black text-[10px] px-2 py-0.5 rounded-md border gap-1 ${ratingColors}`}
          >
            <Star className="w-2.5 h-2.5 fill-current" />
            {row.rating.toFixed(1)}
          </span>
        );
      },
    },
    {
      header: "Feedbacks & System Comments",
      accessorKey: "comment",
      className: "max-w-xs md:max-w-md break-words",
      cell: (row) => (
        <span className="text-slate-600 font-medium text-xs tracking-tight line-clamp-2 hover:line-clamp-none transition-all duration-150 block">
          {row.comment || <em className="text-slate-300 font-normal">"No textual response content provided"</em>}
        </span>
      ),
    },
    {
      header: "Creation Date Timestamp",
      accessorKey: "createdAt",
      cell: (row) => (
        <span className="text-slate-400 font-medium text-[11px] font-mono">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A"}
        </span>
      ),
    },
    {
      header: "Administrative Controls",
      accessorKey: "_id",
      className: "text-center",
      cell: (row) => (
        <button
          type="button"
          title="Purge Feedback"
          onClick={() => handleDeleteReview(row._id || "", row.name)}
          className="p-1.5 border border-slate-200 hover:border-red-200 hover:bg-red-50/60 rounded-lg bg-white text-slate-400 hover:text-red-600 cursor-pointer transition-all inline-flex"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  const safeGridData: ReviewRecord[] = Array.isArray(currentReviews) ? (currentReviews as ReviewRecord[]) : [];

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 m-0 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-slate-800 shrink-0" />
            Product Reviews Management
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
            Search, inspect, and moderate verified buyer reviews across the catalog.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={productIdInput}
              onChange={(e) => setProductIdInput(e.target.value)}
              placeholder="Enter Product ID or Slug..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !productIdInput.trim()}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Fetch Reviews
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 text-xs sm:text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {searchedProductId && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Showing reviews for: <code className="bg-slate-100 px-2 py-0.5 rounded font-mono">{searchedProductId}</code>
          </span>
          <button
            type="button"
            onClick={handleReload}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      )}

      <DataTable<ReviewRecord>
        columns={columns}
        data={safeGridData}
        searchKey="name"
        searchPlaceholder="Filter reviews by reviewer..."
      />
    </div>
  );
}
