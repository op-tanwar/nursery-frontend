"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setNurseryLoading, setNurseryError } from "@/redux/slices/nurserySlice";
import { plantCareService } from "@/services/plantCareService";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Loader2, ShieldCheck, Save, AlertCircle } from "lucide-react";

const PLANT_CARE_CATEGORIES = [
  "Organic Fertilizers",
  "Pesticides & Fungicides",
  "Pest Control",
  "Potting Soil & Mixes",
  "Soil Mixes & Substrates",
  "Plant Food & Nutrients",
  "Growth Boosters",
  "Growth Promoters",
  "Fungicides",
  "Leaf Shine & Cleaners"
];

export default function EditPlantCarePage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const careId = params.id as string;

  const { isLoading, error } = useAppSelector((state) => state.nursery);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [volume, setVolume] = useState("");
  const [composition, setComposition] = useState("");
  const [points, setPoints] = useState<string[]>([""]);
  const [usageInstructions, setUsageInstructions] = useState<string[]>([""]);

  // SEO States
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [existingCoverUrl, setExistingCoverUrl] = useState<string>("");

  useEffect(() => {
    const fetchCareData = async () => {
      dispatch(setNurseryLoading(true));
      try {
        const response = await plantCareService.getPlantCareDetails(careId);
        const item = response.plantCare || response?.data || response;

        setName(item.name || "");
        setDescription(item.description || "");
        setShortDesc(item.descriptionOption?.short || "");
        setCategory(item.category || "");
        setPrice(item.price || "");
        setDiscountPrice(item.discountPrice || "");
        setStock(item.stock || "");
        setVolume(item.volumeOrWeight || item.volume || "");
        setComposition(item.composition || "");
        setMetaTitle(item.metaTitle || "");
        setMetaDescription(item.metaDescription || "");
        setExistingCoverUrl(item.coverImage?.url || "");

        if (item.descriptionOption?.points?.length) {
          setPoints(item.descriptionOption.points);
        }

        const howToUse = item.howToUse || item.usageInstructions;
        if (Array.isArray(howToUse) && howToUse.length) {
          setUsageInstructions(howToUse);
        } else if (typeof howToUse === "string" && howToUse.trim()) {
          setUsageInstructions([howToUse]);
        }

        dispatch(setNurseryLoading(false));
      } catch (err: any) {
        const errMsg = err?.message || "Failed to load plant care item details.";
        dispatch(setNurseryError(errMsg));
        toast.error(errMsg);
      }
    };

    if (careId) fetchCareData();
  }, [careId, dispatch]);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleUsageChange = (index: number, val: string) => {
    const clone = [...usageInstructions];
    clone[index] = val;
    setUsageInstructions(clone);
  };

  const addUsageRow = () => setUsageInstructions([...usageInstructions, ""]);
  const removeUsageRow = (index: number) => {
    if (usageInstructions.length > 1) setUsageInstructions(usageInstructions.filter((_, i) => i !== index));
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
    const loadingToast = toast.loading("Updating plant care item...");

    try {
      const formData = new FormData();
      const plantCareData = {
        name,
        description,
        descriptionOption: {
          short: shortDesc,
          points: points.filter((p) => p.trim() !== ""),
        },
        howToUse: usageInstructions.filter((u) => u.trim() !== ""),
        composition,
        volumeOrWeight: volume,
        price: Number(price),
        discountPrice: discountPrice !== "" ? Number(discountPrice) : 0,
        category,
        stock: Number(stock),
        ...(metaTitle ? { metaTitle } : {}),
        ...(metaDescription ? { metaDescription } : {}),
      };

      formData.append("plantCareData", JSON.stringify(plantCareData));
      if (coverImage) formData.append("coverImage", coverImage);

      await plantCareService.updatePlantCare(careId, formData);
      toast.success("Plant care item updated!", { id: loadingToast });
      router.push("/nursery/plant-care");
    } catch (err: any) {
      const errMsg = err?.message || "Failed to update plant care item.";
      dispatch(setNurseryError(errMsg));
      toast.error(errMsg, { id: loadingToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/nursery/plant-care" className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            <ShieldCheck className="text-emerald-600 w-5 h-5" />
            <span>Edit Plant Care Product</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">Reference ID: <span className="font-mono font-bold text-slate-700">{careId}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Product Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Category</label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all cursor-pointer">
              <option value="" disabled hidden>Select product type...</option>
              {PLANT_CARE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Price (INR)</label>
            <input type="number" required value={price} onChange={(e) => setPrice(e.target.value !== "" ? Number(e.target.value) : "")} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Discount Price (INR) <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="₹ 0 (leave blank if no discount)" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Stock Count</label>
            <input type="number" required value={stock} onChange={(e) => setStock(e.target.value !== "" ? Number(e.target.value) : "")} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Volume / Net Quantity (e.g., 500ml, 2.5kg)</label>
            <input type="text" required value={volume} onChange={(e) => setVolume(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Composition</label>
            <input type="text" value={composition} onChange={(e) => setComposition(e.target.value)} placeholder="e.g., NPK 19-19-19, seaweed extract" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Short Summary Overview (Tagline)</label>
          <input type="text" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Provide catchy 1-liner summary snapshot..." className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Product Description</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all resize-none" />
        </div>

        {/* Dynamic Highlight Points */}
        <div className="space-y-2 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Highlight Features Points</label>
            <button type="button" onClick={addPointRow} className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-transparent border-0 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Point</button>
          </div>
          {points.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="text" value={p} onChange={(e) => handlePointChange(idx, e.target.value)} placeholder="Key product highlight or benefit..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-none" />
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Meta Description</label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO meta description..."
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Application & Usage Steps</label>
            <button type="button" onClick={addUsageRow} className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-transparent border-0 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Step</button>
          </div>
          {usageInstructions.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="text" required value={step} onChange={(e) => handleUsageChange(idx, e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-none" />
              {usageInstructions.length > 1 && <button type="button" onClick={() => removeUsageRow(idx)} className="p-2 border-0 text-slate-400 hover:text-red-500 bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-b border-slate-100 py-6 max-w-sm">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Product Cover Image</label>
          <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-600 rounded-xl p-4 transition-colors bg-slate-50/30 min-h-[140px] flex items-center justify-center">
            {coverPreview || existingCoverUrl ? (
              <div className="relative w-full h-[120px] rounded-lg overflow-hidden border border-slate-100 shadow-inner">
                <Image src={coverPreview || existingCoverUrl} alt="Product image preview" fill sizes="(max-width: 768px) 100vw, 384px" className="object-cover" />
                <label htmlFor="careCoverInput" className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors">Change Image</label>
              </div>
            ) : (
              <label htmlFor="careCoverInput" className="flex flex-col items-center justify-center cursor-pointer text-center w-full">
                <ImageIcon className="w-7 h-7 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">Upload Image File</span>
              </label>
            )}
            <input id="careCoverInput" type="file" accept="image/*" className="hidden" onChange={handleCoverAssignment} />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-700 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4">
          <button type="button" onClick={() => router.push("/nursery/plant-care")} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl border-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Product Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
