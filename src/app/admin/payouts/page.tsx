"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  IndianRupee,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ShieldCheck,
  RefreshCw,
  X,
  FileCheck,
  Ban,
  Eye,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { payoutService } from "@/services/payoutService";
import {
  IPayoutRecord,
  IGlobalFinancials,
  PayoutStatus,
} from "@/types/payout.types";

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<IPayoutRecord[]>([]);
  const [globalStats, setGlobalStats] = useState<IGlobalFinancials | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Action Modal State
  const [selectedPayout, setSelectedPayout] = useState<IPayoutRecord | null>(null);
  const [actionType, setActionType] = useState<"COMPLETE" | "REJECT" | "PROCESSING" | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch Data ─────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await payoutService.getAdminPayoutsList(statusFilter, undefined, currentPage, 15);
      if (res.success) {
        setPayouts(res.payouts || []);
        setGlobalStats(res.globalFinancials);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        (typeof err === "string" ? err : null) ||
        "Failed to load admin payout data";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handle Action Submission ───────────────────────────────────────
  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;

    if (actionType === "COMPLETE" && !utrNumber.trim()) {
      toast.error("UTR / Transaction Reference Number is strictly required.");
      return;
    }

    if (actionType === "REJECT" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason for the vendor.");
      return;
    }

    try {
      setIsSubmitting(true);
      const targetStatus: "PROCESSING" | "COMPLETED" | "REJECTED" =
        actionType === "COMPLETE"
          ? "COMPLETED"
          : actionType === "REJECT"
          ? "REJECTED"
          : "PROCESSING";

      const res = await payoutService.adminUpdatePayoutStatus(selectedPayout._id, {
        status: targetStatus,
        utrNumber: utrNumber.trim() || undefined,
        rejectionReason: rejectionReason.trim() || undefined,
        adminNote: adminNote.trim() || undefined,
      });

      if (res.success) {
        toast.success(res.message || "Payout status updated!");
        setSelectedPayout(null);
        setActionType(null);
        setUtrNumber("");
        setRejectionReason("");
        setAdminNote("");
        fetchData();
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        (typeof err === "string" ? err : null) ||
        "Failed to update payout status";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Filtered Search ────────────────────────────────────────────────
  const filteredPayouts = payouts.filter((p) => {
    const nurseryName =
      typeof p.nursery === "object" ? p.nursery?.name || "" : "";
    const businessName = p.nurseryBusinessName || "";
    const utr = p.utrNumber || "";
    const id = p._id || "";

    const q = searchQuery.toLowerCase();
    return (
      nurseryName.toLowerCase().includes(q) ||
      businessName.toLowerCase().includes(q) ||
      utr.toLowerCase().includes(q) ||
      id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-slate-50/50 min-h-screen">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-all"
            aria-label="Back to Admin Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight m-0">
              Vendor Payout Management
            </h1>
            <p className="text-slate-500 text-sm mt-1 m-0">
              Audit vendor balances, process weekly settlements, and maintain double-entry financial integrity.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={isLoading}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ── Error State Alert Banner ───────────────────────────────── */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div className="text-sm text-red-800">
              <span className="font-bold">Error loading admin payout data:</span> {errorMessage}
            </div>
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* ── Global Platform Financial Overview ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gross Platform GMV
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              ₹
              {globalStats
                ? globalStats.grossGMV.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                : "0.00"}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Excludes cancelled order items
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Platform Commission (Net)
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-600 tracking-tight">
              ₹
              {globalStats
                ? globalStats.platformCommission.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                : "0.00"}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Zero commission from cancelled orders
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Settled Vendor Payouts
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              ₹
              {globalStats
                ? globalStats.totalCompletedPayouts.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                : "0.00"}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Total disbursed to nurseries
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Disbursal Queue
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-amber-600 tracking-tight">
              ₹
              {globalStats
                ? globalStats.totalPendingPayouts.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                : "0.00"}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Awaiting admin settlement & UTR
            </p>
          </div>
        </div>
      </div>

      {/* ── Payout Requests Table ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Vendor, Business Name, Payout ID, or UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending (Action Required)</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Vendor / Nursery</th>
                <th className="py-3 px-4">Bank Snapshot</th>
                <th className="py-3 px-4">Requested Amount</th>
                <th className="py-3 px-4">Commission</th>
                <th className="py-3 px-4">Net Payable</th>
                <th className="py-3 px-4">Requested At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading vendor payout requests...
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-red-500">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
                    <p className="font-semibold text-slate-800">Failed to load admin payout data</p>
                    <p className="text-xs text-slate-500 mt-1">{errorMessage}</p>
                    <button
                      type="button"
                      onClick={fetchData}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  </td>
                </tr>
              ) : filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No payout records found.
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((p) => {
                  const vendor = typeof p.nursery === "object" ? p.nursery : null;
                  const bank = p.bankDetails;

                  const statusColors: Record<string, string> = {
                    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
                    PENDING: "bg-blue-50 text-blue-700 border-blue-200",
                    REJECTED: "bg-red-50 text-red-700 border-red-200",
                  };

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Vendor Column */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 m-0">
                          {p.nurseryBusinessName || vendor?.name || "Nursery"}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 m-0">
                          {vendor?.email || "ID: " + p._id.slice(-6)}
                        </p>
                      </td>

                      {/* Bank Snapshot Column */}
                      <td className="py-3.5 px-4 text-xs font-mono">
                        {bank?.accountNumber ? (
                          <div>
                            <p className="font-semibold text-slate-800 m-0">
                              {bank.bankName || "Bank"} — •••• {bank.accountNumber.slice(-4)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5 m-0">
                              IFSC: {bank.ifscCode} | {bank.accountHolderName}
                            </p>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-sans text-xs">Unspecified</span>
                        )}
                      </td>

                      {/* Requested Amount */}
                      <td className="py-3.5 px-4 font-black text-slate-900 text-base">
                        ₹{p.requestedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Commission Deducted */}
                      <td className="py-3.5 px-4 text-sm font-semibold text-rose-700">
                        {p.commissionDeducted != null && p.commissionDeducted > 0 ? (
                          <span>−₹{p.commissionDeducted.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        ) : p.snapshot?.totalCommission ? (
                          <span className="text-slate-400 text-xs">
                            −₹{p.snapshot.totalCommission.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Net Payable */}
                      <td className="py-3.5 px-4 text-sm font-bold text-emerald-700">
                        ₹{(p.netAmount ?? p.requestedAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Requested Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            statusColors[p.status] || "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {p.status}
                        </span>
                        {p.utrNumber && (
                          <p className="text-[10px] font-mono text-emerald-700 mt-1 m-0">
                            UTR: {p.utrNumber}
                          </p>
                        )}
                        {p.rejectionReason && (
                          <p className="text-[10px] text-red-600 mt-1 m-0">
                            Reason: {p.rejectionReason}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {p.status === "PENDING" || p.status === "PROCESSING" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPayout(p);
                                setActionType("COMPLETE");
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Settle & UTR</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPayout(p);
                                setActionType("REJECT");
                              }}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer border border-red-200"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">
                            Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Settlement / Rejection Action Modal ────────────────────── */}
      {selectedPayout && actionType && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 m-0 flex items-center gap-2">
                {actionType === "COMPLETE" ? (
                  <>
                    <FileCheck className="w-5 h-5 text-emerald-600" /> Settle Payout & Enter UTR
                  </>
                ) : (
                  <>
                    <Ban className="w-5 h-5 text-red-600" /> Reject Payout Request
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedPayout(null);
                  setActionType(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Vendor:</span>
                <span className="font-bold text-slate-900">{selectedPayout.nurseryBusinessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-black text-slate-900 text-sm">
                  ₹{selectedPayout.requestedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Account:</span>
                <span className="font-mono text-slate-700">
                  •••• {selectedPayout.bankDetails?.accountNumber?.slice(-4) || "N/A"}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitAction} className="space-y-4">
              {actionType === "COMPLETE" ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    UTR / Bank Transfer Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CMS12839182301 or IMPS0029318"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 m-0">
                    This reference number will be visible to the vendor in their payout ledger.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Rejection Reason *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Explain why this request is rejected (e.g. invalid bank IFSC, pending order dispute)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Internal Admin Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Optional internal remarks"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPayout(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 ${
                    actionType === "COMPLETE"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : actionType === "COMPLETE" ? (
                    "Confirm & Mark Settled"
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
