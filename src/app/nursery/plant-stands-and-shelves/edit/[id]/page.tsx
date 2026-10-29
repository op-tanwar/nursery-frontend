"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setNurseryLoading, setNurseryError } from "@/redux/slices/nurserySlice";
import { plantStandsShelvesService } from "@/services/plantStandsShelvesService";
import {
  ProductGalleryManager,
  IGalleryImageItem,
  IStagedGalleryFile,
} from "@/components/nursery/ProductGalleryManager";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Loader2, Layers, Save, AlertCircle } from "lucide-react";

const STAND_CATEGORIES = [
  "Metal Stands",
  "Wooden & Bamboo Shelves",
  "Multi-Tiered Units",
  "Multi-Tier Shelves",
  "Single Pot Stands",
  "Hanging Wall Racks",
  "Hanging Planters & Hooks",
  "Corner Stands",
  "Desk & Tabletop Stands",
  "Window Shelves"
];

export default function EditStandsShelvesPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const standId = params.id as string;

  const { isLoading, error } = useAppSelector((state) => state.nursery);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [material, setMaterial] = useState("");
  const [maxLoadCapacity, setMaxLoadCapacity] = useState<number | "">("");
  const [dimHeight, setDimHeight] = useState("");
  const [dimWidth, setDimWidth] = useState("");
  const [dimLength, setDimLength] = useState("");
  const [tierCount, setTierCount] = useState<number | "">(1);
  const [points, setPoints] = useState<string[]>([""]);
  const [features, setFeatures] = useState<string[]>([""]);

  // SEO States
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [existingCoverUrl, setExistingCoverUrl] = useState<string>("");

  // Gallery Management States
  const [existingGalleryImages, setExistingGalleryImages] = useState<IGalleryImageItem[]>([]);
  const [stagedGalleryFiles, setStagedGalleryFiles] = useState<IStagedGalleryFile[]>([]);
  const [deletedImagePublicIds, setDeletedImagePublicIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchStandData = async () => {
      dispatch(setNurseryLoading(true));
      try {
        const response = await plantStandsShelvesService.getPlantStandsShelvesDetails(`${standId}?t=${Date.now()}`);
        const item = response.plantStandsShelves || response?.data || response;

        setName(item.name || "");
        setDescription(item.description || "");
        setShortDesc(item.descriptionOption?.short || "");
        setCategory(item.category || "");
        setPrice(item.price || "");
        setDiscountPrice(item.discountPrice || "");
        setStock(item.stock || "");
        setMaterial(item.material || "");
        setMaxLoadCapacity(item.maxLoadCapacity || "");
        setTierCount(item.tierCount ?? 1);
        setMetaTitle(item.metaTitle || "");
        setMetaDescription(item.metaDescription || "");
        setExistingCoverUrl(item.coverImage?.url || "");
        setExistingGalleryImages(Array.isArray(item.images) ? item.images : []);

        if (item.dimensions && typeof item.dimensions === "object") {
          setDimHeight(item.dimensions.height || "");
          setDimWidth(item.dimensions.width || "");
          setDimLength(item.dimensions.length || "");
        } else if (typeof item.dimensions === "string") {
          setDimHeight(item.dimensions);
        }

        if (item.descriptionOption?.points?.length) setPoints(item.descriptionOption.points);
        if (item.features?.length) setFeatures(item.features);

        dispatch(setNurseryLoading(false));
      } catch (err: any) {
        const errMsg = err?.message || "Failed to load stand details.";
        dispatch(setNurseryError(errMsg));
        toast.error(errMsg);
      }
    };

    if (standId) fetchStandData();
  }, [standId, dispatch]);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleFeatureChange = (index: number, val: string) => {
    const clone = [...features];
    clone[index] = val;
    setFeatures(clone);
  };

  const addFeatureRow = () => setFeatures([...features, ""]);
  const removeFeatureRow = (index: number) => {
    if (features.length > 1) setFeatures(features.filter((_, i) => i !== index));
  };

  const handlePointChange = (index: number, val: string) => {
    const clone = [...points];
    clone[index] = val;
    setPoints(clone);
  };

  const addPointRow = () => setPoints([...points, ""]);
  const removePointRow = (index: number) => {
    if (points.length > 1) setPoints(points.filter((_, i) => i !== index));
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
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setNurseryLoading(true));
    const loadingToast = toast.loading("Updating stand/shelf entry...");

    try {
      const formData = new FormData();
      const featureLines = features.filter((f) => f.trim() !== "");
      const fullDescription = featureLines.length
        ? `${description}\n\nFeatures:\n${featureLines.map((f, i) => `${i + 1}. ${f}`).join("\n")}`
        : description;

      const plantStandsShelvesData = {
        name,
        description: fullDescription,
        descriptionOption: {
          short: shortDesc,
          points: points.filter((p) => p.trim() !== ""),
        },
        material,
        dimensions: {
          height: dimHeight,
          width: dimWidth,
          length: dimLength,
        },
        tierCount: tierCount !== "" ? Number(tierCount) : 1,
        ...(maxLoadCapacity !== "" ? { maxLoadCapacity: Number(maxLoadCapacity) } : {}),
        price: Number(price),
        discountPrice: discountPrice !== "" ? Number(discountPrice) : 0,
        category,
        stock: Number(stock),
        ...(metaTitle ? { metaTitle } : {}),
        ...(metaDescription ? { metaDescription } : {}),
      };

      formData.append("plantStandsShelvesData", JSON.stringify(plantStandsShelvesData));
      if (coverImage) formData.append("coverImage", coverImage);

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

      await plantStandsShelvesService.updatePlantStandsShelves(standId, formData);
      toast.success("Stand/Shelf details saved!", { id: loadingToast });
      router.push("/nursery/plant-stands-and-shelves");
    } catch (err: any) {
      const errMsg = err?.message || "Failed to update stand/shelf asset.";
      dispatch(setNurseryError(errMsg));
      toast.error(errMsg, { id: loadingToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/nursery/plant-stands-and-shelves" className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            <Layers className="text-indigo-600 w-5 h-5" />
            <span>Edit Stand or Shelf Listing</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">Reference ID: <span className="font-mono font-bold text-slate-700">{standId}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Product Title</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Category</label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all cursor-pointer">
              <option value="" disabled hidden>Select structure type...</option>
              {STAND_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Price (INR)</label>
            <input type="number" required value={price} onChange={(e) => setPrice(e.target.value !== "" ? Number(e.target.value) : "")} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Discount Price (INR) <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="₹ 0 (leave blank if no discount)" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Units Available</label>
            <input type="number" required value={stock} onChange={(e) => setStock(e.target.value !== "" ? Number(e.target.value) : "")} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Material</label>
            <input type="text" required value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g., Wrought Iron, Bamboo" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Tier Count</label>
            <input type="number" min={1} required value={tierCount} onChange={(e) => setTierCount(e.target.value !== "" ? Number(e.target.value) : "")} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Max Load Capacity (KG)</label>
            <input type="number" min={1} value={maxLoadCapacity} onChange={(e) => setMaxLoadCapacity(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="e.g., 50" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Short Summary Overview (Tagline)</label>
          <input type="text" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Provide catchy 1-liner summary snapshot..." className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Product Description</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all resize-none" />
        </div>

        {/* Dynamic Highlight Points */}
        <div className="space-y-2 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Highlight Features Points</label>
            <button type="button" onClick={addPointRow} className="text-[11px] font-bold text-indigo-700 flex items-center gap-1 bg-transparent border-0 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Point</button>
          </div>
          {points.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="text" value={p} onChange={(e) => handlePointChange(idx, e.target.value)} placeholder="Key highlight..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-none" />
              {points.length > 1 && <button type="button" onClick={() => removePointRow(idx)} className="p-2 border-0 text-slate-400 hover:text-red-500 bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
            </div>
          ))}
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Meta Description</label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO meta description..."
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Height</label>
            <input type="text" value={dimHeight} onChange={(e) => setDimHeight(e.target.value)} placeholder="e.g., 120cm" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Width</label>
            <input type="text" value={dimWidth} onChange={(e) => setDimWidth(e.target.value)} placeholder="e.g., 40cm" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Length</label>
            <input type="text" value={dimLength} onChange={(e) => setDimLength(e.target.value)} placeholder="e.g., 30cm" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Description</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all resize-none" />
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Product Highlights / Design Features</label>
            <button type="button" onClick={addFeatureRow} className="text-[11px] font-bold text-indigo-700 flex items-center gap-1 bg-transparent border-0 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Feature</button>
          </div>
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="text" required value={feat} onChange={(e) => handleFeatureChange(idx, e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-none" />
              {features.length > 1 && <button type="button" onClick={() => removeFeatureRow(idx)} className="p-2 border-0 text-slate-400 hover:text-red-500 bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-b border-slate-100 py-6 max-w-sm">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Product Cover Image</label>
          <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-600 rounded-xl p-4 transition-colors bg-slate-50/30 min-h-[140px] flex items-center justify-center">
            {coverPreview || existingCoverUrl ? (
              <div className="relative w-full h-[120px] rounded-lg overflow-hidden border border-slate-100 shadow-inner">
                <Image src={coverPreview || existingCoverUrl} alt="Stand preview" fill sizes="(max-width: 768px) 100vw, 384px" className="object-cover" />
                <label htmlFor="standCoverInput" className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors">Change Image</label>
              </div>
            ) : (
              <label htmlFor="standCoverInput" className="flex flex-col items-center justify-center cursor-pointer text-center w-full">
                <ImageIcon className="w-7 h-7 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">Upload Image File</span>
              </label>
            )}
            <input id="standCoverInput" type="file" accept="image/*" className="hidden" onChange={handleCoverAssignment} />
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
          <button type="button" onClick={() => router.push("/nursery/plant-stands-and-shelves")} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl border-0 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Unit Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
