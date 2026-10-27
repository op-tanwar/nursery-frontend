"use client";

import React, { useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  UploadCloud,
  Trash2,
  RefreshCw,
  Plus,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

export interface IGalleryImageItem {
  _id?: string;
  public_id?: string;
  url: string;
}

export interface IStagedGalleryFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface ProductGalleryManagerProps {
  existingImages: IGalleryImageItem[];
  onRemoveExisting: (index: number) => void;
  onReplaceExisting: (index: number, newFile: File) => void;
  stagedImages: IStagedGalleryFile[];
  onAddStagedFiles: (newFiles: File[]) => void;
  onRemoveStaged: (id: string) => void;
  maxImages?: number;
  disabled?: boolean;
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ProductGalleryManager: React.FC<ProductGalleryManagerProps> = ({
  existingImages,
  onRemoveExisting,
  onReplaceExisting,
  stagedImages,
  onAddStagedFiles,
  onRemoveStaged,
  maxImages = 10,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replacingIndexRef = useRef<number | null>(null);

  const totalImageCount = existingImages.length + stagedImages.length;
  const remainingSlots = Math.max(0, maxImages - totalImageCount);

  // Validate and stage incoming files
  const handleFilesSelected = (files: FileList | File[] | null) => {
    if (!files || files.length === 0 || disabled) return;

    const fileList = Array.from(files);
    const validFiles: File[] = [];

    for (const file of fileList) {
      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        toast.error(`"${file.name}" is not a supported image format (JPEG, PNG, WEBP only).`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`"${file.name}" exceeds 10MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    if (totalImageCount + validFiles.length > maxImages) {
      const allowedCount = Math.max(0, maxImages - totalImageCount);
      toast.error(
        `Exceeded limit! You can only add ${allowedCount} more image${
          allowedCount === 1 ? "" : "s"
        } (max ${maxImages} total).`
      );
      if (allowedCount > 0) {
        onAddStagedFiles(validFiles.slice(0, allowedCount));
      }
      return;
    }

    onAddStagedFiles(validFiles);
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || remainingSlots <= 0) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Trigger replacement for a specific existing thumbnail
  const handleTriggerReplace = (index: number) => {
    if (disabled) return;
    replacingIndexRef.current = index;
    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
      replaceInputRef.current.click();
    }
  };

  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetIdx = replacingIndexRef.current;
    if (file && targetIdx !== null && targetIdx >= 0) {
      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        toast.error("Unsupported file type. Please select JPEG, PNG, or WEBP.");
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error("File exceeds 10MB size limit.");
        return;
      }
      onReplaceExisting(targetIdx, file);
      toast.success(`Slot #${targetIdx + 1} queued for replacement.`);
    }
    replacingIndexRef.current = null;
  };

  return (
    <div className="space-y-4 border-t border-slate-100 pt-6">
      {/* Hidden single-file input for specific slot replacement */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleReplaceFileChange}
      />

      {/* Header with Title and Count Indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 m-0">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>Product Gallery Images</span>
          </label>
          <p className="text-[11px] text-slate-500 mt-0.5 m-0">
            Multi-angle showcases, leaf details, and perspective photos for customer evaluation.
          </p>
        </div>

        {/* Count Metric Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              totalImageCount >= maxImages
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            Total: <span className="font-mono font-black">{totalImageCount}</span> / {maxImages}
          </span>
          {existingImages.length > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {existingImages.length} Saved
            </span>
          )}
          {stagedImages.length > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
              +{stagedImages.length} New Staged
            </span>
          )}
        </div>
      </div>

      {/* Gallery Cards Grid (Existing + Staged) */}
      {totalImageCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3 bg-slate-50/60 rounded-xl border border-slate-200/80">
          {/* 1. Existing Gallery Images (from Cloudinary) */}
          {existingImages.map((img, idx) => (
            <div
              key={img.public_id || img._id || `existing-${idx}`}
              className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all"
            >
              <Image
                src={img.url}
                alt={`Gallery image #${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized={img.url.startsWith("blob:") || img.url.startsWith("data:")}
              />

              {/* Status Badge */}
              <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 bg-slate-900/75 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                <span>#{idx + 1}</span>
                <span className="text-slate-300 font-normal">Saved</span>
              </div>

              {/* Delete Badge Button */}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemoveExisting(idx)}
                title="Delete this gallery photo"
                className="absolute top-1.5 right-1.5 z-10 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xs opacity-90 hover:opacity-100 transition-all cursor-pointer border-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Replace Overlay Trigger */}
              <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleTriggerReplace(idx)}
                  className="px-2 py-1 rounded-md bg-white/90 hover:bg-white text-slate-800 text-[10px] font-bold flex items-center gap-1 shadow-xs border-0 cursor-pointer backdrop-blur-xs transition-colors"
                >
                  <RefreshCw className="w-3 h-3 text-blue-600" />
                  <span>Replace</span>
                </button>
              </div>
            </div>
          ))}

          {/* 2. Newly Staged Local Images (Pending Upload) */}
          {stagedImages.map((staged, idx) => (
            <div
              key={staged.id}
              className="group relative aspect-square rounded-xl overflow-hidden border-2 border-emerald-400 bg-emerald-50/20 shadow-2xs hover:shadow-md transition-all"
            >
              <Image
                src={staged.previewUrl}
                alt={`New staged image #${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />

              {/* Status Badge */}
              <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 bg-emerald-700/90 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>New</span>
              </div>

              {/* Cancel Staged File Trigger */}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemoveStaged(staged.id)}
                title="Cancel this new image"
                className="absolute top-1.5 right-1.5 z-10 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xs opacity-90 hover:opacity-100 transition-all cursor-pointer border-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="absolute inset-x-0 bottom-0 p-1 bg-emerald-950/70 text-emerald-100 text-[9px] text-center font-mono truncate px-1">
                {staged.file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Multi-File Upload Dropzone */}
      {remainingSlots > 0 ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-blue-600 rounded-xl p-5 text-center cursor-pointer bg-slate-50/40 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={(e) => {
              handleFilesSelected(e.target.files);
              if (e.target) e.target.value = "";
            }}
          />

          <div className="w-10 h-10 rounded-full bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors">
            <UploadCloud className="w-5 h-5" />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors m-0">
              Click to select or drag & drop multi-angle gallery images
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 m-0">
              Supports JPEG, PNG, WEBP (Max 10MB per image). Up to{" "}
              <span className="font-bold text-slate-600">{remainingSlots}</span> more photo
              {remainingSlots === 1 ? "" : "s"} allowed.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Maximum capacity reached ({maxImages} images). Remove or replace an existing photo to add
            new ones.
          </span>
        </div>
      )}
    </div>
  );
};
