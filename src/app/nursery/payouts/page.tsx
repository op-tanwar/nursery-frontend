"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  IndianRupee,
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ArrowDownLeft,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  PlusCircle,
  X,
  History,
  FileText,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppSelector } from "@/redux/hooks";
import { payoutService } from "@/services/payoutService";
import {
  INurseryPayoutSummary,
  IPayoutRecord,
  ILedgerEntry,
} from "@/types/payout.types";

export default function NurseryPayoutsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { myProfile } = useAppSelector((state) => state.nurseryProfile);

  // ── State ──────────────────────────────────────────────────────────
  const [summary, setSummary] = useState<INurseryPayoutSummary | null>(null);
  const [payouts, setPayouts] = useState<IPayoutRecord[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<ILedgerEntry[]>([]);
  const [reversalSummary, setReversalSummary] = useState<{
    totalCommissionReversed: number;
    cancellationCount: number;
  }>({ totalCommissionReversed: 0, cancellationCount: 0 });

  const [activeTab, setActiveTab] = useState<"payouts" | "ledger">("payouts");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Data Fetching ──────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const [sumRes, histRes, breakRes] = await Promise.all([
        payoutService.getNurseryPayoutSummary(),
        payoutService.getNurseryPayoutHistory(statusFilter),
        payoutService.getNurseryCommissionBreakdown(1, 30),
      ]);

      if (sumRes.success) setSummary(sumRes.summary);
      if (histRes.success) setPayouts(histRes.payouts || []);
      if (breakRes.success) {
        setLedgerEntries(breakRes.ledgerEntries || []);
        setReversalSummary(breakRes.reversalSummary);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        (typeof err === "string" ? err : null) ||
        "Failed to load financial records";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handle Payout Request ──────────────────────────────────────────
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(requestAmount);

    if (!amount || isNaN(amount) || amount < 500) {
      toast.error("Minimum withdrawal amount is ₹500");
      return;
    }

    if (summary && amount > summary.availableBalance) {
      toast.error(`Amount cannot exceed available balance (₹${summary.availableBalance.toLocaleString("en-IN")})`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await payoutService.requestPayout(amount);
      if (res.success) {
        toast.success(res.message || "Payout requested successfully!");
        setIsModalOpen(false);
        setRequestAmount("");
        fetchData();
      }
    } catch (err: any) {
      const msg = err?.message || err?.response?.data?.message || (typeof err === "string" ? err : null) || "Payout request failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Filtered Payouts ───────────────────────────────────────────────
  const filteredPayouts = payouts.filter((p) => {
    const matchesSearch =
      p._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.utrNumber && p.utrNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Export CSV
  const handleExportCSV = () => {
    if (payouts.length === 0) {
      toast.error("No payout records available to export");
      return;
    }
    const headers = "Payout ID,Date,Amount,Status,UTR / Reference,Rejection Reason\n";
    const rows = payouts
      .map(
        (p) =>
          `"${p._id}","${new Date(p.createdAt).toLocaleDateString()}","${p.requestedAmount}","${p.status}","${p.utrNumber || "N/A"}","${p.rejectionReason || "None"}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payout-statements-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Payout statement exported!");
  };

  const bank = summary?.bankDetails || myProfile?.bankDetails;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-slate-50/50 min-h-screen">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all">
        <div className="flex items-center gap-4">
          <Link
            href="/nursery"
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer hover:shadow-sm"
            aria-label="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight m-0">
              Payouts & Financial Ledger
            </h1>
            <p className="text-slate-500 text-sm mt-1 m-0">
              Real-time available balance, settlement history, and transparent commission audit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            disabled={isLoading}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (summary && summary.availableBalance > 0) {
                setRequestAmount(summary.availableBalance.toString());
              }
              setIsModalOpen(true);
            }}
            disabled={!summary || summary.availableBalance < 100 || summary.pendingPayouts > 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Payout</span>
          </button>
        </div>
      </div>

      {/* ── Error State Alert Banner ───────────────────────────────── */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div className="text-sm text-red-800">
              <span className="font-bold">Error loading payout data:</span> {errorMessage}
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

      {/* ── Post-Payout Cancellation Negative Balance Alert ───────── */}
      {summary?.hasNegativeBalance && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <span className="font-bold">Negative Balance Deficit Notice:</span> Your account balance is{" "}
            <span className="font-bold text-red-600">
              -₹{Math.abs(summary.availableBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            . This occurs when orders are cancelled or refunded after a previous payout was completed. Future fulfilled
            sales will automatically offset this balance until it returns positive.
          </div>
        </div>
      )}

      {/* ── Metrics Summary Cards (100% Authoritative Live Data) ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Available Balance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Available For Payout
            </span>
            <div
              className={`p-2.5 rounded-xl ${
                summary?.hasNegativeBalance
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p
              className={`text-3xl font-black tracking-tight ${
                summary?.hasNegativeBalance ? "text-red-600" : "text-slate-900"
              }`}
            >
              ₹
              {summary
                ? summary.availableBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                : "0.00"}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1.5 flex items-center gap-1">
              Net sales minus settled & processing payouts
            </p>
          </div>
        </div>

        {/* Card 2: Total Paid Out */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Settled (Paid Out)
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              ₹
              {summary
                ? summary.totalPaidOut.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                : "0.00"}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1.5">
              Completed bank transfers to date
            </p>
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending / Processing
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-amber-600 tracking-tight">
              ₹
              {summary
                ? summary.pendingPayouts.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                : "0.00"}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {summary?.nextSettlementLabel || "Every Monday"}
            </p>
          </div>
        </div>

        {/* Card 4: Platform Commission (Active Sales Only) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Platform Commission (Net)
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              ₹
              {summary
                ? summary.totalCommission.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                : "0.00"}
            </p>
            <p className="text-xs font-medium text-emerald-600 mt-1.5 flex items-center gap-1">
              ₹{reversalSummary.totalCommissionReversed.toLocaleString("en-IN")} reversed on cancellations
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Bank Info Card & Dynamic Ledger ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Column: Bank Account Card & Policy Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 m-0">
                <Building2 className="w-4 h-4 text-emerald-600" /> Receiving Bank Account
              </h2>
              <Link
                href="/nursery/my-nursery"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors"
              >
                Settings
              </Link>
            </div>

            {/* Bank Card Graphic */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white rounded-2xl p-6 shadow-lg relative overflow-hidden space-y-6">
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs font-semibold tracking-widest text-slate-300 uppercase">
                  {bank?.bankName || "Bank Account"}
                </span>
                <CreditCard className="w-6 h-6 text-emerald-400 opacity-90" />
              </div>

              <div className="relative z-10">
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1">
                  Account Number
                </p>
                <p className="text-lg font-mono tracking-[0.15em] font-medium text-white">
                  {bank?.accountNumber
                    ? `•••• •••• ${bank.accountNumber.slice(-4)}`
                    : "Not Configured"}
                </p>
              </div>

              <div className="flex items-center justify-between relative z-10 border-t border-white/10 pt-4 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Account Holder</p>
                  <p className="font-semibold text-slate-200 capitalize">
                    {bank?.accountHolderName || user?.name || "Nursery Owner"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">IFSC Code</p>
                  <p className="font-semibold font-mono text-slate-200">
                    {bank?.ifscCode || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Payouts are transferred via IMPS/NEFT directly to this verified account. All settlements undergo automated reconciliation.
              </span>
            </div>
          </div>

          {/* Transparent Commission Schedule */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 m-0">
              Category Commission Rates
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Live Plants</span>
                <span className="font-bold text-slate-900">30%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Planters & Pots</span>
                <span className="font-bold text-slate-900">25%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Tools, Seeds & Accessories</span>
                <span className="font-bold text-slate-900">20%</span>
              </div>
              <div className="flex justify-between py-2 text-emerald-600 font-semibold">
                <span>Cancelled Orders</span>
                <span>0% (100% Reversed)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Tables (Payouts vs Commission Breakdown) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-slate-200 px-6 pt-4 flex items-center justify-between gap-4">
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("payouts")}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === "payouts"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <History className="w-4 h-4" />
                <span>Payout Requests</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-semibold">
                  {payouts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ledger")}
                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === "ledger"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Commission & Reversal Audit</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-semibold">
                  {reversalSummary.cancellationCount} Reversed
                </span>
              </button>
            </div>
          </div>

          {/* Tab 1: Payout Requests */}
          {activeTab === "payouts" && (
            <div>
              {/* Search & Filter Bar */}
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by ID or UTR / Bank Reference..."
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
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Payout ID / Date</th>
                      <th className="py-3 px-4">Requested Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">UTR / Bank Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                          Loading payout records...
                        </td>
                      </tr>
                    ) : errorMessage ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-red-500">
                          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
                          <p className="font-semibold text-slate-800">Failed to load payout records</p>
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
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No payout requests found matching your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredPayouts.map((p) => {
                        const statusColors: Record<string, string> = {
                          COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                          PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
                          PENDING: "bg-blue-50 text-blue-700 border-blue-200",
                          REJECTED: "bg-red-50 text-red-700 border-red-200",
                        };

                        return (
                          <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-mono text-xs font-semibold text-slate-900">
                                #{p._id.slice(-8).toUpperCase()}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {new Date(p.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              ₹{p.requestedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  statusColors[p.status] || "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-xs font-mono">
                              {p.utrNumber ? (
                                <span className="text-emerald-700 font-semibold">{p.utrNumber}</span>
                              ) : p.rejectionReason ? (
                                <span className="text-red-600 font-sans text-[11px]">{p.rejectionReason}</span>
                              ) : (
                                <span className="text-slate-400 font-sans italic">In verification</span>
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
          )}

          {/* Tab 2: Commission & Reversal Audit Trail */}
          {activeTab === "ledger" && (
            <div>
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Transparent Double-Entry Bookkeeping: Every sale commission charge and every cancellation reversal is permanently logged.
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Total Reversed: ₹{reversalSummary.totalCommissionReversed.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Transaction Type</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledgerEntries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No audit ledger entries recorded yet.
                        </td>
                      </tr>
                    ) : (
                      ledgerEntries.map((l) => {
                        const isReversal = l.entryType === "COMMISSION_REVERSED";
                        const isCharge = l.entryType === "COMMISSION_CHARGED";

                        return (
                          <tr key={l._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 text-xs text-slate-500">
                              {new Date(l.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  isReversal
                                    ? "bg-emerald-100 text-emerald-800"
                                    : isCharge
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {l.entryType.replace(/_/g, " ")}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-xs text-slate-700 max-w-xs truncate">
                              {l.description}
                            </td>

                            <td
                              className={`py-3.5 px-4 text-right font-bold text-sm ${
                                isReversal
                                  ? "text-emerald-600"
                                  : isCharge
                                  ? "text-amber-600"
                                  : "text-slate-900"
                              }`}
                            >
                              {l.direction === "CREDIT" ? "+" : "-"}₹
                              {l.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Payout Request Modal ────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 m-0 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" /> Request Payout
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Available Balance
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Max Withdrawable</span>
                  <span className="font-bold text-slate-900 text-base">
                    ₹
                    {summary
                      ? summary.availableBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                      : "0.00"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Withdrawal Amount (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="100"
                    max={summary?.availableBalance || 0}
                    step="0.01"
                    required
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    placeholder="Enter amount (min ₹100)"
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Receiving Account Confirmation */}
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5 m-0">
                  <Building2 className="w-4 h-4 text-emerald-600" /> Receiving Account Snapshot:
                </p>
                <p className="text-[11px] text-emerald-700 m-0">
                  {bank?.bankName || "Bank"} — A/C: •••• {bank?.accountNumber?.slice(-4) || "N/A"} (IFSC: {bank?.ifscCode || "N/A"})
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Confirm Payout Request"
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