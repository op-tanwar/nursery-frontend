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
  updatePotInNurseryState
} from "@/redux/slices/nurserySlice";
import { nurseryService } from "@/services/nurseryService";
import { potService } from "@/services/potService";
import {
  ProductGalleryManager,
  IGalleryImageItem,
  IStagedGalleryFile,
} from "@/components/nursery/ProductGalleryManager";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Loader2, Archive, Save, AlertCircle } from "lucide-react";

// Standardized categories matching pot model and catalog
export const AVAILABLE_POT_CATEGORIES = [
  "Ceramic Pots",
  "Terracotta & Clay Planters",
  "Plastic & Resin Pots",
  "Metal Planters",
  "Hanging Planters & Baskets",
  "Wooden & Bamboo Pots",
  "Indoor Pots",
  "Outdoor Pots"
];

export default function EditPotConfigurationPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const potId = params.id as string;

  const { isLoading, error } = useAppSelector((state) => state.nursery);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");

  // Required Pot model attributes
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [height, setHeight] = useState("");
  const [diameter, setDiameter] = useState("");
  const [shape, setShape] = useState("");
  const [hasDrainageHole, setHasDrainageHole] = useState(false);
  const [isIndoorOutdoor, setIsIndoorOutdoor] = useState("Both");
  const [includesSaucer, setIncludesSaucer] = useState(false);

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
    const fetchPotDataNode = async () => {
      dispatch(setNurseryLoading(true));
      try {
        let targetedPot: any = null;
        try {
          const directRes = await potService.getPotDetails(`${potId}?t=${Date.now()}`);
          targetedPot = directRes?.pot || directRes?.data;
        } catch {
          // fallback to inventory list
        }

        if (!targetedPot) {
          const response = await nurseryService.getMyPots();
          const potList = response?.pots || [];
          targetedPot = potList.find((p: any) => p._id === potId);
        }

        if (!targetedPot) {
          throw new Error("Targeted planter inventory document node not found.");
        }

        setName(targetedPot.name || "");
        setDescription(targetedPot.description || "");
        setCategory(targetedPot.category || "");
        setPrice(targetedPot.price ?? "");
        setDiscountPrice(targetedPot.discountPrice ?? "");
        setStock(targetedPot.stock ?? "");
        setMaterial(targetedPot.material || "");
        setColor(Array.isArray(targetedPot.color) ? targetedPot.color[0] || "" : targetedPot.color || "");
        setHeight(targetedPot.dimensions?.height || "");
        setDiameter(targetedPot.dimensions?.diameter || "");
        setShape(targetedPot.shape || "");
        setHasDrainageHole(targetedPot.hasDrainageHole === true || targetedPot.hasDrainageHole === "true");
        setIsIndoorOutdoor(targetedPot.isIndoorOutdoor || "Both");
        setIncludesSaucer(targetedPot.includesSaucer === true || targetedPot.includesSaucer === "true");
        setMetaTitle(targetedPot.metaTitle || "");
        setMetaDescription(targetedPot.metaDescription || "");
        setShortDesc(targetedPot.descriptionOption?.short || "");
        setExistingCoverUrl(targetedPot.coverImage?.url || "");
        setExistingGalleryImages(Array.isArray(targetedPot.images) ? targetedPot.images : []);

        if (targetedPot.descriptionOption?.points?.length) setPoints(targetedPot.descriptionOption.points);
        if (targetedPot.benefits?.length) setBenefits(targetedPot.benefits);

        dispatch(setNurseryLoading(false));
      } catch (err: any) {
        const errMsg = err?.message || "Failed parsing target pot data node stream.";
        dispatch(setNurseryError(errMsg));
        toast.error(errMsg);
      }
    };

    if (potId) fetchPotDataNode();
  }, [potId, dispatch]);

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
    const mutationToast = toast.loading("Syncing modified planter specifications across database...");

    try {
      const formData = new FormData();

      const potDataJson = {
        name,
        description,
        material,
        color: color.trim() !== "" ? [color.trim()] : [category || "Standard"],
        dimensions: {
          height: height.trim(),
          diameter: diameter.trim(),
        },
        descriptionOption: {
          short: shortDesc,
          points: points.filter((p) => p.trim() !== ""),
        },
        benefits: benefits.filter((b) => b.trim() !== ""),
        price: Number(price),
        discountPrice: discountPrice !== "" ? Number(discountPrice) : 0,
        stock: Number(stock),
        category,
        ...(shape ? { shape } : {}),
        hasDrainageHole,
        isIndoorOutdoor,
        includesSaucer,
        ...(metaTitle ? { metaTitle } : {}),
        ...(metaDescription ? { metaDescription } : {}),
      };

      formData.append("potData", JSON.stringify(potDataJson));

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

      const response = await nurseryService.updatePotAsset(potId, formData);
      dispatch(updatePotInNurseryState(response.pot));

      toast.success("Planter metrics matrix altered successfully!", { id: mutationToast });
      router.push("/nursery/pots");
    } catch (err: any) {
      const errMsg = err?.message || "Internal mutator parsing runtime crash.";
      dispatch(setNurseryError(errMsg));
      toast.error(errMsg, { id: mutationToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/nursery/pots" className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            <Archive className="text-amber-600 w-5 h-5" />
            <span>Modify Planter Listing Specifications</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">Re-indexing payload configurations for document reference: <span className="font-mono font-bold text-slate-700">{potId}</span></p>
        </div>
      </div>

      <form onSubmit={handleCatalogUpdateMutation} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Planter / Pot Variant Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Store Category Mapping Option</label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all cursor-pointer">
              <option value="" disabled hidden>Select catalog category standard...</option>
              {AVAILABLE_POT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Material Type (Required) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Material Composition (Required)</label>
            <input type="text" required value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g., Ceramic, Terracotta, Plastic" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          {/* Color Specs */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Primary Color Tag</label>
            <input type="text" required value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g., Terracotta Red, Matte Black" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          {/* Height */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Pot Height Metric (Required)</label>
            <input type="text" required value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g., 6 inches, 15 cm" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          {/* Diameter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Pot Diameter Metric (Required)</label>
            <input type="text" required value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder="e.g., 8 inches, 20 cm" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Price Value (INR)</label>
            <input type="number" required value={price} onChange={(e) => setPrice(e.target.value !== "" ? Number(e.target.value) : "")} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Discount Price (INR) <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="₹ 0 (leave blank if no discount)" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Stock Storage Units</label>
            <input type="number" required value={stock} onChange={(e) => setStock(e.target.value !== "" ? Number(e.target.value) : "")} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Pot Shape</label>
            <select value={shape} onChange={(e) => setShape(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all cursor-pointer">
              <option value="">Select shape...</option>
              <option value="Round">Round</option>
              <option value="Square">Square</option>
              <option value="Rectangular">Rectangular</option>
              <option value="Hexagonal">Hexagonal</option>
              <option value="Cylindrical">Cylindrical</option>
              <option value="Oval">Oval</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Usage Environment</label>
            <select value={isIndoorOutdoor} onChange={(e) => setIsIndoorOutdoor(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all cursor-pointer">
              <option value="Both">Indoor & Outdoor</option>
              <option value="Indoor">Indoor Only</option>
              <option value="Outdoor">Outdoor Only</option>
            </select>
          </div>

          <div className="flex items-center gap-6 mt-4 md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={hasDrainageHole}
                onChange={(e) => setHasDrainageHole(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span>🕳️ Has Drainage Hole</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={includesSaucer}
                onChange={(e) => setIncludesSaucer(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span>🪴 Includes Saucer/Plate</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Short Summary Overview Flag</label>
          <input type="text" required value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Extended Explanatory Description Logs</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all resize-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Highlight Features Points</label>
              <button type="button" onClick={() => addArrayNode("points")} className="text-[11px] font-bold text-amber-700 flex items-center gap-1 bg-transparent border-0 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Insert Row</button>
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
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Durability & Structural Benefits</label>
              <button type="button" onClick={() => addArrayNode("benefits")} className="text-[11px] font-bold text-amber-700 flex items-center gap-1 bg-transparent border-0 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Insert Row</button>
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Meta Description</label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO meta description..."
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-b border-slate-100 py-6 max-w-sm">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Replace Primary Cover Image</label>
          <div className="relative border-2 border-dashed border-slate-200 hover:border-amber-600 rounded-xl p-4 transition-colors bg-slate-50/30 min-h-[140px] flex items-center justify-center">
            {coverPreview || existingCoverUrl ? (
              <div className="relative w-full h-[120px] rounded-lg overflow-hidden border border-slate-100 shadow-inner">
                <Image src={coverPreview || existingCoverUrl} alt="Planter layout tracking blueprint" fill sizes="(max-width: 768px) 100vw, 384px" className="object-cover" />
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
          <button type="button" onClick={() => router.push("/nursery/pots")} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer">Cancel Mutations</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl border-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Commit Specification Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}