"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setNurseryLoading,
  setNurseryError,
  updateAccessoryInNurseryState
} from "@/redux/slices/nurserySlice";
import { nurseryService } from "@/services/nurseryService";
import { accessoryService } from "@/services/accessoryService";
import {
  ProductGalleryManager,
  IGalleryImageItem,
  IStagedGalleryFile,
} from "@/components/nursery/ProductGalleryManager";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Loader2, Sliders, Save, AlertCircle } from "lucide-react";

// Predefined catalog categories for accessory assets schema matrix
export const AVAILABLE_ACCESSORY_CATEGORIES = [
  "Gardening Tools",
  "Fertilizers & Soil",
  "Pest Control",
  "Watering Equipment",
  "Plant Stands & Decor",
  "Hardware & Spares"
];

export default function EditAccessoryConfigurationPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const accId = params.id as string;

  const { isLoading, error } = useAppSelector((state) => state.nursery);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");

  // Accessory Specifications
  const [brand, setBrand] = useState("Generic");
  const [weight, setWeight] = useState("");
  const [material, setMaterial] = useState("");
  const [capacity, setCapacity] = useState("");
  const [dimensions, setDimensions] = useState("");

  // SEO States
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [points, setPoints] = useState<string[]>([""]);
  const [benefits, setBenefits] = useState<string[]>([""]);

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [existingCoverUrl, setExistingCoverUrl] = useState<string>("");

  // Gallery Management States
  const [existingGalleryImages, setExistingGalleryImages] = useState<IGalleryImageItem[]>([]);
  const [stagedGalleryFiles, setStagedGalleryFiles] = useState<IStagedGalleryFile[]>([]);
  const [deletedImagePublicIds, setDeletedImagePublicIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchAccessoryDataNode = async () => {
      dispatch(setNurseryLoading(true));
      try {
        let targetedAcc: any = null;
        try {
          const directRes = await accessoryService.getAccessoryDetails(`${accId}?t=${Date.now()}`);
          targetedAcc = directRes?.accessory || directRes?.data;
        } catch {
          // fallback to inventory list
        }

        if (!targetedAcc) {
          const response = await nurseryService.getMyAccessories();
          const accessoryList = response?.accessories || [];
          targetedAcc = accessoryList.find((a: any) => a._id === accId);
        }

        if (!targetedAcc) {
          throw new Error("Targeted gear/accessory inventory document node not found.");
        }

        setName(targetedAcc.name || "");
        setDescription(targetedAcc.description || "");
        setCategory(targetedAcc.category || "");
        setPrice(targetedAcc.price ?? "");
        setDiscountPrice(targetedAcc.discountPrice ?? "");
        setStock(targetedAcc.stock ?? "");
        setBrand(targetedAcc.specifications?.brand || "Generic");
        setWeight(targetedAcc.specifications?.weight || "");
        setMaterial(targetedAcc.specifications?.material || "");
        setCapacity(targetedAcc.specifications?.capacity || "");
        setDimensions(targetedAcc.specifications?.dimensions || "");
        setMetaTitle(targetedAcc.metaTitle || "");
        setMetaDescription(targetedAcc.metaDescription || "");
        setShortDesc(targetedAcc.descriptionOption?.short || "");
        setExistingCoverUrl(targetedAcc.coverImage?.url || "");
        setExistingGalleryImages(Array.isArray(targetedAcc.images) ? targetedAcc.images : []);

        if (targetedAcc.descriptionOption?.points?.length) setPoints(targetedAcc.descriptionOption.points);
        if (targetedAcc.benefits?.length) setBenefits(targetedAcc.benefits);

        dispatch(setNurseryLoading(false));
      } catch (err: any) {
        const errMsg = err?.message || "Failed parsing target utility gear asset node stream.";
        dispatch(setNurseryError(errMsg));
        toast.error(errMsg);
      }
    };

    if (accId) fetchAccessoryDataNode();
  }, [accId, dispatch]);

  const handleArrayStringChange = (index: number, val: string, type: "points" | "benefits") => {
    if (type === "points") { const clone = [...points]; clone[index] = val; setPoints(clone); }
    if (type === "benefits") { const clone = [...benefits]; clone[index] = val; setBenefits(clone); }
  };

  const addArrayNode = (type: "points" | "benefits") => {
    if (type === "points") setPoints([...points, ""]);
    if (type === "benefits") setBenefits([...benefits, ""]);
  };

  const removeArrayNode = (index: number, type: "points" | "benefits") => {
    if (type === "points" && points.length > 1) setPoints(points.filter((_, i) => i !== index));
    if (type === "benefits" && benefits.length > 1) setBenefits(benefits.filter((_, i) => i !== index));
  };

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
      stagedGalleryFiles.forEach((f) => {
        if (f.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(f.previewUrl);
        }
      });
    };
  }, [coverPreview, stagedGalleryFiles]);

  const handleRemoveExistingGalleryImage = (index: number) => {
    const target = existingGalleryImages[index];
    if (target?.public_id) {
      setDeletedImagePublicIds((prev) => [...prev, target.public_id!]);
    }
    setExistingGalleryImages((prev) => prev.filter((_, i) => i !== index));
    toast.success("Gallery photo marked for deletion on save.");
  };

  const handleReplaceExistingGalleryImage = (index: number, newFile: File) => {
    const target = existingGalleryImages[index];
    if (target?.public_id) {
      setDeletedImagePublicIds((prev) => [...prev, target.public_id!]);
    }
    setExistingGalleryImages((prev) => prev.filter((_, i) => i !== index));
    const newStaged: IStagedGalleryFile = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file: newFile,
      previewUrl: URL.createObjectURL(newFile),
    };
    setStagedGalleryFiles((prev) => [...prev, newStaged]);
  };

  const handleAddStagedGalleryFiles = (newFiles: File[]) => {
    const newItems: IStagedGalleryFile[] = newFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setStagedGalleryFiles((prev) => [...prev, ...newItems]);
    toast.success(`Queued ${newFiles.length} new gallery image${newFiles.length === 1 ? "" : "s"}.`);
  };

  const handleRemoveStagedGalleryFile = (id: string) => {
    setStagedGalleryFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleCoverAssignment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleCatalogUpdateMutation = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setNurseryLoading(true));
    const mutationToast = toast.loading("Syncing modified accessory specifications across database...");

    try {
      const formData = new FormData();

      const accessoryDataJson = {
        name,
        description,
        specifications: {
          brand: brand.trim() || "Generic",
          weight: weight.trim() || undefined,
          material: material.trim() || undefined,
          capacity: capacity.trim() || undefined,
          dimensions: dimensions.trim() || undefined,
        },
        descriptionOption: {
          short: shortDesc,
          points: points.filter(p => p.trim() !== ""),
        },
        benefits: benefits.filter(b => b.trim() !== ""),
        price: Number(price),
        discountPrice: discountPrice !== "" ? Number(discountPrice) : 0,
        stock: Number(stock),
        category,
        ...(metaTitle ? { metaTitle } : {}),
        ...(metaDescription ? { metaDescription } : {}),
      };

      formData.append("accessoryData", JSON.stringify(accessoryDataJson));

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      // Append explicit deleted image public IDs for Cloudinary garbage collection
      if (deletedImagePublicIds.length > 0) {
        formData.append("deletedImagePublicIds", JSON.stringify(deletedImagePublicIds));
      }

      // Append preserved existing gallery images
      formData.append("existingImages", JSON.stringify(existingGalleryImages));

      // Append newly staged gallery images (both keys for broad backend compatibility)
      stagedGalleryFiles.forEach((item) => {
        formData.append("images", item.file);
        formData.append("galleryImages", item.file);
      });

      const response = await nurseryService.updateAccessoryAsset(accId, formData);
      dispatch(updateAccessoryInNurseryState(response.accessory));

      toast.success("Accessory metrics matrix altered successfully!", { id: mutationToast });
      router.push("/nursery/accessories");
    } catch (err: any) {
      const errMsg = err?.message || "Internal accessory mutator parsing runtime crash.";
      dispatch(setNurseryError(errMsg));
      toast.error(errMsg, { id: mutationToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/nursery/accessories" className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            <Sliders className="text-blue-600 w-5 h-5" />
            <span>Modify Accessory/Tool Specifications</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">Re-indexing payload configurations for document reference: <span className="font-mono font-bold text-slate-700">{accId}</span></p>
        </div>
      </div>

      <form onSubmit={handleCatalogUpdateMutation} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Accessory Identity Asset Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Utility Mapping Category Option</label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all cursor-pointer">
              <option value="" disabled hidden>Select inventory category standard...</option>
              {AVAILABLE_ACCESSORY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Price Value (INR)</label>
            <input type="number" required value={price} onChange={(e) => setPrice(e.target.value !== "" ? Number(e.target.value) : "")} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Discount Price (INR) <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="₹ 0 (leave blank if no discount)" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Stock Storage Units</label>
            <input type="number" required value={stock} onChange={(e) => setStock(e.target.value !== "" ? Number(e.target.value) : "")} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all" />
          </div>
        </div>

        {/* Accessory Specifications Block */}
        <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider m-0">Technical Specifications Matrix</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Brand Designation</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Generic" className="px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 outline-hidden transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Material Composition</label>
              <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g., Stainless Steel, High-Density Plastic" className="px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 outline-hidden transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Weight Metric</label>
              <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g., 450g, 1.2kg" className="px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 outline-hidden transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Volumetric Capacity (If Applicable)</label>
              <input type="text" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g., 5 Liters, 10 KG" className="px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 outline-hidden transition-all" />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Dimensions / Sizing (If Applicable)</label>
              <input type="text" value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="e.g., 25cm x 15cm x 10cm" className="px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 outline-hidden transition-all" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Short Summary Overview Flag</label>
          <input type="text" required value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Extended Explanatory Description Logs</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all resize-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Highlight Features Points</label>
              <button type="button" onClick={() => addArrayNode("points")} className="text-[11px] font-bold text-blue-700 flex items-center gap-1 bg-transparent border-0 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Insert Row</button>
            </div>
            {points.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="text" required value={p} onChange={(e) => handleArrayStringChange(idx, e.target.value, "points")} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-hidden" />
                {points.length > 1 && <button type="button" onClick={() => removeArrayNode(idx, "points")} className="p-2 border-0 text-slate-400 hover:text-red-500 bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Utility Application Benefits</label>
              <button type="button" onClick={() => addArrayNode("benefits")} className="text-[11px] font-bold text-blue-700 flex items-center gap-1 bg-transparent border-0 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Insert Row</button>
            </div>
            {benefits.map((b, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="text" required value={b} onChange={(e) => handleArrayStringChange(idx, e.target.value, "benefits")} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-hidden" />
                {benefits.length > 1 && <button type="button" onClick={() => removeArrayNode(idx, "benefits")} className="p-2 border-0 text-slate-400 hover:text-red-500 bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
          </div>
        </div>

        {/* SEO Meta Fields */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">SEO Metadata (Optional)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="SEO meta title..."
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Meta Description</label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO meta description..."
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-b border-slate-100 py-6 max-w-sm">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Replace Primary Cover Image</label>
          <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-600 rounded-xl p-4 transition-colors bg-slate-50/30 min-h-[140px] flex items-center justify-center">
            {coverPreview || existingCoverUrl ? (
              <div className="relative w-full h-[120px] rounded-lg overflow-hidden border border-slate-100 shadow-inner">
                <Image src={coverPreview || existingCoverUrl} alt="Tool matrix tracking blueprint" fill sizes="(max-width: 768px) 100vw, 384px" className="object-cover" />
                <label htmlFor="editCoverFileNode" className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors">Replace Binary</label>
              </div>
            ) : (
              <label htmlFor="editCoverFileNode" className="flex flex-col items-center justify-center cursor-pointer text-center w-full">
                <ImageIcon className="w-7 h-7 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">Re-upload file stream</span>
              </label>
            )}
            <input id="editCoverFileNode" type="file" accept="image/*" className="hidden" onChange={handleCoverAssignment} />
          </div>
        </div>

        {/* Multi-Angle Showcase Gallery Cluster Management */}
        <ProductGalleryManager
          existingImages={existingGalleryImages}
          onRemoveExisting={handleRemoveExistingGalleryImage}
          onReplaceExisting={handleReplaceExistingGalleryImage}
          stagedImages={stagedGalleryFiles}
          onAddStagedFiles={handleAddStagedGalleryFiles}
          onRemoveStaged={handleRemoveStagedGalleryFile}
          maxImages={10}
          disabled={isLoading}
          deletedCount={deletedImagePublicIds.length}
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-700 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4">
          <button type="button" onClick={() => router.push("/nursery/accessories")} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer">Cancel Mutations</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl border-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Commit Specification Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}