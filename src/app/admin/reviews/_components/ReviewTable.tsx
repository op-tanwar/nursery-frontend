"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  CheckCircle,
  ShieldAlert,
  XCircle,
  Trash2,
  ExternalLink,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { IAdminReviewItem, ReviewStatus } from "@/types/review.types";

interface ReviewTableProps {
  reviews: IAdminReviewItem[];
  isLoading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onUpdateStatus: (id: string, status: ReviewStatus) => void;
  onDeleteReview: (id: string, authorName: string) => void;
  mutatingId: string | null;
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
}

export default function ReviewTable({
  reviews,
  isLoading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onUpdateStatus,
  onDeleteReview,
  mutatingId,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ReviewTableProps) {
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allSelected = reviews.length > 0 && reviews.every((r) => selectedIds.includes(r._id));
  const someSelected = reviews.some((r) => selectedIds.includes(r._id)) && !allSelected;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300 fill-slate-100"
            }`}
          />
        ))}
        <span className="ml-1 text-xs font-bold text-slate-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
      case "flagged":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            Flagged
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <XCircle className="w-3 h-3 text-slate-500" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">No reviews found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No customer reviews match your active filter criteria. Try adjusting your search query, status, or rating filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={onToggleSelectAll}
                  aria-label="Select all reviews"
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-4 min-w-[200px]">Product</th>
              <th className="py-3 px-4 min-w-[170px]">Customer</th>
              <th className="py-3 px-4 min-w-[260px]">Rating & Review</th>
              <th className="py-3 px-4 min-w-[120px]">Status</th>
              <th className="py-3 px-4 min-w-[160px] text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reviews.map((rev) => {
              const isSelected = selectedIds.includes(rev._id);
              const isMutating = mutatingId === rev._id;
              const isExpanded = Boolean(expandedComments[rev._id]);
              const commentText = rev.comment || "";
              const shouldTruncate = commentText.length > 120;
              const displayComment =
                shouldTruncate && !isExpanded
                  ? `${commentText.slice(0, 120)}...`
                  : commentText;

              const formattedDate = rev.createdAt
                ? new Date(rev.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Unknown date";

              return (
                <tr
                  key={rev._id}
                  className={`hover:bg-slate-50/60 transition-colors ${
                    isSelected ? "bg-emerald-50/40" : ""
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-3 px-3 text-center align-top">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(rev._id)}
                      aria-label={`Select review by ${rev.user?.name || "Customer"}`}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>

                  {/* Product Details */}
                  <td className="py-3 px-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 relative rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {rev.productImage ? (
                          <Image
                            src={rev.productImage}
                            alt={rev.productName || "Product"}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${rev.productSlug || rev.productId}`}
                          target="_blank"
                          className="font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1 flex items-center gap-1 group"
                          title={rev.productName}
                        >
                          <span>{rev.productName}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded capitalize">
                            {rev.productCategory || "Product"}
                          </span>
                          {rev.productRatingsAverage !== undefined && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              ★ {rev.productRatingsAverage} ({rev.productRatingsQuantity || 0})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Customer Information */}
                  <td className="py-3 px-4 align-top">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 truncate">
                        {rev.user?.name || "Customer"}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate" title={rev.user?.email}>
                        {rev.user?.email || "No email available"}
                      </div>
                      <div>
                        {rev.isVerifiedBuyer ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                            Verified Buyer
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Rating & Review Content */}
                  <td className="py-3 px-4 align-top">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        {renderStars(rev.rating)}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formattedDate}
                        </span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed break-words">
                        {displayComment}
                      </p>
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleExpand(rev._id)}
                          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          {isExpanded ? "Show less" : "Read full review"}
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 align-top">
                    <div className="pt-0.5">{getStatusBadge(rev.status)}</div>
                  </td>

                  {/* Moderation Actions */}
                  <td className="py-3 px-4 align-top text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Approve button */}
                      {rev.status !== "approved" && (
                        <button
                          onClick={() => onUpdateStatus(rev._id, "approved")}
                          disabled={isMutating}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200 hover:border-emerald-400"
                          title="Approve review"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Flag button */}
                      {rev.status !== "flagged" && (
                        <button
                          onClick={() => onUpdateStatus(rev._id, "flagged")}
                          disabled={isMutating}
                          className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 hover:border-amber-400"
                          title="Flag for review"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Reject button */}
                      {rev.status !== "rejected" && (
                        <button
                          onClick={() => onUpdateStatus(rev._id, "rejected")}
                          disabled={isMutating}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 hover:border-slate-400"
                          title="Reject review"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete button */}
                      <button
                        onClick={() => onDeleteReview(rev._id, rev.user?.name || "Customer")}
                        disabled={isMutating}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 hover:border-rose-400"
                        title="Purge review from database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50/80 border-t border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span>
            Showing{" "}
            <strong className="text-slate-900 font-bold">
              {Math.min((currentPage - 1) * pageSize + 1, totalCount)}
            </strong>{" "}
            to{" "}
            <strong className="text-slate-900 font-bold">
              {Math.min(currentPage * pageSize, totalCount)}
            </strong>{" "}
            of <strong className="text-slate-900 font-bold">{totalCount}</strong> reviews
          </span>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-slate-400 text-[11px]">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Reviews per page"
              className="py-1 px-2 border border-slate-300 rounded bg-white text-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="p-1.5 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 text-xs font-bold text-slate-800">
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1.5 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
