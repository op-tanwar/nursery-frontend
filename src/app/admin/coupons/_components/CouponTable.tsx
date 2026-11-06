"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Edit2,
  Trash2,
  Power,
  Calendar,
  AlertCircle,
  Tag,
  Ticket,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { ICoupon } from "../types";

interface CouponTableProps {
  coupons: ICoupon[];
  isLoading: boolean;
  onEdit: (coupon: ICoupon) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string, code: string) => void;
  isMutatingId?: string | null;
  onOpenCreate: () => void;
}

export default function CouponTable({
  coupons,
  isLoading,
  onEdit,
  onToggleStatus,
  onDelete,
  isMutatingId,
  onOpenCreate,
}: CouponTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Coupon code "${code}" copied to clipboard!`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error("Failed to copy code to clipboard");
    }
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount?: number) => {
    const val = Number(amount) || 0;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const isExpired = (expiryDate?: string | Date) => {
    if (!expiryDate) return false;
    const d = new Date(expiryDate);
    return !isNaN(d.getTime()) && new Date() > d;
  };

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="h-4 w-32 bg-slate-100 animate-pulse rounded-md" />
          <div className="h-4 w-20 bg-slate-100 animate-pulse rounded-md" />
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="space-y-1.5">
                  <div className="w-28 h-4 bg-slate-100 rounded-md" />
                  <div className="w-20 h-3 bg-slate-50 rounded-md" />
                </div>
              </div>
              <div className="w-24 h-4 bg-slate-100 rounded-md hidden md:block" />
              <div className="w-20 h-4 bg-slate-100 rounded-md hidden sm:block" />
              <div className="w-16 h-6 bg-slate-100 rounded-full" />
              <div className="w-20 h-8 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (!coupons || coupons.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center flex flex-col items-center justify-center">
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-4">
          <Ticket className="w-8 h-8 stroke-[1.8]" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No promotional coupons found</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
          There are no promotional coupons matching your current search parameters or active filters.
        </p>
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
        >
          <span>Create First Coupon</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 3. Populated Data Table
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
              <th className="py-3.5 px-4">Coupon Code</th>
              <th className="py-3.5 px-4">Discount Value</th>
              <th className="py-3.5 px-4">Min. Cart Value</th>
              <th className="py-3.5 px-4">Usage & Limits</th>
              <th className="py-3.5 px-4">Validity Window</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {coupons.map((coupon) => {
              const expired = isExpired(coupon.expiryDate || coupon.endDate);
              const isOperating = isMutatingId === coupon._id;
              const hasLimit = typeof coupon.usageLimit === "number" && coupon.usageLimit > 0;
              const usagePercent = hasLimit
                ? Math.min(100, Math.round(((coupon.usedCount || 0) / (coupon.usageLimit as number)) * 100))
                : 0;

              return (
                <tr
                  key={coupon._id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  {/* 1. Code Badge with 1-Click Copy */}
                  <td className="py-3.5 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 group-hover:bg-emerald-50 rounded-lg border border-slate-200/80 group-hover:border-emerald-200 transition-colors">
                        <Tag className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                        <span className="font-mono font-bold text-slate-900 group-hover:text-emerald-900 tracking-tight">
                          {coupon.code}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all cursor-pointer"
                        title="Copy coupon code"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* 2. Formatted Discount */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-xs">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% OFF`
                          : `${formatCurrency(coupon.discountValue)} OFF`}
                      </span>
                      {coupon.discountType === "percentage" && coupon.maxDiscountAmount ? (
                        <span className="text-[10px] font-semibold text-slate-500">
                          Up to {formatCurrency(coupon.maxDiscountAmount)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Flat discount</span>
                      )}
                    </div>
                  </td>

                  {/* 3. Min Order Value */}
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {formatCurrency(coupon.minOrderValue ?? coupon.minCartValue ?? 0)}
                  </td>

                  {/* 4. Usage Progress */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 w-28">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-slate-800">
                          {coupon.usedCount || 0}
                        </span>
                        <span className="text-slate-400">
                          {hasLimit ? `/ ${coupon.usageLimit}` : "/ ∞"}
                        </span>
                      </div>
                      {hasLimit && (
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              usagePercent >= 90
                                ? "bg-red-500"
                                : usagePercent >= 70
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 5. Validity Window */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-slate-700 text-[11px] font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {formatDate(coupon.startDate)} — {formatDate(coupon.expiryDate || coupon.endDate)}
                        </span>
                      </div>
                      {expired ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200/60 px-1.5 py-0.5 rounded-md w-fit">
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>Expired</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-600">Valid</span>
                      )}
                    </div>
                  </td>

                  {/* 6. Live Status Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onToggleStatus(coupon._id, coupon.isActive)}
                      disabled={isOperating}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all border shadow-2xs cursor-pointer ${
                        coupon.isActive && !expired
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      } ${isOperating ? "opacity-50 cursor-not-allowed" : ""}`}
                      title={coupon.isActive ? "Click to deactivate" : "Click to activate"}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          coupon.isActive && !expired ? "bg-emerald-600" : "bg-slate-400"
                        }`}
                      />
                      <span>{coupon.isActive && !expired ? "Active" : coupon.isActive && expired ? "Expired" : "Inactive"}</span>
                    </button>
                  </td>

                  {/* 7. Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onEdit(coupon)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Edit coupon"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(coupon._id, coupon.isActive)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                        title={coupon.isActive ? "Deactivate" : "Activate"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(coupon._id, coupon.code)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
