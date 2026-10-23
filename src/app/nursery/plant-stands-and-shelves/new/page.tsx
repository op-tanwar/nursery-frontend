"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setNurseryLoading, setNurseryError } from "@/redux/slices/nurserySlice";
import { plantStandsShelvesService } from "@/services/plantStandsShelvesService";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Loader2, Layers, CheckCircle } from "lucide-react";

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
const MATERIALS = ["Wrought Iron", "Wood / Bamboo", "Stainless Steel", "Engineered Wood", "Plastic Blend"];

export default function CreatePlantStandsShelvesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.nursery);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [category, setCategory] = useState("");
  const [material, setMaterial] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [tierCount, setTierCount] = useState<number | "">(1);
  const [weightCapacityKg, setWeightCapacityKg] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");

  const [points, setPoints] = useState<string[]>([""]);
  const [assemblyInstructions, setAssemblyInstructions] = useState<string[]>([""]);

  // SEO States
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const handleStepChange = (index: number, val: string) => {
    const arr = [...assemblyInstructions];
    arr[index] = val;
    setAssemblyInstructions(arr);
  };

  const addStep = () => setAssemblyInstructions([...assemblyInstructions, ""]);
  const removeStep = (index: number) => {
    if (assemblyInstructions.length > 1) setAssemblyInstructions(assemblyInstructions.filter((_, i) => i !== index));
  };

  const handlePointChange = (index: number, val: string) => {
    const arr = [...points];
    arr[index] = val;
    setPoints(arr);
  };

  const addPoint = () => setPoints([...points, ""]);
  const removePoint = (index: number) => {
    if (points.length > 1) setPoints(points.filter((_, i) => i !== index));
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
      toast.error("Please select a main cover image.");
      return;
    }

    dispatch(setNurseryLoading(true));
    const loadingToast = toast.loading("Deploying plant stand asset...");

    try {
      const formData = new FormData();
      const steps = assemblyInstructions.filter((a) => a.trim() !== "");
      let fullDescription = description;
      if (weightCapacityKg !== "") {
        fullDescription += `\n\nMax weight capacity: ${weightCapacityKg} kg`;
      }
      if (steps.length) {
        fullDescription += `\n\nAssembly:\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
      }

      const dimParts = dimensions.split(/[xX*]/).map((p) => p.trim());
      const dimObj = dimParts.length === 3
        ? { length: dimParts[0], width: dimParts[1], height: dimParts[2] }
        : { height: dimensions, width: "", length: "" };

      const standDataJson = {
        name,
        description: fullDescription,
        descriptionOption: {
          short: shortDesc,
          points: points.filter((p) => p.trim() !== ""),
        },
        material,
        dimensions: dimObj,
        tierCount: tierCount !== "" ? Number(tierCount) : 1,
        ...(weightCapacityKg !== "" ? { maxLoadCapacity: Number(weightCapacityKg) } : {}),
        price: Number(price),
        discountPrice: discountPrice !== "" ? Number(discountPrice) : 0,
        stock: Number(stock),
        category,
        ...(metaTitle ? { metaTitle } : {}),
        ...(metaDescription ? { metaDescription } : {}),
      };

      formData.append("plantStandsShelvesData", JSON.stringify(standDataJson));
      formData.append("coverImage", coverImage);
      galleryImages.forEach((file) => formData.append("images", file));

      await plantStandsShelvesService.createPlantStandsShelves(formData);
      toast.success("Plant Stand asset deployed successfully!", { id: loadingToast });
      router.push("/nursery/plant-stands-and-shelves");
    } catch (err: any) {
      const msg = err?.message || "Failed to create plant stand record.";
      dispatch(setNurseryError(msg));
      toast.error(msg, { id: loadingToast });
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
            <Layers className="text-amber-600 w-5 h-5" />
            <span>Add Plant Stand or Shelf</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">Ingestion setup for plant holders, multi-tier racks, and wooden stands.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Product Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., 4-Tier Metal Plant Display Stand" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Category</label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all">
              <option value="" disabled hidden>Select Category...</option>
              {STAND_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Material Built</label>
            <select required value={material} onChange={(e) => setMaterial(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all">
              <option value="" disabled hidden>Select Material...</option>
              {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Dimensions (L x W x H in inches/cm)</label>
            <input type="text" required value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="e.g., 60cm x 30cm x 120cm" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Number of Tiers / Shelves</label>
            <input type="number" min={1} value={tierCount} onChange={(e) => setTierCount(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="e.g., 3" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Max Weight Capacity (KG)</label>
            <input type="number" required min={1} value={weightCapacityKg} onChange={(e) => setWeightCapacityKg(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="e.g., 45" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Price (INR)</label>
            <input type="number" required value={price} onChange={(e) => setPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="₹ Price" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Discount Price (INR) <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="₹ 0 (leave blank if no discount)" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Stock Available</label>
            <input type="number" required value={stock} onChange={(e) => setStock(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="Stock units" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Short Summary Overview (Tagline)</label>
          <input type="text" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Provide catchy 1-liner summary snapshot..." className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Product Description</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Finish quality, weather resistance, indoor/outdoor suitability..." className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all resize-none" />
        </div>

        {/* Dynamic Highlight Points */}
        <div className="space-y-2 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Highlight Features Points</label>
            <button type="button" onClick={addPoint} className="text-[11px] font-bold text-amber-700 flex items-center gap-1 bg-transparent border-none cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Point</button>
          </div>
          {points.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="text" value={p} onChange={(e) => handlePointChange(idx, e.target.value)} placeholder="Key feature or aesthetic highlight..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600" />
              {points.length > 1 && <button type="button" onClick={() => removePoint(idx)} className="p-2 border-0 text-slate-400 hover:text-red-500 bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Assembly Instructions / DIY Steps</label>
            <button type="button" onClick={addStep} className="text-[11px] font-bold text-amber-700 flex items-center gap-1 bg-transparent border-none cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Step</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assemblyInstructions.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="text" required value={step} onChange={(e) => handleStepChange(idx, e.target.value)} placeholder={`Step ${idx + 1}: Tighten frame bolts...`} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600" />
                {assemblyInstructions.length > 1 && <button type="button" onClick={() => removeStep(idx)} className="p-2 border-0 text-slate-400 hover:text-red-500 bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-slate-100 py-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Primary Display Image</label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-amber-600 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/30 min-h-[140px]">
              {coverPreview ? (
                <div className="relative w-full h-[120px] rounded-lg overflow-hidden border border-slate-100">
                  <Image src={coverPreview} alt="Cover preview" fill sizes="(max-width: 768px) 100vw, 500px" className="object-cover" />
                  <label htmlFor="coverFile" className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-md cursor-pointer">Change Image</label>
                </div>
              ) : (
                <label htmlFor="coverFile" className="flex flex-col items-center justify-center cursor-pointer text-center w-full h-full p-2">
                  <ImageIcon className="w-7 h-7 text-slate-400 mb-2 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">Upload Product Main Image</span>
                </label>
              )}
              <input id="coverFile" type="file" accept="image/*" className="hidden" onChange={handleCoverAssignment} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Gallery Images ({galleryImages.length})</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-amber-600 rounded-xl p-4 bg-slate-50/30 min-h-[140px]">
              <label htmlFor="galleryFiles" className="flex items-center justify-center gap-2 cursor-pointer border border-slate-200 bg-white py-2 rounded-lg text-xs font-bold text-slate-700 w-full mb-3">
                <Plus className="w-4 h-4 text-slate-500" />
                <span>Upload Angles & Setup Views</span>
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
          <button type="button" onClick={() => router.push("/nursery/plant-stands-and-shelves")} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl border-0 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer flex items-center gap-2 disabled:opacity-60">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            <span>Provision Stand Listing</span>
          </button>
        </div>
      </form>
    </div>
  );
}