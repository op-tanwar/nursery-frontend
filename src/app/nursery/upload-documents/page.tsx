"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  CreditCard,
  ChevronLeft,
  X,
  FileCheck,
  Eye,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Award,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { nurseryProfileService } from "@/services/nurseryProfileService";
import {
  INurseryProfile,
  INurseryDocuments,
  INurseryDocumentItem,
  TDocumentType,
} from "@/types/nurseryProfile.types";

interface DocumentSlotConfig {
  key: TDocumentType;
  title: string;
  subtitle: string;
  required: boolean;
  icon: React.ReactNode;
  accept: string;
  guideText: string;
}

const DOCUMENT_CONFIGS: DocumentSlotConfig[] = [
  {
    key: "gstin",
    title: "GSTIN Certificate",
    subtitle: "Official GST registration certificate or GSTIN proof",
    required: false,
    icon: <Building2 className="w-5 h-5 text-emerald-600" />,
    accept: "application/pdf,image/jpeg,image/png,image/webp",
    guideText: "PDF or clear photo of Form GST REG-06 showing business name & GSTIN.",
  },
  {
    key: "panCard",
    title: "PAN Card (Business / Owner)",
    subtitle: "Permanent Account Number card copy",
    required: true,
    icon: <FileText className="w-5 h-5 text-emerald-600" />,
    accept: "application/pdf,image/jpeg,image/png,image/webp",
    guideText: "Valid PAN card in the name of the nursery entity or authorized owner.",
  },
  {
    key: "nurseryLicense",
    title: "Nursery / Trade License",
    subtitle: "Government horticultural license or municipal trade permit",
    required: false,
    icon: <Award className="w-5 h-5 text-emerald-600" />,
    accept: "application/pdf,image/jpeg,image/png,image/webp",
    guideText: "Seed license, agricultural registry, or local municipal trade certificate.",
  },
  {
    key: "identityProof",
    title: "Identity Proof (Aadhaar / Passport / Voter ID)",
    subtitle: "Government photo ID of authorized nursery owner",
    required: true,
    icon: <FileCheck className="w-5 h-5 text-emerald-600" />,
    accept: "application/pdf,image/jpeg,image/png,image/webp",
    guideText: "Front & back of Aadhaar, Passport, or Voter ID for KYC verification.",
  },
  {
    key: "bankDetails",
    title: "Bank Account Proof (Cancelled Cheque / Passbook)",
    subtitle: "Cheque or bank passbook copy for automated payout settlements",
    required: true,
    icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
    accept: "application/pdf,image/jpeg,image/png,image/webp",
    guideText: "Showing visible Account Number, IFSC code, and matching account holder name.",
  },
];

interface LocalFileState {
  file: File | null;
  previewUrl: string | null;
}

