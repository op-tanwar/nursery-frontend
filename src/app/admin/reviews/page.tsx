"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { MessageSquare, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { reviewService } from "@/services/reviewService";
import {
  IAdminReviewItem,
  IAdminReviewStats,
  ReviewStatus,
} from "@/types/review.types";
import ReviewStatsCards from "./_components/ReviewStatsCards";
import ReviewControlBar from "./_components/ReviewControlBar";
import ReviewTable from "./_components/ReviewTable";

export default function AdminReviewsModerationPage() {
  const [reviews, setReviews] = useState<IAdminReviewItem[]>([]);
  const [stats, setStats] = useState<IAdminReviewStats>({
    totalReviews: 0,
    pendingReviews: 0,
    flaggedReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    avgRating: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewStatus>("all");
  const [ratingFilter, setRatingFilter] = useState<"all" | number>("all");
  const [sortBy, setSortBy] = useState<
    "createdAt:desc" | "createdAt:asc" | "rating:desc" | "rating:asc"
  >("createdAt:desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Selection & Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * 📡 Fetch paginated reviews and KPI metrics
   */
  const loadReviewsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await reviewService.getAdminGlobalReviews({
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
        rating: ratingFilter,
        search: debouncedSearch,
        sortBy: sortBy,
      });

      if (response && response.success) {
        setReviews(response.reviews || []);
        if (response.stats) {
          setStats(response.stats);
        }
        if (response.pagination) {
          setTotalCount(response.pagination.total);
          setTotalPages(response.pagination.totalPages);
        }
      } else {
        throw new Error("Invalid response received from review moderation service");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load reviews moderation queue.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, ratingFilter, debouncedSearch, sortBy]);

  useEffect(() => {
    loadReviewsData();
  }, [loadReviewsData]);

  // Handle single review status update
  const handleUpdateStatus = async (reviewId: string, newStatus: ReviewStatus) => {
    setMutatingId(reviewId);
    try {
      const res = await reviewService.updateReviewStatus(reviewId, newStatus);
      if (res && res.success) {
        toast.success(`Review marked as ${newStatus}.`);

        // Update local state optimistically
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, status: newStatus } : r))
        );

        // Refresh stats
        const freshData = await reviewService.getAdminGlobalReviews({
          page: currentPage,
          limit: pageSize,
          status: statusFilter,
          rating: ratingFilter,
          search: debouncedSearch,
          sortBy: sortBy,
        });
        if (freshData?.stats) {
          setStats(freshData.stats);
        }
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update review status."
      );
    } finally {
      setMutatingId(null);
    }
  };

  // Handle single review permanent deletion
  const handleDeleteReview = async (reviewId: string, authorName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete the review by "${authorName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setMutatingId(reviewId);
    try {
      const res = await reviewService.deleteAdminReview(reviewId);
      if (res && res.success) {
        toast.success("Review deleted successfully.");
        // Remove from local reviews
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        setSelectedIds((prev) => prev.filter((id) => id !== reviewId));
        setTotalCount((prev) => Math.max(0, prev - 1));

        // Re-fetch to synchronize state
        loadReviewsData();
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete review."
      );
    } finally {
      setMutatingId(null);
    }
  };

  // Handle bulk action on selected reviews
  const handleBulkAction = async (status: ReviewStatus) => {
    if (selectedIds.length === 0) return;

    setIsBulkLoading(true);
    try {
      const res = await reviewService.bulkUpdateReviewStatus(selectedIds, status);
      if (res && res.success) {
        toast.success(`Updated ${res.updatedCount || selectedIds.length} reviews to ${status}.`);
        setSelectedIds([]);
        loadReviewsData();
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Bulk operation failed."
      );
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Selection toggles
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (reviews.length === 0) return;
    const allSelected = reviews.every((r) => selectedIds.includes(r._id));
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reviews.map((r) => r._id));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Customer Reviews Moderation Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global review audit system: verify purchases, moderate flagged content, approve feedback, and protect platform rating integrity.
          </p>
        </div>

        <button
          onClick={loadReviewsData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Stats Overview */}
      <ReviewStatsCards stats={stats} isLoading={isLoading} />

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <div className="flex-1">
            <strong className="font-bold">Error loading queue: </strong>
            <span>{error}</span>
          </div>
          <button
            onClick={loadReviewsData}
            className="text-xs font-bold underline hover:no-underline text-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Control Bar: Filters, Search, Tabs, Bulk Operations */}
      <ReviewControlBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={(status) => {
          setStatusFilter(status);
          setCurrentPage(1);
        }}
        ratingFilter={ratingFilter}
        onRatingChange={(rating) => {
          setRatingFilter(rating);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortChange={(sort) => {
          setSortBy(sort);
          setCurrentPage(1);
        }}
        selectedCount={selectedIds.length}
        onBulkAction={handleBulkAction}
        onClearSelection={() => setSelectedIds([])}
        isBulkLoading={isBulkLoading}
      />

      {/* Reviews Data Table & Pagination */}
      <ReviewTable
        reviews={reviews}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onUpdateStatus={handleUpdateStatus}
        onDeleteReview={handleDeleteReview}
        mutatingId={mutatingId}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
