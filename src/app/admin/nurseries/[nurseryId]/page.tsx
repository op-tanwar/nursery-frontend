"use client";

import React, { useEffect, useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminService } from "@/services/adminService";
import { vendorService } from "@/services/vendorService";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ShieldX,
  MapPin,
  CreditCard,
  FileText,
  Package,
  ShoppingBag,
  DollarSign,
  UserCheck,
  Tag,
  Eye,
  ExternalLink,
  X,
  Loader2,
  RefreshCw,
  Award,
  FileCheck,
  MessageSquare,
  Ban,
  Check,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  BadgePercent,
  Save,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import {
  INurseryProfile,
  INurseryDocuments,
  INurseryDocumentItem,
  TDocumentType,
  TVerificationStatus,
} from "@/types/nurseryProfile.types";
import {
  commissionService,
  INurseryCategoryCommissionItem,
  NormalizedCommissionRow,
  CANONICAL_CATEGORIES,
} from "@/services/commissionService";

interface DocumentMeta {
  key: TDocumentType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const DOCUMENT_METAS: DocumentMeta[] = [
  {
    key: "gstin",
    label: "GSTIN Certificate",
    description: "Official Goods and Services Tax Identification proof",
    icon: <Building2 className="w-5 h-5 text-emerald-600" />,
  },
  {
    key: "panCard",
    label: "PAN Card",
    description: "Permanent Account Number card of business/proprietor",
    icon: <FileText className="w-5 h-5 text-emerald-600" />,
  },
  {
    key: "nurseryLicense",
    label: "Nursery / Trade License",
    description: "Agricultural, horticultural registry or trade certificate",
    icon: <Award className="w-5 h-5 text-emerald-600" />,
  },
  {
    key: "identityProof",
    label: "Identity Proof (KYC)",
    description: "Aadhaar / Passport / Voter ID of authorized vendor",
    icon: <FileCheck className="w-5 h-5 text-emerald-600" />,
  },
  {
    key: "bankDetails",
    label: "Bank Account Proof",
    description: "Cancelled cheque / passbook copy for settlement payouts",
    icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
  },
];

interface PageProps {
  params?: Promise<{ nurseryId?: string }> | { nurseryId?: string };
}

export default function AdminNurseryVerificationPage(props: PageProps) {
  const router = useRouter();
  const routeParams = useParams();

  // Safely resolve nurseryId from props or useParams
  let nurseryId = "";
  if (routeParams?.nurseryId) {
    nurseryId = String(routeParams.nurseryId);
  } else if (props?.params) {
    if (typeof (props.params as any)?.then === "function") {
      try {
        const resolved = use(props.params as Promise<{ nurseryId?: string }>);
        nurseryId = resolved?.nurseryId || "";
      } catch {
        nurseryId = "";
      }
    } else {
      nurseryId = (props.params as { nurseryId?: string })?.nurseryId || "";
    }
  }

  const [profile, setProfile] = useState<INurseryProfile | null>(null);
  const [vendorData, setVendorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Document modal viewer state
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string; isPdf: boolean } | null>(null);

  // Per-document rejection reason drafts
  const [docReasons, setDocReasons] = useState<Record<TDocumentType, string>>({
    gstin: "",
    panCard: "",
    nurseryLicense: "",
    identityProof: "",
    bankDetails: "",
  });

  // Rejection modal state for individual doc
  const [rejectingDocKey, setRejectingDocKey] = useState<TDocumentType | null>(null);

  // Overall nursery verification notes
  const [overallNotes, setOverallNotes] = useState("");
  const [showOverallRejectModal, setShowOverallRejectModal] = useState(false);

  // Inventory tab
  type InventoryTabId =
    | "plants"
    | "pots"
    | "accessories"
    | "gardeningTools"
    | "plantCare"
    | "seedsBulbs"
    | "plantStands"
    | "artificialDriedPlants";
  const [activeTab, setActiveTab] = useState<InventoryTabId>("plants");

  // Pincode management state
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeSearch, setPincodeSearch] = useState("");
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [pincodeToRemove, setPincodeToRemove] = useState<string | null>(null);

