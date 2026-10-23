"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Mail,
  Users,
  UserCheck,
  UserX,
  Search,
  Download,
  Trash2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  X,
  CheckCircle2,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { newsletterService, Subscriber } from "@/services/newsletterService";

export default function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Aggregated Metrics
  const [totalCount, setTotalCount] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [unsubscribedCount, setUnsubscribedCount] = useState<number>(0);

  // Modal confirmation state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "delete" | "toggle";
    subscriber: Subscriber | null;
  }>({
    isOpen: false,
    type: "delete",
    subscriber: null,
  });

  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // 1. Fetch Subscribers
  const fetchSubscribers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await newsletterService.getSubscribers({
        page: currentPage,
        limit: pageSize,
        search: searchQuery.trim(),
        status: selectedStatus,
      });

      setSubscribers(res.subscribers || []);
      setTotalCount(res.totalSubscribers || 0);
      setActiveCount(res.activeSubscribers || 0);
      setUnsubscribedCount(res.unsubscribedSubscribers || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      console.error("Failed to load newsletter subscribers:", err);
      toast.error(err?.message || "Failed to load newsletter subscribers.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedStatus]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Handle Search Input with Enter / Debounce Reset
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSubscribers();
  };

  // 2. Export CSV
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await newsletterService.exportSubscribersCSV(searchQuery, selectedStatus);
      toast.success("Subscriber list exported to CSV successfully!");
    } catch (err: any) {
      console.error("CSV Export error:", err);
      toast.error(err?.message || "Failed to export subscriber CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  // 3. Confirm & Execute Action (Delete or Toggle)
  const confirmAction = async () => {
    if (!modalState.subscriber) return;
    setIsProcessingAction(true);

    try {
      if (modalState.type === "delete") {
        await newsletterService.deleteSubscriber(modalState.subscriber._id);
        toast.success(`Removed ${modalState.subscriber.email} from mailing list.`);
      } else {
        const nextStatus = modalState.subscriber.status === "active" ? "unsubscribed" : "active";
        await newsletterService.toggleSubscriberStatus(modalState.subscriber._id, nextStatus);
        toast.success(
          `Updated status for ${modalState.subscriber.email} to ${nextStatus}.`
        );
      }

      setModalState({ isOpen: false, type: "delete", subscriber: null });
      fetchSubscribers();
    } catch (err: any) {
      toast.error(err?.message || "Action failed to execute. Please try again.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <Mail className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Newsletter Subscribers
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your store&apos;s email audience, view subscription statuses, and export data for campaigns.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchSubscribers()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={isExporting || totalCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* METRIC STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Subscribers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Total Audience
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalCount}
            </span>
            <span className="text-xs text-slate-500">all recorded emails</span>
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
              Active Subscribers
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </span>
            <span className="text-xs text-slate-500">
              {totalCount > 0 ? `${Math.round((activeCount / totalCount) * 100)}% retention` : "0%"}
            </span>
          </div>
        </div>

        {/* Unsubscribed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
              Unsubscribed
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-300">
              {unsubscribedCount}
            </span>
            <span className="text-xs text-slate-500">opted-out recipients</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subscriber email..."
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-20 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            Find
          </button>
        </form>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "unsubscribed", label: "Unsubscribed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedStatus(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedStatus === tab.id
                  ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUBSCRIBERS TABLE */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Subscribed Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                      <span className="text-xs font-medium">Fetching subscribers catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
                        🌱
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        No subscribers found
                      </p>
                      <p className="text-xs text-slate-500 max-w-xs">
                        {searchQuery
                          ? `No results matching "${searchQuery}". Try a different email search term.`
                          : "Your newsletter audience will appear here as users subscribe on your storefront."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;
                  const isActive = subscriber.status === "active";
                  const dateStr = subscriber.subscribedAt
                    ? new Date(subscriber.subscribedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A";

                  return (
                    <tr
                      key={subscriber._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* # */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400">
                        {rowNumber}
                      </td>

                      {/* Email Address */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                            {subscriber.email.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-100 break-all">
                            {subscriber.email}
                          </span>
                        </div>
                      </td>

                      {/* Subscribed Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          {subscriber.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Toggle Status Button */}
                          <button
                            onClick={() =>
                              setModalState({
                                isOpen: true,
                                type: "toggle",
                                subscriber,
                              })
                            }
                            className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              isActive
                                ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            }`}
                            title={isActive ? "Mark as Unsubscribed" : "Re-activate Subscriber"}
                          >
                            {isActive ? (
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-slate-400" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() =>
                              setModalState({
                                isOpen: true,
                                type: "delete",
                                subscriber,
                              })
                            }
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Delete Subscriber Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!isLoading && totalCount > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of <span className="font-semibold text-slate-700 dark:text-slate-300">{totalCount}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-3 py-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {modalState.isOpen && modalState.subscriber && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    modalState.type === "delete"
                      ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600"
                      : "bg-amber-100 dark:bg-amber-950/60 text-amber-600"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {modalState.type === "delete" ? "Delete Subscriber" : "Toggle Subscription Status"}
                </h3>
              </div>
              <button
                onClick={() => setModalState({ isOpen: false, type: "delete", subscriber: null })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {modalState.type === "delete" ? (
                <>
                  Are you sure you want to permanently remove{" "}
                  <strong className="text-slate-900 dark:text-white">{modalState.subscriber.email}</strong> from your
                  newsletter database? This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to change{" "}
                  <strong className="text-slate-900 dark:text-white">{modalState.subscriber.email}</strong> status to{" "}
                  <strong className="text-emerald-600 uppercase">
                    {modalState.subscriber.status === "active" ? "unsubscribed" : "active"}
                  </strong>
                  ?
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalState({ isOpen: false, type: "delete", subscriber: null })}
                disabled={isProcessingAction}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAction}
                disabled={isProcessingAction}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer ${
                  modalState.type === "delete"
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {isProcessingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {modalState.type === "delete" ? "Yes, Delete" : "Confirm Status Change"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
