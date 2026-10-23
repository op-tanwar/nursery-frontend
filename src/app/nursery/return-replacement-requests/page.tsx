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
  ShieldAlert,
  ShieldCheck,
  Package,
  Calendar,
  X,
  Loader2,
  Download,
  Info,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { returnReplacementService } from "@/services/returnReplacementService";
import {
  IReturnReplacementRequest,
  RequestStatus,
} from "@/types/returnReplacement.types";

export default function NurseryReturnReplacementPage() {
  const [requests, setRequests] = useState<IReturnReplacementRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Enlarged Photo Preview Lightbox
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await returnReplacementService.getNurseryRequests();
      if (res && res.requests) {
        setRequests(res.requests);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load nursery return records.");
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
      const productName = req.productName || "";
      const reason = req.reason || "";
      const orderId =
        req.orderId?._id ||
        (typeof req.orderId === "string" ? req.orderId : "");
      const reqId = req._id || "";

      return (
        productName.toLowerCase().includes(q) ||
        reason.toLowerCase().includes(q) ||
        String(orderId).toLowerCase().includes(q) ||
        String(reqId).toLowerCase().includes(q)
      );
    });
  }, [requests, activeTab, searchQuery]);

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "Approved":
        return {
          label: "Approved - Replacement Dispatched",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
        };
      case "Rejected":
        return {
          label: "Rejected by Botanical Review",
          className: "bg-rose-50 text-rose-700 border-rose-200",
          icon: XCircle,
        };
      case "Completed":
        return {
          label: "Claim Completed",
          className: "bg-blue-50 text-blue-700 border-blue-200",
          icon: Sparkles,
        };
      case "Pending":
      default:
        return {
          label: "Pending Review",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
        };
    }
  };

  // Export CSV Helper
  const handleExportCSV = () => {
    if (filteredRequests.length === 0) {
      toast.error("No claims to export.");
      return;
    }

    const headers = [
      "Request ID",
      "Order ID",
      "Date",
      "Product Name",
      "Request Type",
      "Reason",
      "Customer Description",
      "Status",
      "Admin Notes",
    ];

    const rows = filteredRequests.map((r) => [
      r._id,
      r.orderId?._id || r.orderId || "",
      new Date(r.createdAt).toISOString(),
      `"${(r.productName || "").replace(/"/g, '""')}"`,
      r.requestType,
      `"${(r.reason || "").replace(/"/g, '""')}"`,
      `"${(r.description || "").replace(/"/g, '""')}"`,
      r.status,
      `"${(r.adminNotes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `nursery-returns-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
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
                Customer Returns & Replacements
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Monitor claims and fulfillment statuses associated with your nursery's catalog.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-xs cursor-pointer"
            title="Export filtered records as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchRequests}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 🛡️ STRICT NOTICE BANNER */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs shadow-xs">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Policy & Access Notice</p>
          <p className="text-amber-800 leading-relaxed">
            Read-only access. Urban Nursery Admin evaluates and resolves customer claims in accordance with our Botanical Guarantee policy.
          </p>
        </div>
      </div>

      {/* 📊 Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
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
            placeholder="Search order, product, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* 📋 Table Card */}
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
                ? "No return or replacement claims match your filter criteria."
                : "Your nursery currently has zero active customer return or replacement claims."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Request Type</th>
                  <th className="py-3.5 px-4">Customer Issue & Proof</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4">Admin Notes / Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRequests.map((req) => {
                  const order = req.orderId;
                  const orderIdStr = order?._id
                    ? String(order._id)
                    : typeof order === "string"
                    ? order
                    : "N/A";

                  const badgeInfo = getStatusBadge(req.status);
                  const BadgeIcon = badgeInfo.icon;

                  return (
                    <tr
                      key={req._id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Order ID & Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-slate-900 block">
                            #{orderIdStr.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {new Date(req.createdAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            Claim #{String(req._id).slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </td>

                      {/* Product Details & Quantity */}
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
                            <p className="font-bold text-slate-900 truncate max-w-[180px]">
                              {req.productName}
                            </p>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/50 inline-block">
                              Botanical Guarantee
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Request Type */}
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

                      {/* Customer Issue & Photo Proof */}
                      <td className="py-4 px-4 min-w-[220px]">
                        <div className="space-y-1.5">
                          <div>
                            <span className="font-bold text-slate-900 text-[11px] block">
                              {req.reason}
                            </span>
                            {req.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 max-w-[220px]">
                                "{req.description}"
                              </p>
                            )}
                          </div>

                          {/* Photos */}
                          {req.proofImages && req.proofImages.length > 0 && (
                            <div className="flex items-center gap-1.5 pt-0.5">
                              {req.proofImages.map((img, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setPreviewImageUrl(img)}
                                  className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-500 hover:scale-105 transition cursor-pointer"
                                  title="Click to view photo"
                                >
                                  <img
                                    src={img}
                                    alt="Customer photo proof"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Current Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badgeInfo.className}`}
                        >
                          <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{badgeInfo.label}</span>
                        </span>
                      </td>

                      {/* Admin Notes / Instructions for Nursery */}
                      <td className="py-4 px-4 min-w-[200px]">
                        {req.adminNotes ? (
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 space-y-0.5">
                            <span className="font-bold text-slate-900 block">
                              Admin Instructions:
                            </span>
                            <p className="leading-relaxed">{req.adminNotes}</p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            No special instructions from admin.
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
