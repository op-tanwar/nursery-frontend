"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setNurseryLoading, setNurseryError } from "@/redux/slices/nurserySlice";
import { gardeningToolService } from "@/services/gardeningToolsService";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Loader2, Wrench, CheckCircle } from "lucide-react";

const TOOL_CATEGORIES = [
  "Hand Tools",
  "Watering Equipment",
  "Pruning & Cutting Tools",
  "Pruning Tools",
  "Digging & Cultivating",
  "Digging Tools",
  "Protective Gear",
  "Power Tools"
];
const MATERIAL_OPTIONS = ["Stainless Steel", "Carbon Steel", "Plastic", "Wood", "Aluminum", "Rubber"];

export default function CreateGardeningToolPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.nursery);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [material, setMaterial] = useState("");
  const [handleMaterial, setHandleMaterial] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState<number | "">("");

  const [points, setPoints] = useState<string[]>([""]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [usageTips, setUsageTips] = useState<string[]>([""]);

  // SEO States
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const handleArrayChange = (index: number, val: string, type: "features" | "tips" | "points") => {
    if (type === "points") { const arr = [...points]; arr[index] = val; setPoints(arr); }
    if (type === "features") { const arr = [...features]; arr[index] = val; setFeatures(arr); }
    if (type === "tips") { const arr = [...usageTips]; arr[index] = val; setUsageTips(arr); }
  };

  const addArrayNode = (type: "features" | "tips" | "points") => {
    if (type === "points") setPoints([...points, ""]);
    if (type === "features") setFeatures([...features, ""]);
    if (type === "tips") setUsageTips([...usageTips, ""]);
  };

  const removeArrayNode = (index: number, type: "features" | "tips" | "points") => {
    if (type === "points" && points.length > 1) setPoints(points.filter((_, i) => i !== index));
    if (type === "features" && features.length > 1) setFeatures(features.filter((_, i) => i !== index));
    if (type === "tips" && usageTips.length > 1) setUsageTips(usageTips.filter((_, i) => i !== index));
  };

  const handleCoverAssignment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setCoverImage(file); setCoverPreview(URL.createObjectURL(file)); }
  };

  const handleGalleryAddition = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setGalleryImages((prev) => [...prev, ...selected]);
      setGalleryPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage) {
      toast.error("Please attach a primary cover image.");
      return;
    }

    dispatch(setNurseryLoading(true));
    const loadingToast = toast.loading("Adding gardening tool to marketplace...");

    try {
      const formData = new FormData();
      const mergedFeatures = [
        ...features.filter((f) => f.trim() !== ""),
        ...usageTips.filter((t) => t.trim() !== ""),
      ];
      const toolDataJson = {
        name,
        description,
        descriptionOption: {
          short: shortDesc,
          points: points.filter((p) => p.trim() !== ""),
        },
        category,
        price: Number(price),
        discountPrice: discountPrice !== "" ? Number(discountPrice) : 0,
        stock: Number(stock),
        material,
        ...(handleMaterial ? { handleMaterial } : {}),
        features: mergedFeatures,
        ...(warrantyMonths !== "" ? { warrantyMonths: Number(warrantyMonths) } : {}),
        ...(metaTitle ? { metaTitle } : {}),
        ...(metaDescription ? { metaDescription } : {}),
      };

      formData.append("gardeningToolData", JSON.stringify(toolDataJson));
      formData.append("coverImage", coverImage);
      galleryImages.forEach((file) => formData.append("images", file));

      await gardeningToolService.createGardeningTool(formData);
      toast.success("Gardening tool added successfully!", { id: loadingToast });
      router.push("/nursery/gardening-tools");
    } catch (err: any) {
      const msg = err?.message || "Failed to create gardening tool.";
      dispatch(setNurseryError(msg));
      toast.error(msg, { id: loadingToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/nursery/gardening-tools" className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            <Wrench className="text-emerald-600 w-5 h-5" />
            <span>Add Gardening Tool</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">Create a new entry for durable gardening equipment and tools.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Tool Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Heavy-Duty Bypass Pruner" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Category</label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all">
              <option value="" disabled hidden>Select Category...</option>
              {TOOL_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Primary Material</label>
            <select required value={material} onChange={(e) => setMaterial(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all">
              <option value="" disabled hidden>Select Material...</option>
              {MATERIAL_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Handle Material <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="text" value={handleMaterial} onChange={(e) => setHandleMaterial(e.target.value)} placeholder="e.g., Ergonomic Rubber, Ash Wood" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Warranty (Months)</label>
            <input type="number" min={0} value={warrantyMonths} onChange={(e) => setWarrantyMonths(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="e.g., 12" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Price (INR)</label>
            <input type="number" required value={price} onChange={(e) => setPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="₹ Price" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Discount Price (INR) <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="₹ 0 (leave blank if no discount)" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Stock Units</label>
            <input type="number" required value={stock} onChange={(e) => setStock(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="Stock quantity" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Short Summary Overview (Tagline)</label>
          <input type="text" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Provide catchy 1-liner summary snapshot..." className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Detailed Description</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide full detail on build quality, ergonomic design..." className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all resize-none" />
        </div>

        {/* Dynamic Lists */}
        <div className="space-y-2 border-b border-slate-100 pb-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Highlight Features Points</label>
            <button type="button" onClick={() => addArrayNode("points")} className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-transparent border-none cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Point</button>
          </div>
          {points.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="text" value={p} onChange={(e) => handleArrayChange(idx, e.target.value, "points")} placeholder="Key highlight or design benefit..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600" />
              {points.length > 1 && <button type="button" onClick={() => removeArrayNode(idx, "points")} className="p-2 border-0 text-slate-400 hover:text-red-500 bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Key Features</label>
              <button type="button" onClick={() => addArrayNode("features")} className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-transparent border-none cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add</button>
            </div>
            {features.map((f, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="text" required value={f} onChange={(e) => handleArrayChange(idx, e.target.value, "features")} placeholder="e.g., Rust-resistant coating" className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600" />
                {features.length > 1 && <button type="button" onClick={() => removeArrayNode(idx, "features")} className="p-2 border-0 text-slate-400 hover:text-red-500 bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Usage & Maintenance Tips</label>
              <button type="button" onClick={() => addArrayNode("tips")} className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-transparent border-none cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add</button>
            </div>
            {usageTips.map((t, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="text" required value={t} onChange={(e) => handleArrayChange(idx, e.target.value, "tips")} placeholder="e.g., Clean and oil blade after use" className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600" />
                {usageTips.length > 1 && <button type="button" onClick={() => removeArrayNode(idx, "tips")} className="p-2 border-0 text-slate-400 hover:text-red-500 bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Meta Description</label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO meta description..."
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-slate-100 py-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Main Cover Image</label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-600 rounded-xl p-4 transition-colors flex flex-col items-center justify-center bg-slate-50/30 min-h-[140px]">
              {coverPreview ? (
                <div className="relative w-full h-[120px] rounded-lg overflow-hidden border border-slate-100">
                  <Image src={coverPreview} alt="Cover preview" fill sizes="(max-width: 768px) 100vw, 500px" className="object-cover" />
                  <label htmlFor="coverFile" className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md cursor-pointer">Change Image</label>
                </div>
              ) : (
                <label htmlFor="coverFile" className="flex flex-col items-center justify-center cursor-pointer text-center w-full h-full p-2">
                  <ImageIcon className="w-7 h-7 text-slate-400 mb-2 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">Upload Cover Image</span>
                </label>
              )}
              <input id="coverFile" type="file" accept="image/*" className="hidden" onChange={handleCoverAssignment} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Gallery Images ({galleryImages.length})</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-600 rounded-xl p-4 transition-colors bg-slate-50/30 min-h-[140px]">
              <label htmlFor="galleryFiles" className="flex items-center justify-center gap-2 cursor-pointer border border-slate-200 bg-white py-2 rounded-lg text-xs font-bold text-slate-700 w-full mb-3">
                <Plus className="w-4 h-4 text-slate-500" />
                <span>Add Gallery Images</span>
              </label>
              <input id="galleryFiles" type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryAddition} />

              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                {galleryPreviews.map((src, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-white">
                    <Image src={src} alt="Gallery item" fill sizes="56px" className="object-cover" />
                    <button type="button" onClick={() => { setGalleryImages(galleryImages.filter((_, i) => i !== idx)); setGalleryPreviews(galleryPreviews.filter((_, i) => i !== idx)); }} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-bold">{error}</div>}

        <div className="flex items-center justify-end gap-3 pt-4">
          <button type="button" onClick={() => router.push("/nursery/gardening-tools")} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl border-0 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer flex items-center gap-2 disabled:opacity-60">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            <span>Save Gardening Tool</span>
          </button>
        </div>
      </form>
    </div>
  );
}