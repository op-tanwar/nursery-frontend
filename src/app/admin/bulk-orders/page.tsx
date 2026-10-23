"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Building2,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Hash,
  AlertCircle,
  Save,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";
import { bulkOrderService } from "@/services/bulkOrderService";
import {
  BulkOrderInquiry,
  BulkOrderStatus,
  BulkOrderProductType,
} from "@/types/bulkOrder.types";

const STATUS_CONFIG: Record<
  BulkOrderStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  "In Discussion": {
    label: "In Discussion",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  Quoted: {
    label: "Quoted",
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  Fulfilled: {
    label: "Fulfilled",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  Cancelled: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

const ALL_STATUSES: BulkOrderStatus[] = [
  "Pending",
  "In Discussion",
  "Quoted",
  "Fulfilled",
  "Cancelled",
];

export default function AdminBulkOrdersPage() {
  const [inquiries, setInquiries] = useState<BulkOrderInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Metrics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inDiscussion: 0,
    quoted: 0,
    fulfilled: 0,
    cancelled: 0,
  });

  // Modal State for Viewing & Editing Notes
  const [selectedInquiry, setSelectedInquiry] =
    useState<BulkOrderInquiry | null>(null);
  const [modalAdminNotes, setModalAdminNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Delete Confirmation Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status updating inline spinner
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 1. Fetch Inquiries
  const fetchInquiries = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await bulkOrderService.getBulkOrders({
        page: currentPage,
        limit: pageSize,
        search: searchQuery.trim(),
        status: selectedStatus,
        productType: selectedCategory,
      });

      setInquiries(res.bulkOrders || []);
      setTotalCount(res.totalBulkOrders || 0);
      setTotalPages(res.totalPages || 1);

      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      console.error("Failed to fetch bulk orders:", err);
      toast.error(err?.message || "Failed to load bulk order inquiries.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedStatus, selectedCategory]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Handle Search Input submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInquiries();
  };

  // 2. Status Change Action (Inline & Instant)
  const handleStatusChange = async (
    id: string,
    newStatus: BulkOrderStatus
  ) => {
    try {
      setUpdatingId(id);
      await bulkOrderService.updateBulkOrderStatus(id, newStatus);
      toast.success(`Inquiry status updated to ${newStatus}`);

      // Optimistic local state update
      setInquiries((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: newStatus } : item
        )
      );

      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      // Re-fetch counts
      fetchInquiries();
    } catch (err: any) {
      console.error("Failed to update status:", err);
      toast.error(err?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. Save Admin Notes
  const handleSaveAdminNotes = async () => {
    if (!selectedInquiry) return;
    try {
      setIsSavingNotes(true);
      await bulkOrderService.updateBulkOrderStatus(
        selectedInquiry._id,
        selectedInquiry.status,
        modalAdminNotes
      );
      toast.success("Admin notes saved successfully.");

      setInquiries((prev) =>
        prev.map((item) =>
          item._id === selectedInquiry._id
            ? { ...item, adminNotes: modalAdminNotes }
            : item
        )
      );
      setSelectedInquiry((prev) =>
        prev ? { ...prev, adminNotes: modalAdminNotes } : null
      );
    } catch (err: any) {
      console.error("Failed to save admin notes:", err);
      toast.error(err?.message || "Failed to save admin notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  // 4. Delete Inquiry
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await bulkOrderService.deleteBulkOrder(deleteId);
      toast.success("Bulk order inquiry deleted.");
      setDeleteId(null);
      if (selectedInquiry?._id === deleteId) {
        setSelectedInquiry(null);
      }
      fetchInquiries();
    } catch (err: any) {
      console.error("Failed to delete inquiry:", err);
      toast.error(err?.message || "Failed to delete inquiry.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Details Modal
  const openDetailsModal = (inquiry: BulkOrderInquiry) => {
    setSelectedInquiry(inquiry);
    setModalAdminNotes(inquiry.adminNotes || "");
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Building2 className="w-4 h-4" /> B2B Commercial Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Bulk Orders &amp; Corporate Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Review commercial customer leads, update quote pipelines, and manage fulfillment status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchInquiries()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          Refresh Leads
        </button>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Total Leads</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-2xs">
          <p className="text-xs font-bold text-amber-700">Pending</p>
          <p className="text-2xl font-black text-amber-900 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 shadow-2xs">
          <p className="text-xs font-bold text-blue-700">In Discussion</p>
          <p className="text-2xl font-black text-blue-900 mt-1">{stats.inDiscussion}</p>
        </div>
        <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 shadow-2xs">
          <p className="text-xs font-bold text-purple-700">Quoted</p>
          <p className="text-2xl font-black text-purple-900 mt-1">{stats.quoted}</p>
        </div>
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
          <p className="text-xs font-bold text-emerald-700">Fulfilled</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">{stats.fulfilled}</p>
        </div>
        <div className="bg-red-50/70 p-4 rounded-2xl border border-red-200 shadow-2xs">
          <p className="text-xs font-bold text-red-700">Cancelled</p>
          <p className="text-2xl font-black text-red-900 mt-1">{stats.cancelled}</p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, city, or email..."
            className="w-full h-10 pl-10 pr-4 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
          />
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer capitalize"
          >
            <option value="all">All Categories</option>
            <option value="plants">Plants</option>
            <option value="pots">Pots</option>
            <option value="accessories">Accessories</option>
            <option value="fertilizers">Fertilizers</option>
            <option value="services">Services</option>
            <option value="mixed">Mixed Package</option>
          </select>
        </div>
      </div>

      {/* ── Main Data Table View ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Date &amp; ID</th>
                <th className="py-3.5 px-4">Customer Name &amp; Contact</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Category &amp; Qty</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
                    Loading bulk order inquiries...
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No bulk order inquiries found matching your filters.
                  </td>
                </tr>
              ) : (
                inquiries.map((order) => {
                  const statusMeta = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                  const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Date & ID */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-mono text-[11px] text-slate-500 font-bold block">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5 font-medium">
                          <Calendar className="w-3 h-3" /> {dateStr}
                        </span>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="font-bold text-slate-900 text-sm m-0">
                          {order.fullName}
                        </p>
                        <p className="text-slate-600 text-xs flex items-center gap-1.5 mt-0.5 font-medium">
                          <Phone className="w-3 h-3 text-slate-400" /> {order.phoneNumber}
                        </p>
                        {order.email && (
                          <p className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" /> {order.email}
                          </p>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {order.city}, {order.state}
                        </span>
                      </td>

                      {/* Category & Quantity */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold capitalize border border-emerald-200/60 mb-1">
                          {order.productType}
                        </span>
                        <p className="text-slate-700 font-bold text-xs m-0">
                          {order.estimatedQuantity.toLocaleString()} units
                        </p>
                      </td>

                      {/* Status Dropdown Selector */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            disabled={updatingId === order._id}
                            onChange={(e) =>
                              handleStatusChange(
                                order._id,
                                e.target.value as BulkOrderStatus
                              )
                            }
                            className={`h-8 pl-6 pr-6 rounded-lg text-xs font-bold border transition-all cursor-pointer focus:outline-none appearance-none ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                          >
                            {ALL_STATUSES.map((st) => (
                              <option key={st} value={st} className="bg-white text-slate-900">
                                {st}
                              </option>
                            ))}
                          </select>
                          <span
                            className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${statusMeta.dot}`}
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDetailsModal(order)}
                            title="View Requirements & Notes"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(order._id)}
                            title="Delete Inquiry"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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

        {/* ── Pagination Controls ── */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Showing {inquiries.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} inquiries
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── View Details & Admin Notes Modal ── */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Inquiry #{selectedInquiry._id.slice(-6).toUpperCase()}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {selectedInquiry.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Contact Phone</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> {selectedInquiry.phoneNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Email Address</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" /> {selectedInquiry.email || "Not Provided"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Location</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {selectedInquiry.city}, {selectedInquiry.state}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Estimated Demand</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-emerald-600" /> {selectedInquiry.estimatedQuantity.toLocaleString()} units ({selectedInquiry.productType})
                </span>
              </div>
            </div>

            {/* Customer Message / Requirements */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                Customer Requirement Message
              </label>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                {selectedInquiry.message || "No custom message provided by client."}
              </div>
            </div>

            {/* Admin Notes Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Internal Admin Notes &amp; Follow-up Log</span>
                <span className="text-[11px] text-slate-400 font-normal">Visible only to admins</span>
              </label>
              <textarea
                rows={3}
                value={modalAdminNotes}
                onChange={(e) => setModalAdminNotes(e.target.value)}
                placeholder="Log call updates, quoted pricing tiers, logistics vendor assigned, or partner nursery details..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600">Status:</label>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) =>
                    handleStatusChange(
                      selectedInquiry._id,
                      e.target.value as BulkOrderStatus
                    )
                  }
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 cursor-pointer"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleSaveAdminNotes}
                disabled={isSavingNotes}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
              >
                {isSavingNotes ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Notes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Delete Inquiry Record?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this inquiry? This action cannot be reversed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