export default function NurseryDocumentUploadPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<INurseryProfile | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected files pending upload
  const [selectedFiles, setSelectedFiles] = useState<Record<TDocumentType, LocalFileState>>({
    gstin: { file: null, previewUrl: null },
    panCard: { file: null, previewUrl: null },
    nurseryLicense: { file: null, previewUrl: null },
    identityProof: { file: null, previewUrl: null },
    bankDetails: { file: null, previewUrl: null },
  });

  // Fetch current nursery profile & document states
  const loadProfile = async () => {
    try {
      setIsFetching(true);
      const res = await nurseryProfileService.getMyNurseryProfile();
      if (res.success && res.profile) {
        setProfile(res.profile);
      }
    } catch (err: any) {
      console.error("Failed to fetch nursery profile:", err);
      toast.error(err?.response?.data?.message || "Failed to load nursery profile.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Handle local file selection with 10MB limit and MIME check
  const handleFileChange = (key: TDocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit. Please upload a smaller file.");
        return;
      }

      const validMime = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!validMime.includes(file.type)) {
        toast.error("Invalid file format. Please upload PDF, JPEG, PNG, or WEBP.");
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setSelectedFiles((prev) => ({
        ...prev,
        [key]: { file, previewUrl },
      }));
      toast.success(`${file.name} attached for upload.`);
    }
  };

  const handleRemoveLocalFile = (key: TDocumentType) => {
    if (selectedFiles?.[key]?.previewUrl) {
      URL.revokeObjectURL(selectedFiles[key].previewUrl!);
    }
    setSelectedFiles((prev) => ({
      ...prev,
      [key]: { file: null, previewUrl: null },
    }));
  };

  // Submit all attached files to backend Cloudinary endpoint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    let attachedCount = 0;

    if (selectedFiles?.gstin?.file) {
      formData.append("gstin", selectedFiles.gstin.file);
      attachedCount++;
    }
    if (selectedFiles?.panCard?.file) {
      formData.append("panCard", selectedFiles.panCard.file);
      attachedCount++;
    }
    if (selectedFiles?.nurseryLicense?.file) {
      formData.append("nurseryLicense", selectedFiles.nurseryLicense.file);
      attachedCount++;
    }
    if (selectedFiles?.identityProof?.file) {
      formData.append("identityProof", selectedFiles.identityProof.file);
      attachedCount++;
    }
    if (selectedFiles?.bankDetails?.file) {
      formData.append("bankDetails", selectedFiles.bankDetails.file);
      attachedCount++;
    }

    if (attachedCount === 0) {
      toast.error("Please select at least one document to upload.");
      return;
    }

    let loadingToast: string | undefined;

    try {
      setIsSubmitting(true);
      loadingToast = toast.loading(
        `Uploading ${attachedCount} document${attachedCount > 1 ? "s" : ""} to secure storage…`
      );

      const res = await nurseryProfileService.uploadNurseryDocuments(formData);

      if (res && (res.success || res.documents)) {
        toast.success(res.message || "Documents uploaded successfully!", { id: loadingToast });
        // Clear local selected files
        setSelectedFiles({
          gstin: { file: null, previewUrl: null },
          panCard: { file: null, previewUrl: null },
          nurseryLicense: { file: null, previewUrl: null },
          identityProof: { file: null, previewUrl: null },
          bankDetails: { file: null, previewUrl: null },
        });
        // Refresh profile data
        await loadProfile();
      } else {
        toast.error(res?.message || "Upload failed. Please try again.", { id: loadingToast });
      }
    } catch (err: any) {
      console.error("Document upload error:", err);
      let errorMsg = "Failed to upload verification documents. Please try again.";
      if (err?.code === "ECONNABORTED" || err?.message?.includes("timeout")) {
        errorMsg =
          "Upload timed out. Your files may be too large or your connection is slow. Please try again.";
      } else if (err?.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err?.message) {
        errorMsg = err.message;
      } else if (typeof err === "string") {
        errorMsg = err;
      }
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const existingDocs = profile?.documents ?? {};
  const globalVerificationStatus = profile?.verificationStatus ?? "Pending";

  const getStatusBadge = (docItem?: INurseryDocumentItem, isNewSelected?: boolean) => {
    if (isNewSelected) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
          <UploadCloud className="w-3 h-3 text-blue-600" /> Ready to Upload
        </span>
      );
    }

    if (!docItem || !docItem.url) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
          Not Uploaded
        </span>
      );
    }

    switch (docItem.status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase tracking-wider">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Rejected
          </span>
        );
      case "Pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
            <Clock className="w-3 h-3 text-amber-600" /> Review Pending
          </span>
        );
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Loading document verification records...</p>
      </div>
    );
  }

  const hasAnyPendingOrSelected = Object.values(selectedFiles ?? {}).some((f) => f?.file !== null);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. TOP HEADER & STATUS BAR */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Link
            href="/nursery/my-nursery"
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl transition-all cursor-pointer active:scale-95"
            aria-label="Back to Profile"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                Nursery Document Upload & Verification
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  globalVerificationStatus === "Approved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : globalVerificationStatus === "Rejected"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {globalVerificationStatus === "Approved" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : globalVerificationStatus === "Rejected" ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                Verification: {globalVerificationStatus}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1 m-0">
              Submit your official KYC proofs to enable direct payouts, verified vendor badge, and live order dispatch.
            </p>
          </div>
        </div>

        <button
          onClick={loadProfile}
          className="self-start sm:self-auto px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* 2. ADMIN REVIEW NOTES ALERT IF REJECTED */}
      {profile?.adminReviewNotes && globalVerificationStatus === "Rejected" && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-5 sm:p-6 text-rose-900 shadow-xs flex items-start gap-4">
          <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-extrabold text-sm text-rose-950 m-0">
              Admin Rejection Notice & Feedback
            </h3>
            <p className="text-rose-800 leading-relaxed font-medium m-0 mt-1">
              {profile.adminReviewNotes}
            </p>
            <p className="text-rose-600 font-semibold text-[11px] mt-2 m-0">
              Please re-upload the corrected documents below and click &quot;Submit Verification Documents&quot;.
            </p>
          </div>
        </div>
      )}

      {/* 3. COMPLIANCE INSTRUCTIONS BANNER */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-white/10 rounded-2xl shrink-0 backdrop-blur-md">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 m-0">
              KYC & Document Verification Guidelines
            </h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed max-w-3xl m-0 mt-1">
              Upload clear, unedited color scans or high-resolution photos in <strong>PDF, PNG, or JPEG</strong> format (max 10MB each). Ensure names and numbers match your registered nursery profile for quick approval.
            </p>
          </div>
        </div>
      </div>

      {/* 4. DOCUMENT UPLOAD CARDS FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DOCUMENT_CONFIGS.map((config) => {
            const existingDoc = existingDocs?.[config.key];
            const localFile = selectedFiles?.[config.key];
            const isRejected = existingDoc?.status === "Rejected";

            return (
              <div
                key={config.key}
                className={`bg-white rounded-3xl border transition-all duration-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 ${
                  isRejected
                    ? "border-rose-300 bg-rose-50/20 ring-2 ring-rose-200/50"
                    : "border-slate-200/90 hover:border-emerald-300"
                }`}
              >
                {/* Header of Slot */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 m-0">
                      {config.icon}
                      <span>{config.title}</span>
                      {config.required ? (
                        <span className="text-rose-500 font-bold">*</span>
                      ) : (
                        <span className="text-slate-400 font-normal text-[10px] lowercase">
                          (optional)
                        </span>
                      )}
                    </h3>
                    <div>{getStatusBadge(existingDoc, Boolean(localFile?.file))}</div>
                  </div>
                  <p className="text-[11px] text-slate-500 m-0">{config.subtitle}</p>
                </div>

                {/* Rejection Alert Box */}
                {isRejected && existingDoc?.rejectionReason && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-rose-900 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[11px] uppercase tracking-wider font-extrabold text-rose-950">
                        Reason for Rejection:
                      </strong>
                      <span className="text-rose-800 text-[11px] leading-relaxed">
                        {existingDoc.rejectionReason}
                      </span>
                    </div>
                  </div>
                )}

                {/* Existing Document Live Link Preview */}
                {existingDoc?.url && !localFile?.file && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {existingDoc?.url?.toLowerCase()?.endsWith(".pdf") ? "PDF" : "IMG"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate m-0">
                          Uploaded Document
                        </p>
                        <p className="text-[10px] text-slate-400 m-0">
                          {existingDoc.uploadedAt
                            ? new Date(existingDoc.uploadedAt).toLocaleDateString()
                            : "Verified on Cloudinary"}
                        </p>
                      </div>
                    </div>

                    <a
                      href={existingDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                      <ExternalLink className="w-3 h-3 text-emerald-500" />
                    </a>
                  </div>
                )}

                {/* Local Attached File Card */}
                {localFile?.file ? (
                  <div className="border-2 border-emerald-300 rounded-2xl p-3 bg-emerald-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {localFile.file.name.split(".").pop()?.toUpperCase() || "FILE"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate m-0">
                          {localFile.file.name}
                        </p>
                        <p className="text-[10px] text-slate-500 m-0 mt-0.5">
                          {(localFile.file.size / (1024 * 1024)).toFixed(2)} MB • Ready for submission
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {localFile.previewUrl && (
                        <a
                          href={localFile.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/50 rounded-xl transition-colors"
                          title="Preview Selected File"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveLocalFile(config.key)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border-none cursor-pointer"
                        title="Remove Selected File"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* File Upload Drop Area */
                  <div className="relative border-2 border-dashed border-slate-200/90 hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-50/60 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept={config.accept}
                      onChange={(e) => handleFileChange(config.key, e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                      <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      <p className="text-xs font-bold text-slate-700 m-0">
                        {existingDoc?.url ? (
                          <span className="text-emerald-700">Click to upload replacement file</span>
                        ) : (
                          "Click to upload or drag & drop"
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 m-0">{config.guideText}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 5. ACTION BUTTONS FOOTER */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Files are encrypted & transmitted securely to Cloudinary storage.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              href="/nursery/my-nursery"
              className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !hasAnyPendingOrSelected}
              className="px-8 py-3 rounded-xl border-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-600/20"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>
                {isSubmitting ? "Uploading Documents..." : "Submit Verification Documents"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}