  // Commission management state — uses NormalizedCommissionRow so all fields are guaranteed
  const [commissionRates, setCommissionRates] = useState<NormalizedCommissionRow[]>([]);
  const [defaultNurseryCommission, setDefaultNurseryCommission] = useState<number | "">("");
  const [commissionDrafts, setCommissionDrafts] = useState<Record<string, number | "">>({});
  const [isCommissionLoading, setIsCommissionLoading] = useState(false);
  const [isSavingCommission, setIsSavingCommission] = useState(false);

  /** Per-category system defaults — mirrors commissionService */
  const SYSTEM_DEFAULT_RATES: Record<string, number> = {
    Plants: 10,
    Pots: 12,
    Accessories: 15,
    "Gardening Tools": 15,
    "Plant Care": 12,
    "Seeds & Bulbs": 5,
    "Plant Stands": 15,
    "Artificial & Dried Plants": 15,
  };

  const buildFallbackRows = (): NormalizedCommissionRow[] =>
    CANONICAL_CATEGORIES.map((cat) => ({
      category: cat,
      globalRate: SYSTEM_DEFAULT_RATES[cat] ?? 10,
      nurseryCustomRate: undefined,
      effectiveRate: SYSTEM_DEFAULT_RATES[cat] ?? 10,
      isOverridden: false,
      source: "system_default" as const,
    }));

  const fetchCommissionRates = async () => {
    if (!nurseryId) return;
    setIsCommissionLoading(true);
    try {
      const res = await commissionService.getNurseryCommissionRates(nurseryId);
      // Service normalizes shapes — cast is safe
      let rates = (res?.effectiveRates || res?.categories || []) as NormalizedCommissionRow[];
      // Seed from canonical defaults when API returns empty list
      if (rates.length === 0) {
        rates = buildFallbackRows();
      }
      setCommissionRates(rates);
      setDefaultNurseryCommission(
        typeof res.defaultNurseryCommission === "number" ? res.defaultNurseryCommission : ""
      );
      const drafts: Record<string, number | ""> = {};
      rates.forEach((r) => {
        drafts[r.category] = typeof r.nurseryCustomRate === "number" ? r.nurseryCustomRate : "";
      });
      setCommissionDrafts(drafts);
    } catch (err: any) {
      console.warn("Commission rates unavailable:", err?.message);
      const fallback = buildFallbackRows();
      setCommissionRates(fallback);
      const drafts: Record<string, number | ""> = {};
      fallback.forEach((r) => { drafts[r.category] = ""; });
      setCommissionDrafts(drafts);
    } finally {
      setIsCommissionLoading(false);
    }
  };

