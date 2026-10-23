"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  RotateCcw,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Eye,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Layers,
  Building2,
  User,
  Phone,
  Mail,
  Package,
  Calendar,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { returnReplacementService } from "@/services/returnReplacementService";
import {
  IReturnReplacementRequest,
  RequestStatus,
  RequestType,
} from "@/types/returnReplacement.types";

export default function AdminReturnReplacementPage() {
  const [requests, setRequests] = useState<IReturnReplacementRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Action / Remarks Modal State
  const [selectedRequest, setSelectedRequest] = useState<IReturnReplacementRequest | null>(null);
  const [targetStatus, setTargetStatus] = useState<RequestStatus>("Approved");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState<boolean>(false);

  // Enlarged Photo Preview Lightbox
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await returnReplacementService.getAllAdminRequests();
      if (res && res.requests) {
        setRequests(res.requests);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load return/replacement requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // 🔄 Cross-Portal Live Status Synchronization (Refetch on window focus & every 15s)
    const handleFocus = () => {
      fetchRequests();
    };
    window.addEventListener("focus", handleFocus);

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchRequests();
      }
    }, 15000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Compute Metrics Bar Counts
  const metrics = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "Pending").length;
    const approved = requests.filter((r) => r.status === "Approved").length;
    const rejected = requests.filter((r) => r.status === "Rejected").length;
    const completed = requests.filter((r) => r.status === "Completed").length;
    return { total, pending, approved, rejected, completed };
  }, [requests]);

  // Filtered and Searched Requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Tab filter
      if (activeTab !== "All" && req.status !== activeTab) {
        return false;
      }

      // Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const customerName = req.userId?.name || "";
      const customerEmail = req.userId?.email || "";
      const productName = req.productName || "";
      const nurseryName =
        req.nurseryId?.businessName || req.nurseryId?.name || "";
      const orderId =
        req.orderId?._id ||
        (typeof req.orderId === "string" ? req.orderId : "");
      const reqId = req._id || "";

      return (
        customerName.toLowerCase().includes(q) ||
        customerEmail.toLowerCase().includes(q) ||
        productName.toLowerCase().includes(q) ||
        nurseryName.toLowerCase().includes(q) ||
        String(orderId).toLowerCase().includes(q) ||
        String(reqId).toLowerCase().includes(q)
      );
    });
  }, [requests, activeTab, searchQuery]);

  const openActionModal = (
    req: IReturnReplacementRequest,
    status: RequestStatus
  ) => {
    setSelectedRequest(req);
    setTargetStatus(status);
    setAdminNotes(req.adminNotes || "");
    setIsActionModalOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsUpdating(true);
    const toastId = toast.loading(`Updating status to ${targetStatus}...`);

    try {
      await returnReplacementService.updateAdminStatus(
        selectedRequest._id,
        targetStatus,
        adminNotes.trim()
      );

      toast.success(`Request status successfully changed to ${targetStatus}.`, {
        id: toastId,
      });

      // Update state in place
      setRequests((prev) =>
        prev.map((r) =>
          r._id === selectedRequest._id
            ? { ...r, status: targetStatus, adminNotes: adminNotes.trim() }
            : r
        )
      );

      setIsActionModalOpen(false);
      setSelectedRequest(null);
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to update status. Please try again.",
        { id: toastId }
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeClass = (status: RequestStatus) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Pending":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full antialiased text-slate-800 pb-16">
      {/* 🌿 Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Return & Replacement Management
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Review and evaluate customer claims within the 24-hour botanical guarantee window.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchRequests}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* 📊 Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Claims
          </span>
          <p className="text-2xl font-black text-slate-900">{metrics.total}</p>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/70 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
          <p className="text-2xl font-black text-amber-900">{metrics.pending}</p>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
          <p className="text-2xl font-black text-emerald-900">{metrics.approved}</p>
        </div>

        <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200/70 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
          <p className="text-2xl font-black text-rose-900">{metrics.rejected}</p>
        </div>

        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/70 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Completed
          </span>
          <p className="text-2xl font-black text-blue-900">{metrics.completed}</p>
        </div>
      </div>

      {/* 🔍 Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {["All", "Pending", "Approved", "Rejected", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer, item, nursery, order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* 📋 Requests Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs font-semibold">Loading claim records...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No Claims Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || activeTab !== "All"
                ? "No return or replacement claims match the selected status or query."
                : "No customer return or replacement claims have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Claim ID & Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Product & Nursery</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Proof Photo</th>
                  <th className="py-3.5 px-4">Reason & Note</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRequests.map((req) => {
                  const customer = req.userId;
                  const nursery = req.nurseryId;
                  const order = req.orderId;
                  const orderIdStr = order?._id
                    ? String(order._id)
                    : typeof order === "string"
                    ? order
                    : "N/A";

                  return (
                    <tr
                      key={req._id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Claim ID & Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-slate-900 block">
                            #{String(req._id).slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {new Date(req.createdAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <Link
                            href={`/admin/orders/${orderIdStr}`}
                            target="_blank"
                            className="text-[10px] text-emerald-600 hover:underline font-semibold inline-flex items-center gap-0.5 pt-0.5"
                          >
                            <span>Order #{orderIdStr.slice(-6)}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4 min-w-[160px]">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">
                            {customer?.name || "Customer"}
                          </p>
                          {customer?.email && (
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[140px]">
                                {customer.email}
                              </span>
                            </p>
                          )}
                          {customer?.phone && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{customer.phone}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Product & Nursery */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {req.productImage ? (
                              <Image
                                src={req.productImage}
                                alt={req.productName}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400 m-auto" />
                            )}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-[160px]">
                              {req.productName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate font-semibold text-emerald-800">
                                {nursery?.businessName ||
                                  nursery?.name ||
                                  "Urban Nursery"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            req.requestType === "Replacement"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {req.requestType === "Replacement" ? (
                            <RefreshCw className="w-3 h-3" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          <span>{req.requestType}</span>
                        </span>
                      </td>

                      {/* Photo Proof Thumbnails */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          {req.proofImages && req.proofImages.length > 0 ? (
                            req.proofImages.slice(0, 2).map((img, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setPreviewImageUrl(img)}
                                className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-500 hover:scale-105 transition cursor-pointer"
                                title="Click to view full photo"
                              >
                                <img
                                  src={img}
                                  alt="Proof thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              No photo
                            </span>
                          )}
                          {req.proofImages && req.proofImages.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setPreviewImageUrl(req.proofImages[0])}
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center hover:bg-slate-200 transition"
                            >
                              +{req.proofImages.length - 2}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Reason & Note */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800 text-[11px] block">
                            {req.reason}
                          </span>
                          {req.description ? (
                            <p className="text-[11px] text-slate-500 line-clamp-2 max-w-[220px]">
                              "{req.description}"
                            </p>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              No customer note
                            </span>
                          )}
                          {req.adminNotes && (
                            <p className="text-[10px] text-emerald-800 bg-emerald-50/80 p-1 rounded border border-emerald-200/50 line-clamp-1">
                              <strong>Admin:</strong> {req.adminNotes}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(
                            req.status
                          )}`}
                        >
                          {req.status === "Approved" && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          )}
                          {req.status === "Rejected" && (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          )}
                          {req.status === "Pending" && (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          {req.status === "Completed" && (
                            <Sparkles className="w-3 h-3 text-blue-600" />
                          )}
                          <span>{req.status}</span>
                        </span>
                      </td>

                      {/* Action Menu Buttons */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {req.status !== "Approved" && (
                            <button
                              type="button"
                              onClick={() => openActionModal(req, "Approved")}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                              title="Approve replacement or refund"
                            >
                              Approve
                            </button>
                          )}

                          {req.status !== "Rejected" && (
                            <button
                              type="button"
                              onClick={() => openActionModal(req, "Rejected")}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                              title="Reject claim"
                            >
                              Reject
                            </button>
                          )}

                          {req.status === "Approved" && (
                            <button
                              type="button"
                              onClick={() => openActionModal(req, "Completed")}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                              title="Mark as completed/dispatched"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📝 Action & Remarks Modal */}
      {isActionModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsActionModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-6 text-white relative">
              <button
                type="button"
                onClick={() => setIsActionModalOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold">Update Claim Status</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Target Status:{" "}
                <span className="font-bold text-white uppercase">{targetStatus}</span>
              </p>
            </div>

            <form onSubmit={handleStatusSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1 text-xs">
                <p className="font-bold text-slate-800">
                  {selectedRequest.productName} ({selectedRequest.requestType})
                </p>
                <p className="text-slate-500">
                  Reason:{" "}
                  <span className="font-semibold text-slate-700">
                    {selectedRequest.reason}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Admin Remarks / Resolution Instructions
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter remarks for the customer and nursery partner (e.g. Free replacement dispatched via Bluedart, or Refund processed to wallet)..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsActionModalOpen(false)}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                    targetStatus === "Approved"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : targetStatus === "Rejected"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Confirm {targetStatus}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🖼️ Photo Lightbox Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative max-w-2xl max-h-[90vh] bg-transparent flex flex-col items-center">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-slate-300 transition cursor-pointer"
              aria-label="Close Preview"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImageUrl}
              alt="Customer photo proof enlarged"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
