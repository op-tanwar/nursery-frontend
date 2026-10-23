"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Loader2,
  RotateCcw,
  RefreshCw,
  Upload,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { returnReplacementService } from "@/services/returnReplacementService";
import { RequestType } from "@/types/returnReplacement.types";

export interface ReturnReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  item: any;
  onSuccess: (requestData: any) => void;
}

const REASON_OPTIONS = [
  "Damaged/Dead Plant",
  "Transit Shock",
  "Wrong Item",
  "Missing Part",
  "Wrong Species",
  "Damaged Pot",
  "Poor Plant Quality",
  "Other",
];

export default function ReturnReplacementModal({
  isOpen,
  onClose,
  order,
  item,
  onSuccess,
}: ReturnReplacementModalProps) {
  const [requestType, setRequestType] = useState<RequestType>("Replacement");
  const [reason, setReason] = useState<string>("Damaged/Dead Plant");
  const [description, setDescription] = useState<string>("");
  const [proofUrlInput, setProofUrlInput] = useState<string>("");
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !item) return null;

  // Resolve item details
  const productObj =
    typeof item?.product === "object" && item?.product !== null
      ? item.product
      : typeof item?.item === "object" && item?.item !== null
      ? item.item
      : typeof item?.plant === "object" && item?.plant !== null
      ? item.plant
      : null;

  const productName =
    item?.product?.name ||
    productObj?.name ||
    item?.name ||
    "Botanical Product";

  const itemId =
    item?._id ||
    item?.id ||
    productObj?._id ||
    productObj?.id ||
    (typeof item?.item === "string" ? item.item : "") ||
    "";

  let productImage = "/images/plant-placeholder.png";
  if (productObj?.coverImage?.url) {
    productImage = productObj.coverImage.url;
  } else if (productObj?.images?.[0]?.url) {
    productImage = productObj.images[0].url;
  } else if (typeof productObj?.image === "string") {
    productImage = productObj.image;
  } else if (item?.coverImage?.url) {
    productImage = item.coverImage.url;
  } else if (item?.images?.[0]?.url) {
    productImage = item.images[0].url;
  }

  // Handle file selection (convert to base64 preview)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).slice(0, 3 - proofImages.length);
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProofImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle URL addition
  const handleAddUrl = () => {
    const trimmed = proofUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      toast.error("Please enter a valid HTTP or HTTPS image URL.");
      return;
    }
    if (proofImages.includes(trimmed)) {
      toast.error("Image URL already added.");
      return;
    }
    setProofImages((prev) => [...prev, trimmed]);
    setProofUrlInput("");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setProofImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast.error("Please select a reason for the request.");
      return;
    }

    if (proofImages.length === 0 && selectedFiles.length === 0) {
      toast.error("Please provide at least 1 photo proof of the issue.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting return / replacement request...");

    try {
      const orderId = order?._id || order?.id;

      // Use FormData if files exist, else JSON
      let payloadData: any;
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append("orderId", orderId);
        formData.append("itemId", itemId);
        formData.append("requestType", requestType);
        formData.append("reason", reason);
        formData.append("description", description.trim());
        formData.append("productName", productName);
        formData.append("productImage", productImage);

        selectedFiles.forEach((file) => {
          formData.append("proofImages", file);
        });

        // Also append any non-file URLs
        const urlProofs = proofImages.filter((p) => p.startsWith("http"));
        if (urlProofs.length > 0) {
          formData.append("proofImages", JSON.stringify(urlProofs));
        }

        payloadData = formData;
      } else {
        payloadData = {
          orderId,
          itemId,
          requestType,
          reason,
          description: description.trim(),
          proofImages,
          productName,
          productImage,
        };
      }

      const res = await returnReplacementService.createRequest(payloadData);

      toast.success(
        res?.message ||
          `${requestType} request submitted successfully! Our botanists will review it within 24 hours.`,
        { id: toastId }
      );

      onSuccess(res?.request || res?.returnRequest || { itemId, requestType, status: "Pending" });
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit request. Please verify the 24-hour return window.";
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* 🌑 Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* 📦 Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-brand-primary p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <RotateCcw className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Return or Replacement</h3>
              <p className="text-xs text-emerald-200 font-medium flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Botanical Guarantee (Within 24 Hours of Delivery)
              </p>
            </div>
          </div>
        </div>

        {/* Product Preview Snippet */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
            <Image
              src={productImage}
              alt={productName}
              fill
              sizes="48px"
              className="object-cover"
              onError={(e: any) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=100&q=80";
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{productName}</p>
            <p className="text-[11px] text-slate-500">
              Order #{order?._id ? String(order._id).slice(-8) : "N/A"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Request Type Radio Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Select Resolution Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRequestType("Replacement")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  requestType === "Replacement"
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 text-emerald-900"
                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <RefreshCw
                    className={`w-4 h-4 ${
                      requestType === "Replacement" ? "text-emerald-600" : "text-slate-400"
                    }`}
                  />
                  {requestType === "Replacement" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold block">Free Replacement</span>
                  <span className="text-[10px] text-slate-500">New healthy plant sent</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRequestType("Return")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  requestType === "Return"
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 text-emerald-900"
                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <RotateCcw
                    className={`w-4 h-4 ${
                      requestType === "Return" ? "text-emerald-600" : "text-slate-400"
                    }`}
                  />
                  {requestType === "Return" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold block">Return & Refund</span>
                  <span className="text-[10px] text-slate-500">Refund to original source</span>
                </div>
              </button>
            </div>
          </div>

          {/* Reason Select */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Reason for Request <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            >
              {REASON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Photo Proof Upload & URL Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Photo Proof <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {proofImages.length}/3 photos
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Upload clear photos showing the damaged plant/packaging or paste image URLs.
            </p>

            {/* Upload Area */}
            {proofImages.length < 3 && (
              <div className="space-y-2">
                <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 hover:bg-emerald-50/20 group">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors mb-1" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">
                    Click to browse photos
                  </span>
                  <span className="text-[10px] text-slate-400">PNG, JPG, or WEBP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Direct URL Input Option */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Or paste photo image URL (https://...)"
                    value={proofUrlInput}
                    onChange={(e) => setProofUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>
              </div>
            )}

            {/* Photo Previews */}
            {proofImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {proofImages.map((imgSrc, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group"
                  >
                    <img
                      src={imgSrc}
                      alt={`Proof thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Comment / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Additional Details / Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any specific details about the issue to help our botanical review team..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
            />
          </div>

          {/* Policy Notice Banner */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-2xl flex items-start gap-2.5 text-amber-900 text-[11px] leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">24-Hour Guarantee Notice</p>
              <p className="text-amber-700">
                Plants are perishable biological items. Urban Nursery guarantees healthy transit and delivery. Approved claims receive an immediate replacement or full refund.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
