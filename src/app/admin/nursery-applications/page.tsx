"use client";

import React, { useEffect, useState } from "react";
import DataTable, { ColumnConfig } from "@/components/dashboard-common/DataTable";
import { nurseryProfileService } from "@/services/nurseryProfileService";
import { adminService } from "@/services/adminService";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setNurseryLoading,
  setNurseryError,
  setAdminApplicationsData,
  reviewApplicationSuccess,
  clearNurseryMutationFlags
} from "@/redux/slices/nurseryProfileSlice";
import Link from "next/link";
import {
  Building2,
  ShieldAlert,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Check,
  Eye,
  FileText,
  Loader,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { TApprovalStatus, INurseryProfile } from "@/types/index";

export default function AdminNurseryApplicationsPage() {
  const dispatch = useAppDispatch();

  // Redux Slice Selectors
  const { adminApplications, isLoading, mutationSuccess, actionMessage, error } = useAppSelector(
    (state) => state.nurseryProfile
  );

  // Component States
  const [activeTab, setActiveTab] = useState<TApprovalStatus>("Pending");
  const [selectedApp, setSelectedApp] = useState<INurseryProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // 1. Fetch Applications Core Sync
  const fetchApplicationsData = async () => {
    dispatch(setNurseryLoading(true));
    try {
      const res = await nurseryProfileService.getAllNurseryApplications(activeTab);
      if (res.success) {
        dispatch(setAdminApplicationsData({ applications: res.applications, count: res.count }));
      }
    } catch (err: any) {
      dispatch(setNurseryError(err?.response?.data?.message || err?.message || "Failed to sync system applications metrics."));
    }
  };

  useEffect(() => {
    fetchApplicationsData();
  }, [activeTab]);

  // 2. Core Toast Notification Management
  useEffect(() => {
    if (mutationSuccess) {
      toast.success(actionMessage || "Action performed successfully");
      dispatch(clearNurseryMutationFlags());
      fetchApplicationsData();
    }
    if (error) {
      toast.error(error);
      dispatch(clearNurseryMutationFlags());
    }
  }, [mutationSuccess, error]);

  // 3. Application Approval Workflow
  const handleApprove = async (id: string) => {
    if (!window.confirm("Are you sure you want to approve this nursery onboarding profile?")) return;

    try {
      dispatch(setNurseryLoading(true));
      const res = await nurseryProfileService.reviewNurseryApplication(id, { status: "Approved" });
      if (res.success) {
        dispatch(reviewApplicationSuccess({ id, status: "Approved", message: res.message }));
      }
    } catch (err: any) {
      dispatch(setNurseryError(err?.response?.data?.message || "Approval action failed."));
    }
  };

  // 4. Open Rejection Modal
  const openRejectModal = (app: INurseryProfile) => {
    setSelectedApp(app);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  // 5. Submit Rejection Core Handler
  const handleRejectSubmit = async () => {
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      return toast.error("Please provide a concise rejection reason.");
    }

    try {
      dispatch(setNurseryLoading(true));
      setIsRejectModalOpen(false);
      const res = await nurseryProfileService.reviewNurseryApplication(selectedApp._id, {
        status: "Rejected",
        rejectionReason: rejectionReason.trim()
      });
      if (res.success) {
        dispatch(reviewApplicationSuccess({ id: selectedApp._id, status: "Rejected", message: res.message }));
      }
    } catch (err: any) {
      dispatch(setNurseryError(err?.response?.data?.message || "Rejection action failed."));
    }
  };

  // 6. Active/Inactive Status Toggle Trigger
  const handleToggleStatus = async (app: INurseryProfile) => {
    const targetId = app._id;
    const currentStatus = typeof app.isActive === "boolean" ? app.isActive : true;
    const nextStatus = !currentStatus;
    const actionText = nextStatus ? "ACTIVATE" : "SUSPEND";

    if (!window.confirm(`Are you absolutely sure you want to ${actionText} nursery "${app.businessName}"?`)) return;

    try {
      setTogglingId(targetId);
      const res = await adminService.toggleNurseryStatus(targetId, { isActive: nextStatus });
      if (res.success) {
        toast.success(`Nursery status successfully updated to ${nextStatus ? "Active" : "Suspended"}.`);
        fetchApplicationsData();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to alter status.");
    } finally {
      setTogglingId(null);
    }
  };

  const openDetailsModal = (app: INurseryProfile) => {
    setSelectedApp(app);
    setIsDetailsModalOpen(true);
  };

  // DataTable Column Matrix Configuration
  const columns: ColumnConfig<INurseryProfile>[] = [
    {
      header: "Unique Application ID",
      accessorKey: "_id",
      className: "font-mono text-[11px] text-slate-400 font-semibold tracking-tight",
    },
    {
      header: "Business Information",
      accessorKey: "businessName",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-900 text-xs">{row.businessName}</span>
          <span className="text-slate-400 text-[11px] font-medium select-all">
            {row.businessEmail} | <span className="font-mono">{row.businessPhone}</span>
          </span>
        </div>
      ),
    },
    {
      header: "Owner Node Reference",
      accessorKey: "nursery",
      cell: (row) => (
        <span className="font-bold text-slate-800 text-xs">
          {row.nursery && typeof row.nursery === "object" ? (row.nursery as any).name : "N/A"}
        </span>
      ),
    },
    {
      header: "Logistics Matrix",
      accessorKey: "businessAddress",
      cell: (row) => (
        <span className="font-semibold text-slate-600 text-xs">
          {row.businessAddress?.city || "N/A"}, {row.businessAddress?.state || "N/A"}
        </span>
      ),
    },
    {
      header: "Onboarding Stage",
      accessorKey: "approvalStatus",
      className: "text-center",
      cell: (row) => {
        const isCurrentlyActive = typeof row.isActive === "boolean" ? row.isActive : true;
        const statusStyles = {
          Approved: "text-emerald-700 bg-emerald-50 border-emerald-100",
          Rejected: "text-rose-700 bg-rose-50 border-rose-100",
          Pending: "text-amber-700 bg-amber-50 border-amber-100",
        };

        return (
          <div className="flex flex-col items-center justify-center gap-1">
            <span className={`inline-flex items-center font-black uppercase tracking-wider text-[9px] px-2.5 py-0.5 rounded-md border ${statusStyles[row.approvalStatus] || statusStyles.Pending}`}>
              {row.approvalStatus}
            </span>
            {row.approvalStatus === "Approved" && (
              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wide ${isCurrentlyActive ? "bg-green-50 border-green-100 text-green-600" : "bg-red-50 border-red-100 text-red-600"
                }`}>
                {isCurrentlyActive ? "Active Link" : "Suspended"}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Administrative Pipeline",
      accessorKey: "_id",
      className: "text-center",
      cell: (row) => {
        const isCurrentlyActive = typeof row.isActive === "boolean" ? row.isActive : true;
        const isThisToggling = togglingId === row._id;

        return (
          <div className="flex items-center justify-center gap-1.5">
            {/* Dedicated Admin Vendor Detail Page Link */}
            <Link
              href={`/admin/nurseries/${row._id}`}
              title="Open Full Vendor Detail Page"
              className="p-1.5 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/60 rounded-lg bg-white text-slate-500 hover:text-emerald-700 cursor-pointer transition-all flex items-center justify-center"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Document Inspection Sheet Switch */}
            <button
              type="button"
              title="Inspect Quick Modal Sheet"
              onClick={() => openDetailsModal(row)}
              className="p-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg bg-white text-slate-400 hover:text-slate-700 cursor-pointer transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Actions for Pending Applications */}
            {row.approvalStatus === "Pending" && (
              <>
                <button
                  type="button"
                  title="Reject Profile Verification"
                  onClick={() => openRejectModal(row)}
                  className="px-2.5 py-1.5 text-[11px] font-bold text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-all cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  title="Approve Profile and Deploy Account"
                  onClick={() => handleApprove(row._id)}
                  className="px-2.5 py-1.5 text-[11px] font-bold text-white bg-green-700 hover:bg-green-800 border border-transparent rounded-lg transition-all cursor-pointer"
                >
                  Approve
                </button>
              </>
            )}

            {/* Actions for Approved Applications */}
            {row.approvalStatus === "Approved" && (
              <button
                type="button"
                disabled={isThisToggling}
                title={isCurrentlyActive ? "Suspend Operations Access" : "Restore Operations Access"}
                onClick={() => handleToggleStatus(row)}
                className={`p-1.5 border rounded-lg bg-white cursor-pointer transition-all flex items-center justify-center disabled:opacity-40 ${isCurrentlyActive
                  ? "border-slate-200 hover:border-amber-200 hover:bg-amber-50/40 text-amber-600"
                  : "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40 text-emerald-600"
                  }`}
              >
                {isThisToggling ? (
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                ) : isCurrentlyActive ? (
                  <Ban className="w-3.5 h-3.5" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const targetGridSource = Array.isArray(adminApplications) ? adminApplications : [];

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full">
      {/* Header Pipeline Module */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 m-0 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-slate-800 shrink-0" />
            <span>Nursery Verification Pipeline</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm m-0 mt-1">
            Audit compliance, verify legal documents, and route system activation protocols.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchApplicationsData}
          disabled={isLoading}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl cursor-pointer transition-all disabled:opacity-50 inline-flex items-center justify-center"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Navigation Filter System */}
      <div className="flex items-center border-b border-slate-200 w-full gap-1 select-none overflow-x-auto scrollbar-none">
        {(["Pending", "Approved", "Rejected"] as TApprovalStatus[]).map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer whitespace-nowrap ${isSelected ? "border-green-600 text-green-600" : "border-transparent text-slate-400 hover:text-slate-800"
                }`}
            >
              {tab === "Pending" && "Pending Queue"}
              {tab === "Approved" && "Verified Hub"}
              {tab === "Rejected" && "Rejected Audit Logs"}
            </button>
          );
        })}
      </div>

      {/* Catch Downstream Schema Error Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-3">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Core Unified DataTable Platform */}
      <div className={`transition-opacity duration-200 ${isLoading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        <DataTable<INurseryProfile>
          data={targetGridSource}
          columns={columns}
          searchPlaceholder="Search using business names..."
          searchKey="businessName"
          filterKey="approvalStatus"
          filterOptions={[activeTab] as TApprovalStatus[]}
        />
      </div>

      {/* MODAL 1: PRE-BUILT DETAILS PREVIEW SHEET */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setIsDetailsModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 relative z-10 text-xs"
            >
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">{selectedApp.businessName}</h3>
                <p className="text-slate-400 font-mono text-[11px] mt-0.5">Verification Parameters Sheet</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Address Matrix</span>
                  <p className="font-semibold text-slate-800 leading-relaxed">
                    {selectedApp.businessAddress?.address}, {selectedApp.businessAddress?.city}, {selectedApp.businessAddress?.state} - {selectedApp.businessAddress?.pinCode}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Service Reach</span>
                  <p className="font-mono text-slate-800 font-bold">{selectedApp.deliveryPincodes?.join(", ") || "None"}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl grid grid-cols-2 gap-3 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-sans">PAN Node</span>
                  <span className="text-slate-800 font-bold select-all">{selectedApp.panNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-sans">Bank Vault Details</span>
                  <span className="text-slate-800 font-bold block font-sans">{selectedApp.bankDetails?.bankName}</span>
                  <span className="text-[11px] text-slate-500 block">A/C: {selectedApp.bankDetails?.accountHolderName}</span>
                  <span className="text-[11px] text-slate-500 block">IFSC: {selectedApp.bankDetails?.ifscCode}</span>
                </div>
              </div>

              {selectedApp.approvalStatus === "Rejected" && selectedApp.rejectionReason && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-rose-800 flex gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p><strong>Audit Reason:</strong> {selectedApp.rejectionReason}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close Grid Sheet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: REJECTION DIALOG REASON MODAL */}
      <AnimatePresence>
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setIsRejectModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 relative z-10"
            >
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>Reject Onboarding Request</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">State the detailed analytical compliance mismatch reason.</p>
              </div>

              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Signature mismatch on legal files or invalid business certificate sequences."
                className="w-full text-xs font-medium px-3.5 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/10 focus:border-green-600 resize-none text-slate-800 transition-all"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectSubmit}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}