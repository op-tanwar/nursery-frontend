"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, RefreshCw, Ticket, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { couponService } from "@/services/couponService";
import {
  ICoupon,
  CouponStats,
  StatusFilter,
  DiscountFilter,
  CouponFormData,
} from "./types";
import CouponStatsCards from "./_components/CouponStatsCards";
import CouponControlBar from "./_components/CouponControlBar";
import CouponTable from "./_components/CouponTable";
import CouponModal from "./_components/CouponModal";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [stats, setStats] = useState<CouponStats>({
    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    totalRedemptions: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [discountFilter, setDiscountFilter] = useState<DiscountFilter>("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [couponToEdit, setCouponToEdit] = useState<ICoupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  /**
   * 📡 Fetch coupons and KPI stats from the server
   */
  const fetchCouponsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await couponService.getCoupons({
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        discountType: discountFilter !== "all" ? discountFilter : undefined,
      });

      if (response && response.success) {
        setCoupons(response.coupons || []);
        if (response.stats) {
          setStats(response.stats);
        }
      } else {
        throw new Error("Invalid response format received from coupon service");
      }
    } catch (err: any) {
      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Failed to load promotional coupons.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, discountFilter]);

  // Initial load and filter change trigger
  useEffect(() => {
    fetchCouponsData();
  }, [fetchCouponsData]);

  /**
   * ➕ Open modal to create a new coupon
   */
  const handleOpenCreateModal = () => {
    setCouponToEdit(null);
    setIsModalOpen(true);
  };

  /**
   * ✏️ Open modal to edit an existing coupon
   */
  const handleOpenEditModal = (coupon: ICoupon) => {
    setCouponToEdit(coupon);
    setIsModalOpen(true);
  };

  /**
   * 💾 Handle form submission (Create or Update)
   */
  const handleModalSubmit = async (formData: CouponFormData) => {
    setIsSubmitting(true);
    try {
      if (couponToEdit) {
        // Update Payload: Prevent mutating system fields
        const payload = {
          code: formData.code,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          minOrderValue: formData.minOrderValue,
          maxDiscountAmount: formData.maxDiscountAmount ?? undefined,
          usageLimit: formData.usageLimit ?? undefined,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isActive: formData.isActive,
        };

        const res = await couponService.updateCoupon(couponToEdit._id, payload);
        toast.success(res.message || `Coupon "${formData.code}" updated successfully!`);
      } else {
        // Create Payload
        const payload = {
          code: formData.code,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          minOrderValue: formData.minOrderValue,
          maxDiscountAmount: formData.maxDiscountAmount ?? undefined,
          usageLimit: formData.usageLimit ?? undefined,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isActive: formData.isActive,
        };

        const res = await couponService.createCoupon(payload);
        toast.success(res.message || `Coupon "${formData.code}" deployed successfully!`);
      }

      setIsModalOpen(false);
      fetchCouponsData();
    } catch (err: any) {
      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Operation failed. Please verify input data.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * ⚡ Toggle active status of a coupon
   */
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setMutatingId(id);
    const newStatus = !currentStatus;

    // Optimistic UI update
    setCoupons((prev) =>
      prev.map((c) => (c._id === id ? { ...c, isActive: newStatus } : c))
    );

    try {
      const res = await couponService.toggleCouponStatus(id, newStatus);
      toast.success(res.message || "Coupon status updated.");
      // Refresh background stats accurately
      fetchCouponsData();
    } catch (err: any) {
      // Revert optimistic update
      setCoupons((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: currentStatus } : c))
      );
      toast.error(err?.message || "Failed to toggle status.");
    } finally {
      setMutatingId(null);
    }
  };

  /**
   * 🗑️ Delete coupon with confirmation alert
   */
  const handleDeleteCoupon = async (id: string, code: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete coupon "${code}"?\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    setMutatingId(id);
    try {
      await couponService.deleteCoupon(id);
      toast.success(`Coupon "${code}" deleted successfully.`);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      fetchCouponsData();
    } catch (err: any) {
      toast.error(err?.message || `Failed to delete coupon "${code}".`);
    } finally {
      setMutatingId(null);
    }
  };

  /**
   * 🔄 Reset all active filters
   */
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDiscountFilter("all");
  };

  const isFiltered = useMemo(() => {
    return (
      Boolean(searchQuery.trim()) ||
      statusFilter !== "all" ||
      discountFilter !== "all"
    );
  }, [searchQuery, statusFilter, discountFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* 🏷️ Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
              <Ticket className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Coupon & Promotions Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Configure promotional discount codes, manage checkout redemption caps, and track voucher usage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchCouponsData()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh coupons"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Coupon</span>
          </button>
        </div>
      </div>

      {/* 📊 KPI Stats Cards Bar */}
      <CouponStatsCards stats={stats} isLoading={isLoading} />

      {/* 🎛️ Search & Filter Control Bar */}
      <CouponControlBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        discountFilter={discountFilter}
        onDiscountFilterChange={setDiscountFilter}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
        totalMatching={coupons.length}
      />

      {/* ⚠️ Error State Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-red-700 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={() => fetchCouponsData()}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* 📋 Data Table */}
      <CouponTable
        coupons={coupons}
        isLoading={isLoading}
        onEdit={handleOpenEditModal}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteCoupon}
        isMutatingId={mutatingId}
        onOpenCreate={handleOpenCreateModal}
      />

      {/* 🪄 Create / Edit Slide-Over / Modal */}
      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        couponToEdit={couponToEdit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