  const handleSaveCommission = async () => {
    if (!nurseryId) return;
    setIsSavingCommission(true);
    const toastId = toast.loading("Saving commission settings...");
    try {
      const overrides = Object.entries(commissionDrafts)
        .filter(([, val]) => val !== "" && val != null)
        .map(([category, val]) => ({
          category,
          customCommissionPercentage: Number(val),
        }));

      await commissionService.updateNurseryCommission(nurseryId, {
        defaultNurseryCommission:
          defaultNurseryCommission !== "" ? Number(defaultNurseryCommission) : null,
        commissionOverrides: overrides,
      });
      toast.success("Commission settings saved!", { id: toastId });
      fetchCommissionRates();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save commission settings.", {
        id: toastId,
      });
    } finally {
      setIsSavingCommission(false);
    }
  };


  const fetchNurseryData = async () => {
    if (!nurseryId) return;
    try {
      setIsLoading(true);

      // 1. Fetch verification endpoint with full documents
      const res = await adminService.getNurseryVerificationDetail(nurseryId);
      if (res.success && res.nursery) {
        setProfile(res.nursery);
        if (res.nursery.adminReviewNotes) {
          setOverallNotes(res.nursery.adminReviewNotes);
        }
      }

      // 2. Supplementary vendor catalog data if available
      try {
        const vendorRes = await vendorService.getAdminVendorDetail(nurseryId);
        if (vendorRes.success && vendorRes.vendor) {
          setVendorData(vendorRes.vendor);
        }
      } catch (e) {
        console.warn("Supplementary inventory data unavailable:", e);
      }
    } catch (err: any) {
      console.error("Failed to load admin nursery detail:", err);
      const errorMsg =
        typeof err === "string"
          ? err
          : err?.message ||
            err?.response?.data?.message ||
            "Failed to load nursery verification details.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNurseryData();
    fetchCommissionRates();
  }, [nurseryId]);

  // Handle individual document verification
  const handleVerifySingleDoc = async (
    docKey: TDocumentType,
    status: TVerificationStatus,
    reason?: string
  ) => {
    if (!profile) return;
    try {
      setIsActionLoading(true);
      const res = await adminService.verifyNurseryDocuments(profile._id, {
        documentType: docKey,
        status,
        rejectionReason: reason || docReasons[docKey] || undefined,
      });

      if (res.success) {
        toast.success(`${docKey.toUpperCase()} marked as ${status}.`);
        setRejectingDocKey(null);
        await fetchNurseryData();
      }
    } catch (err: any) {
      const errorMsg =
        typeof err === "string"
          ? err
          : err?.message ||
            err?.response?.data?.message ||
            `Failed to update ${docKey} status.`;
      toast.error(errorMsg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle overall Nursery Approval / Rejection
  const handleOverallDecision = async (decision: "Approved" | "Rejected") => {
    if (!profile) return;
    try {
      setIsActionLoading(true);
      const res = await adminService.verifyNurseryDocuments(profile._id, {
        verificationStatus: decision,
        adminReviewNotes: overallNotes || undefined,
      });

      if (res.success) {
        toast.success(`Nursery verification status updated to ${decision}!`);
        setShowOverallRejectModal(false);
        await fetchNurseryData();
      }
    } catch (err: any) {
      const errorMsg =
        typeof err === "string"
          ? err
          : err?.message ||
            err?.response?.data?.message ||
            "Failed to update overall nursery verification.";
      toast.error(errorMsg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle nursery active status
  const handleToggleActive = async () => {
    if (!profile) return;
    const currentStatus = typeof profile.isActive === "boolean" ? profile.isActive : true;
    const nextStatus = !currentStatus;

    if (!window.confirm(`Are you sure you want to ${nextStatus ? "ACTIVATE" : "SUSPEND"} "${profile.businessName}"?`)) {
      return;
    }

    try {
      setIsActionLoading(true);
      const res = await adminService.toggleNurseryStatus(profile._id, { isActive: nextStatus });
      if (res.success) {
        toast.success(`Nursery is now ${nextStatus ? "Active" : "Suspended"}.`);
        await fetchNurseryData();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to alter vendor operational status.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Add a new service pincode
  const handleAddPincode = async () => {
    if (!profile) return;
    const pin = pincodeInput.trim();
    if (!/^\d{6}$/.test(pin)) {
      toast.error("Please enter a valid 6-digit pincode.");
      return;
    }
    try {
      setIsPincodeLoading(true);
      const res = await adminService.managePincodes(profile._id, { action: "add", pincode: pin });
      if (res.success) {
        toast.success(res.message || `Pincode ${pin} added.`);
        setPincodeInput("");
        await fetchNurseryData();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add pincode.");
    } finally {
      setIsPincodeLoading(false);
    }
  };

  // Confirm and remove a service pincode
  const handleConfirmRemovePincode = async () => {
    if (!profile || !pincodeToRemove) return;
    try {
      setIsPincodeLoading(true);
      const res = await adminService.managePincodes(profile._id, { action: "remove", pincode: pincodeToRemove });
      if (res.success) {
        toast.success(res.message || `Pincode ${pincodeToRemove} removed.`);
        setPincodeToRemove(null);
        await fetchNurseryData();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove pincode.");
    } finally {
      setIsPincodeLoading(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading nursery documents & profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center mt-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-rose-600" />
          <h2 className="text-lg font-bold text-slate-900">Nursery Profile Not Found</h2>
          <p className="text-xs text-slate-500">
            No record found for ID: <span className="font-mono text-slate-700">{nurseryId}</span>
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            ← Back to Nurseries List
          </button>
        </div>
      </div>
    );
  }

  const documents = profile.documents || {};
  const owner = typeof profile.nursery === "object" ? (profile.nursery as any) : null;
  const inventory = vendorData?.inventorySummary;
  const orders = vendorData?.ordersSummary;
  const isCurrentlyActive = typeof profile.isActive === "boolean" ? profile.isActive : true;
  const deliveryPincodes: string[] = (profile as any).deliveryPincodes || [];
  const filteredPincodes = pincodeSearch
    ? deliveryPincodes.filter((p) => p.includes(pincodeSearch.trim()))
    : deliveryPincodes;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto bg-slate-50/50 min-h-screen font-sans text-slate-800">
      
      {/* 1. TOP NAVIGATION & ACTION BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Nurseries List</span>
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 m-0">
              <Building2 className="w-7 h-7 text-emerald-700 shrink-0" />
              <span>{profile.businessName}</span>
            </h1>

            {/* Global Verification Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full border ${
                profile.verificationStatus === "Approved"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : profile.verificationStatus === "Rejected"
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}
            >
              {profile.verificationStatus === "Approved" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : profile.verificationStatus === "Rejected" ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              Verification: {profile.verificationStatus || "Pending"}
            </span>

            {/* Operational Active / Suspended Badge */}
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                isCurrentlyActive
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {isCurrentlyActive ? "Active" : "Suspended"}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1.5 font-medium m-0">
            Nursery ID: <span className="font-mono font-bold text-slate-700">{profile._id}</span> •
            Submitted: {profile.documentsSubmittedAt ? new Date(profile.documentsSubmittedAt).toLocaleString() : new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Global Admin Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => handleOverallDecision("Approved")}
            disabled={isActionLoading || profile.verificationStatus === "Approved"}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Approve Nursery</span>
          </button>

          <button
            onClick={() => setShowOverallRejectModal(true)}
            disabled={isActionLoading}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldX className="w-4 h-4" />
            <span>Reject Nursery</span>
          </button>

          <button
            onClick={handleToggleActive}
            disabled={isActionLoading}
            className={`px-4 py-2.5 font-bold text-xs rounded-xl border transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
              isCurrentlyActive
                ? "bg-white border-amber-300 text-amber-700 hover:bg-amber-50"
                : "bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            {isCurrentlyActive ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span>{isCurrentlyActive ? "Suspend" : "Activate"}</span>
          </button>

          {profile?.slug || (profile as any)?.nurseryId || profile?._id ? (
            <Link
              href={`/vendor/${profile.slug || (profile as any).nurseryId || profile._id}`}
              target="_blank"
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Public Store</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          ) : null}
        </div>
      </div>

      {/* 2. ADMIN REVIEW NOTES SECTION */}
      {profile.adminReviewNotes && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 text-amber-900 shadow-xs flex items-start gap-4">
          <MessageSquare className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <strong className="block text-amber-950 font-extrabold uppercase tracking-wider text-[11px]">
              Latest Admin Verification Notes:
            </strong>
            <p className="text-amber-900 leading-relaxed font-medium m-0">{profile.adminReviewNotes}</p>
          </div>
        </div>
      )}

      {/* 3. UPLOADED DOCUMENTS VERIFICATION MATRIX */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 m-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Nursery KYC & Onboarding Documents Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Review and approve or reject each regulatory proof individually.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DOCUMENT_METAS.map((meta) => {
            const docItem = documents[meta.key];
            const hasDoc = Boolean(docItem?.url);
            const isPdf = Boolean(docItem?.url?.toLowerCase().endsWith(".pdf"));

            return (
              <div
                key={meta.key}
                className={`bg-white rounded-3xl border transition-all p-5 shadow-xs flex flex-col justify-between space-y-4 ${
                  docItem?.status === "Approved"
                    ? "border-emerald-200 bg-emerald-50/10"
                    : docItem?.status === "Rejected"
                    ? "border-rose-200 bg-rose-50/10"
                    : "border-slate-200"
                }`}
              >
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 m-0">
                      {meta.icon}
                      <span>{meta.label}</span>
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        !hasDoc
                          ? "bg-slate-100 border-slate-200 text-slate-400"
                          : docItem?.status === "Approved"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : docItem?.status === "Rejected"
                          ? "bg-rose-50 border-rose-200 text-rose-700"
                          : "bg-amber-50 border-amber-200 text-amber-700"
                      }`}
                    >
                      {hasDoc ? docItem?.status || "Pending" : "Not Provided"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 m-0">{meta.description}</p>
                </div>

                {/* Rejection Note Display */}
                {docItem?.status === "Rejected" && docItem.rejectionReason && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] leading-relaxed">
                    <strong className="block text-rose-950 font-bold uppercase text-[9px]">Rejection Reason:</strong>
                    {docItem.rejectionReason}
                  </div>
                )}

                {/* Document View Card */}
                {hasDoc ? (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {isPdf ? "PDF" : "IMG"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate m-0">
                          {docItem!.url!.split("/").pop()?.substring(0, 20) || "Document Asset"}
                        </p>
                        <p className="text-[10px] text-slate-400 m-0">
                          {docItem?.uploadedAt ? new Date(docItem.uploadedAt).toLocaleDateString() : "Uploaded"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* In-app Modal Preview */}
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewDoc({
                            url: docItem!.url!,
                            title: meta.label,
                            isPdf,
                          })
                        }
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition"
                        title="Preview In Browser"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      {/* Direct New Tab */}
                      <a
                        href={docItem!.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
                        title="Open Cloudinary URL in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    Vendor has not uploaded this document yet.
                  </div>
                )}

                {/* Individual Review Actions */}
                {hasDoc && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isActionLoading || docItem?.status === "Approved"}
                      onClick={() => handleVerifySingleDoc(meta.key, "Approved")}
                      className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>

                    <button
                      type="button"
                      disabled={isActionLoading || docItem?.status === "Rejected"}
                      onClick={() => setRejectingDocKey(meta.key)}
                      className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BUSINESS & LEGAL DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Business & Owner Profile */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 m-0">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Business & Owner Profile</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Business Name</span>
              <p className="font-bold text-slate-900 m-0">{profile.businessName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Registered Owner</span>
              <p className="font-bold text-slate-900 m-0">{owner?.name || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Business Email</span>
              <p className="font-medium text-slate-800 select-all m-0">{profile.businessEmail}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Contact Phone</span>
              <p className="font-medium text-slate-800 m-0">{profile.businessPhone}</p>
            </div>

            <div className="sm:col-span-2 space-y-1 pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Registered Business Address</span>
              <p className="font-semibold text-slate-800 leading-relaxed m-0">
                {profile.businessAddress?.address}, {profile.businessAddress?.city}, {profile.businessAddress?.state} - {profile.businessAddress?.pinCode} ({profile.businessAddress?.country || "India"})
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Tax & Banking Settlement Details */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 m-0">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>Tax Identifiers & Bank Settlement Vault</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono">
              <span className="text-[10px] text-slate-400 font-bold block uppercase font-sans">GSTIN Number</span>
              <span className="text-slate-900 font-bold select-all text-xs">{profile.gstin || "Not Submitted"}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono">
              <span className="text-[10px] text-slate-400 font-bold block uppercase font-sans">PAN Number</span>
              <span className="text-slate-900 font-bold select-all text-xs">{profile.panNumber || "Not Submitted"}</span>
            </div>

            <div className="sm:col-span-2 p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-2">
              <span className="text-[10px] text-indigo-700 font-bold block uppercase tracking-wider">Settlement Bank Account</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Bank Name</span>
                  <span className="font-bold text-slate-900">{profile.bankDetails?.bankName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Account Holder</span>
                  <span className="font-bold text-slate-900">{profile.bankDetails?.accountHolderName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Account Number</span>
                  <span className="font-mono font-bold text-slate-900">{profile.bankDetails?.accountNumber || "****"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">IFSC Code</span>
                  <span className="font-mono font-bold text-slate-900">{profile.bankDetails?.ifscCode || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. ADMIN SERVICE PINCODE MANAGEMENT */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 m-0">
              Active Service PIN Codes
            </h2>
            <span className="ml-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase rounded-full">
              {deliveryPincodes.length} Pincodes
            </span>
          </div>
          <p className="text-xs text-slate-400 m-0">
            Delivery pincodes this nursery services. Add or remove coverage areas from here.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Add Pincode Row */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setPincodeInput(v);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddPincode(); } }}
                placeholder="Enter 6-digit pincode"
                maxLength={6}
                className="w-full pl-4 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:font-sans placeholder:font-normal"
              />
              {pincodeInput.length > 0 && pincodeInput.length < 6 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-amber-500 font-bold">
                  {6 - pincodeInput.length} more
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddPincode}
              disabled={isPincodeLoading || pincodeInput.length !== 6}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              {isPincodeLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Add Pincode</span>
            </button>
          </div>

          {/* Search/Filter Row */}
          {deliveryPincodes.length > 8 && (
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={pincodeSearch}
                onChange={(e) => setPincodeSearch(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Filter pincodes..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          )}

          {/* Pincode Badges Grid */}
          {filteredPincodes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filteredPincodes.map((pin) => (
                <span
                  key={pin}
                  className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 transition group"
                >
                  <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                  {pin}
                  <button
                    type="button"
                    onClick={() => setPincodeToRemove(pin)}
                    disabled={isPincodeLoading}
                    title={`Remove ${pin}`}
                    className="ml-0.5 p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer border-none disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">
                {pincodeSearch
                  ? `No pincodes matching "${pincodeSearch}"`
                  : "No service pincodes configured yet. Add the first one above."}
              </p>
            </div>
          )}

          {pincodeSearch && filteredPincodes.length !== deliveryPincodes.length && (
            <p className="text-[11px] text-slate-400 font-medium">
              Showing {filteredPincodes.length} of {deliveryPincodes.length} pincodes
            </p>
          )}
        </div>
      </div>

      {/* 6. COMMISSION & FEE SETTINGS */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center">
              <BadgePercent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">Commission & Fee Settings</h2>
              <p className="text-xs text-slate-400 m-0 mt-0.5">
                Override global category commission rates for this nursery. Leave blank to use global defaults.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchCommissionRates}
              disabled={isCommissionLoading}
              className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl bg-white text-slate-500 hover:bg-slate-50 cursor-pointer transition"
              title="Refresh commission rates"
            >
              <RefreshCw className={`w-4 h-4 ${isCommissionLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={handleSaveCommission}
              disabled={isSavingCommission || isCommissionLoading}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl cursor-pointer transition text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingCommission ? "Saving..." : "Save Commission"}</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Flat Default Rate for Entire Nursery */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Flat Nursery Default Rate (optional)
            </label>
            <p className="text-[11px] text-slate-400 m-0">
              Set one rate that overrides all categories for this nursery. Leave blank to use per-category rates.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={defaultNurseryCommission}
                onChange={(e) => {
                  const v = e.target.value;
                  setDefaultNurseryCommission(v === "" ? "" : Math.max(0, Math.min(100, parseFloat(v) || 0)));
                }}
                placeholder="e.g. 10"
                className="w-28 px-3 py-2 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-violet-500 transition bg-white"
              />
              <span className="text-sm font-bold text-slate-600">% Flat Rate</span>
              {defaultNurseryCommission !== "" && (
                <button
                  type="button"
                  onClick={() => setDefaultNurseryCommission("")}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition border-none"
                  title="Clear flat rate (use per-category)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Per-Category Commission Table */}
          {isCommissionLoading ? (
            <div className="py-8 text-center">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-600" />
              <p className="text-xs text-slate-400">Loading commission rates...</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Global Rate</th>
                    <th className="py-3 px-4 text-center">Custom Override</th>
                    <th className="py-3 px-4 text-center">Effective Rate</th>
                    <th className="py-3 px-4 text-center">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {commissionRates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No commission data available.
                      </td>
                    </tr>
                  ) : (
                    commissionRates.map((rate) => {
                      const draftVal = commissionDrafts[rate.category];
                      // A draft override is active when it's a valid number (not empty string)
                      const hasOverride = draftVal !== "" && typeof draftVal === "number" && !isNaN(draftVal);
                      // A nursery flat default is active when set and no per-category override
                      const hasFlatDefault =
                        !hasOverride &&
                        defaultNurseryCommission !== "" &&
                        typeof defaultNurseryCommission === "number" &&
                        !isNaN(defaultNurseryCommission);

                      // Guaranteed-safe global rate (NormalizedCommissionRow always provides it)
                      const displayGlobalRate = rate.globalRate ?? 10;

                      // Effective rate: per-category draft > flat nursery default > globalRate from API
                      const displayEffectiveRate: number = hasOverride
                        ? Number(draftVal)
                        : hasFlatDefault
                        ? Number(defaultNurseryCommission)
                        : rate.effectiveRate ?? displayGlobalRate;

                      // Is this row highlighted?
                      const isActiveOverride = hasOverride || (rate.isOverridden && !hasOverride && draftVal === "");

                      return (
                        <tr
                          key={rate.category}
                          className={`hover:bg-slate-50/50 transition ${
                            hasOverride ? "bg-violet-50/20" : ""
                          }`}
                        >
                          {/* Category */}
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {rate.category}
                          </td>

                          {/* Global Rate — always a number, never undefined% */}
                          <td className="py-3 px-4 text-center">
                            <span className="text-slate-500 font-semibold">
                              {displayGlobalRate}%
                            </span>
                          </td>

                          {/* Custom Override Input */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={draftVal === "" ? "" : String(draftVal)}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setCommissionDrafts((prev) => ({
                                    ...prev,
                                    [rate.category]:
                                      v === ""
                                        ? ""
                                        : Math.max(0, Math.min(100, parseFloat(v))),
                                  }));
                                }}
                                placeholder="—"
                                className="w-16 text-center font-bold text-slate-900 bg-white border border-slate-200 rounded-lg py-1 text-sm focus:outline-none focus:border-violet-600 transition"
                              />
                              {hasOverride && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCommissionDrafts((prev) => ({
                                      ...prev,
                                      [rate.category]: "",
                                    }))
                                  }
                                  className="p-1 text-slate-300 hover:text-rose-600 rounded cursor-pointer border-none"
                                  title="Revert to global"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Effective Rate — always renders a clean number% */}
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`font-black text-sm ${
                                hasOverride
                                  ? "text-violet-700"
                                  : hasFlatDefault
                                  ? "text-blue-600"
                                  : "text-slate-700"
                              }`}
                            >
                              {displayEffectiveRate}%
                            </span>
                          </td>

                          {/* Source Badge — 3-state: Custom Override / Flat Nursery / Global Default */}
                          <td className="py-3 px-4 text-center">
                            {hasOverride ? (
                              <span className="px-2.5 py-0.5 bg-violet-100 text-violet-700 border border-violet-200 rounded-full text-[10px] font-bold uppercase">
                                Custom Override
                              </span>
                            ) : hasFlatDefault ? (
                              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold uppercase">
                                Flat Default
                              </span>
                            ) : rate.isOverridden ? (
                              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold uppercase">
                                Saved Override
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[10px] font-bold uppercase">
                                Global Default
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
          )}
        </div>
      </div>

      {/* 7. INVENTORY SUMMARY TABLE (IF AVAILABLE) */}
      {inventory && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">Vendor Catalog ({inventory?.totalProducts || 0} Items)</h2>
              <p className="text-xs text-slate-400 m-0 mt-0.5">Live merchandise listed by this nursery</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "plants" as const, label: `🌱 Plants (${inventory?.plantsCount || 0})` },
                { id: "pots" as const, label: `🪴 Pots (${inventory?.potsCount || 0})` },
                { id: "accessories" as const, label: `🛠️ Accessories (${inventory?.accessoriesCount || 0})` },
                { id: "gardeningTools" as const, label: `🔧 Tools (${inventory?.gardeningToolsCount || 0})` },
                { id: "plantCare" as const, label: `💧 Care (${inventory?.plantCareCount || 0})` },
                { id: "seedsBulbs" as const, label: `🌱 Seeds (${inventory?.seedsBulbsCount || 0})` },
                { id: "plantStands" as const, label: `🗄️ Stands (${inventory?.plantStandsCount || 0})` },
                { id: "artificialDriedPlants" as const, label: `🌸 Artificial (${inventory?.artificialDriedPlantsCount || 0})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {inventory && inventory[activeTab] && inventory[activeTab].length > 0 ? (
                  inventory[activeTab].map((item: any) => (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                        {item.coverImage?.url && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden relative shrink-0 border border-slate-200">
                            <Image src={item.coverImage.url} alt={item.name} fill sizes="32px" className="object-cover" />
                          </div>
                        )}
                        <span>{item.name}</span>
                      </td>
                      <td className="p-4 font-medium text-slate-600">{item.category}</td>
                      <td className="p-4 font-bold text-slate-900">₹{item.price}</td>
                      <td className="p-4 font-medium text-slate-700">{item.stock} units</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${item.isActive ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
                          {item.isActive ? "Live" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                      No products listed under this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 🔍 MODAL: EMBEDDED DOCUMENT PREVIEWER */}
      {/* ======================================================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-sm m-0">{previewDoc.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-200 rounded-xl transition inline-flex items-center gap-1 text-xs font-bold"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Fullscreen</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition cursor-pointer border-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-slate-900/5 p-4 overflow-auto flex items-center justify-center">
              {previewDoc.isPdf ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-full rounded-2xl border border-slate-200 shadow-xs bg-white"
                  title={previewDoc.title}
                />
              ) : (
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <img
                    src={previewDoc.url}
                    alt={previewDoc.title}
                    className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* ⚠️ MODAL: SINGLE DOCUMENT REJECTION REASON */}
      {/* ======================================================= */}
      {rejectingDocKey && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-rose-950 flex items-center gap-2 m-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Reject {rejectingDocKey.toUpperCase()}</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectingDocKey(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 m-0">
              Provide a clear reason for rejecting this document so the vendor can re-upload a compliant copy.
            </p>

            <textarea
              rows={3}
              value={docReasons[rejectingDocKey]}
              onChange={(e) =>
                setDocReasons((prev) => ({ ...prev, [rejectingDocKey]: e.target.value }))
              }
              placeholder="e.g. Document image is blurry or expired. Please upload a clear color copy."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none resize-none font-sans"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingDocKey(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() =>
                  handleVerifySingleDoc(rejectingDocKey, "Rejected", docReasons[rejectingDocKey])
                }
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* ⚠️ MODAL: OVERALL NURSERY REJECTION */}
      {/* ======================================================= */}
      {showOverallRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-rose-950 flex items-center gap-2 m-0">
                <ShieldX className="w-5 h-5 text-rose-600" />
                <span>Reject Nursery Onboarding & Verification</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowOverallRejectModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 m-0">
              Please provide comprehensive audit review notes explaining why the nursery application was rejected.
            </p>

            <textarea
              rows={4}
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              placeholder="e.g. Critical document mismatch: The submitted GSTIN does not match the registered business owner name. Please update and re-submit."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none resize-none font-sans"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOverallRejectModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => handleOverallDecision("Rejected")}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldX className="w-3.5 h-3.5" />}
                <span>Reject Nursery Application</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 🗑️ MODAL: PINCODE REMOVE CONFIRMATION */}
      {/* ======================================================= */}
      {pincodeToRemove && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 rounded-2xl">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 m-0">
                Remove Pincode?
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed m-0">
              Are you sure you want to remove pincode{" "}
              <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                {pincodeToRemove}
              </span>{" "}
              from this nursery's service coverage? Customers in this area will no longer see this nursery's products.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPincodeToRemove(null)}
                disabled={isPincodeLoading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPincodeLoading}
                onClick={handleConfirmRemovePincode}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isPincodeLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Remove Pincode</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
