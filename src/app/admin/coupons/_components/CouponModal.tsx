"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Ticket, Loader2, Sparkles, Check, AlertCircle } from "lucide-react";
import { couponFormSchema, CouponFormData, ICoupon } from "../types";

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CouponFormData) => Promise<void>;
  couponToEdit?: ICoupon | null;
  isSubmitting: boolean;
}

export default function CouponModal({
  isOpen,
  onClose,
  onSubmit,
  couponToEdit,
  isSubmitting,
}: CouponModalProps) {
  const isEditMode = Boolean(couponToEdit);

  // Default start date = today, end date = 30 days from today formatted for datetime-local/date input
  const getDefaultDates = () => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: "",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 499,
      maxDiscountAmount: 200,
      usageLimit: 100,
      startDate: getDefaultDates().startDate,
      endDate: getDefaultDates().endDate,
      isActive: true,
    },
  });

  const selectedDiscountType = watch("discountType");
  const isActive = watch("isActive");

  // Populate form when editing or resetting on create
  useEffect(() => {
    if (couponToEdit) {
      const start = couponToEdit.startDate
        ? new Date(couponToEdit.startDate).toISOString().split("T")[0]
        : getDefaultDates().startDate;
      const end = couponToEdit.expiryDate || couponToEdit.endDate
        ? new Date(couponToEdit.expiryDate || couponToEdit.endDate!).toISOString().split("T")[0]
        : getDefaultDates().endDate;

      reset({
        code: couponToEdit.code,
        discountType: couponToEdit.discountType,
        discountValue: couponToEdit.discountValue,
        minOrderValue: couponToEdit.minOrderValue ?? couponToEdit.minCartValue ?? 0,
        maxDiscountAmount: couponToEdit.maxDiscountAmount ?? null,
        usageLimit: couponToEdit.usageLimit ?? null,
        startDate: start,
        endDate: end,
        isActive: couponToEdit.isActive,
      });
    } else {
      const dates = getDefaultDates();
      reset({
        code: "",
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 499,
        maxDiscountAmount: 200,
        usageLimit: 100,
        startDate: dates.startDate,
        endDate: dates.endDate,
        isActive: true,
      });
    }
  }, [couponToEdit, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
              <Ticket className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {isEditMode ? `Edit Coupon "${couponToEdit?.code}"` : "Create Promotional Coupon"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isEditMode
                  ? "Update voucher rules, redemption limits, or active dates."
                  : "Deploy a new discount coupon across customer checkouts."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-5">
          {/* 1. Coupon Code & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. MONSOON20"
                  {...register("code")}
                  onChange={(e) => {
                    setValue("code", e.target.value.toUpperCase());
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider bg-slate-50/50 outline-hidden transition-all ${
                    errors.code
                      ? "border-red-300 focus:border-red-500 focus:ring-3 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10"
                  }`}
                />
              </div>
              {errors.code && (
                <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.code.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <button
                type="button"
                onClick={() => setValue("isActive", !isActive)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-600" : "bg-slate-400"}`} />
                <span>{isActive ? "Active" : "Draft / Inactive"}</span>
              </button>
            </div>
          </div>

          {/* 2. Discount Model (Radio Tabs) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Discount Model <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("discountType", "percentage")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedDiscountType === "percentage"
                    ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/10"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Percentage (%)</span>
                  {selectedDiscountType === "percentage" && (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">e.g. 15% off cart items</p>
              </button>

              <button
                type="button"
                onClick={() => setValue("discountType", "flat")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedDiscountType === "flat"
                    ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/10"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Flat Amount (₹)</span>
                  {selectedDiscountType === "flat" && (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">e.g. ₹150 off total order</p>
              </button>
            </div>
          </div>

          {/* 3. Discount Value & Max Discount Cap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {selectedDiscountType === "percentage" ? "Discount Percentage (%)" : "Flat Discount (₹)"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                placeholder={selectedDiscountType === "percentage" ? "e.g. 20" : "e.g. 150"}
                {...register("discountValue", { valueAsNumber: true })}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold bg-slate-50/50 outline-hidden transition-all ${
                  errors.discountValue
                    ? "border-red-300 focus:border-red-500 focus:ring-3 focus:ring-red-500/10"
                    : "border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10"
                }`}
              />
              {errors.discountValue && (
                <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.discountValue.message}</span>
                </p>
              )}
            </div>

            {selectedDiscountType === "percentage" && (
              <div className="animate-in fade-in duration-150">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Max Discount Cap (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  {...register("maxDiscountAmount", { valueAsNumber: true })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold bg-slate-50/50 outline-hidden transition-all ${
                    errors.maxDiscountAmount
                      ? "border-red-300 focus:border-red-500 focus:ring-3 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10"
                  }`}
                />
                {errors.maxDiscountAmount && (
                  <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.maxDiscountAmount.message}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 4. Min Order Value & Usage Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Minimum Cart Value (₹)
              </label>
              <input
                type="number"
                placeholder="0 (no minimum required)"
                {...register("minOrderValue", { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
              />
              {errors.minOrderValue && (
                <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.minOrderValue.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Redemptions Limit
              </label>
              <input
                type="number"
                placeholder="Leave blank for unlimited"
                {...register("usageLimit", { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
              />
              {errors.usageLimit && (
                <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.usageLimit.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* 5. Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
              />
              {errors.startDate && (
                <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.startDate.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                End / Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("endDate")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10 transition-all"
              />
              {errors.endDate && (
                <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.endDate.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isEditMode ? "Save Changes" : "Deploy Coupon"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
