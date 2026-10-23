"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast"; // 👈 Integrated elegant toast system
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setNurseryLoading,
  setNurseryError,
  addAccessoryToNurseryState
} from "@/redux/slices/nurserySlice";
import { nurseryService } from "@/services/nurseryService";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Loader2, Wrench, CheckCircle } from "lucide-react";

// Predefined catalog categories for accessory assets schema matrix
const AVAILABLE_ACCESSORY_CATEGORIES = [
  "Gardening Tools",
  "Fertilizers & Soil",
  "Pest Control",
  "Watering Equipment",
  "Plant Stands & Decor",
  "Hardware & Spares"
];

export default function CreateAccessoryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isLoading, error } = useAppSelector((state) => state.nursery);

  // Core Structured States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");

  // Accessory Model Specifications Nested States
  const [brand, setBrand] = useState("Generic");
  const [weight, setWeight] = useState("");
  const [material, setMaterial] = useState("");
  const [capacity, setCapacity] = useState("");
  const [dimensions, setDimensions] = useState("");

  // SEO States
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Array Lists Collectors
  const [points, setPoints] = useState<string[]>([""]);
  const [benefits, setBenefits] = useState<string[]>([""]);

  // Binary Files Context State Streams
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Array mutator handlers pipelines
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

  // Binary Local File Previews Pipeline
  const handleCoverAssignment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryAddition = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setGalleryImages((prev) => [...prev, ...selectedFiles]);

      const newUrls = selectedFiles.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newUrls]);
    }
  };

  // Submit Orchestration Pipeline Form-Data Matrix Binder
  const handleCatalogSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage) {
      toast.error("Please attach a main Cover Image for product mapping visual components.");
      return;
    }

    dispatch(setNurseryLoading(true));
    // 🚀 NEW: Replaced asynchronous blocking alerts with non-blocking reactive toast promise layers
    const dynamicProcessingToast = toast.loading("Deploying new accessory hardware asset to matrix database...");

    try {
      const formData = new FormData();

      // Strict Schema Mapping for Accessory Model
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

      // Append stringified accessory matrix payload
      formData.append("accessoryData", JSON.stringify(accessoryDataJson));

      // Bind binary streams payloads
      formData.append("coverImage", coverImage);
      galleryImages.forEach((imgFile) => {
        formData.append("images", imgFile);
      });

      // Update service call targeting your accessory downstream orchestration endpoint
      const response = await nurseryService.createNewAccessory(formData);

      if (addAccessoryToNurseryState) {
        dispatch(addAccessoryToNurseryState(response.accessory));
      }

      toast.success("Accessory inventory record asset provisioned successfully!", { id: dynamicProcessingToast });
      router.push("/nursery/accessories");
    } catch (err: any) {
      const parsedErrorMessage = err?.message || "Connectivity handshake boundary drop during data deployment pipeline.";
      dispatch(setNurseryError(parsedErrorMessage));
      toast.error(parsedErrorMessage, { id: dynamicProcessingToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">

      {/* Structural Control Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/nursery/accessories" className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            <Wrench className="text-blue-600 w-5 h-5" />
            <span>Provision New Nursery Accessory Asset</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">Inbound ingestion pipeline setup node for tools, fertilizers, and hardware listings.</p>
        </div>
      </div>

      <form onSubmit={handleCatalogSubmission} className="space-y-8">

        {/* Core Identity Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Accessory / Tool Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Premium Watering Can" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Category Mapping Option</label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all cursor-pointer">
              <option value="" disabled hidden>Select inventory category standard...</option>
              {AVAILABLE_ACCESSORY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Price Valuation (INR)</label>
            <input type="number" required value={price} onChange={(e) => setPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="₹ Price" max={99999999} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Discount Price (INR) <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="₹ 0 (leave blank if no discount)" max={99999999} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Stock Multiplier Units Available</label>
            <input type="number" required value={stock} onChange={(e) => setStock(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="Stock units" max={9999} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all" />
          </div>
        </div>

        {/* Accessory Specifications Block */}
        <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider m-0">Technical Specifications Matrix</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Brand Designation</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Generic" className="px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 outline-none transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Material Composition</label>
              <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g., Stainless Steel, High-Density Plastic" className="px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 outline-none transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Weight Metric</label>
              <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g., 450g, 1.2kg" className="px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 outline-none transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Volumetric Capacity (If Applicable)</label>
              <input type="text" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g., 5 Liters, 10 KG" className="px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 outline-none transition-all" />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Dimensions / Sizing (If Applicable)</label>
              <input type="text" value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="e.g., 25cm x 15cm x 10cm" className="px-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* Text descriptions layer setup blocks */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 tracking-tight">Short Feature Introduction Description</label>
          <input type="text" required value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Provide catchy 1-liner summary snapshot..." className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 tracking-tight">Comprehensive Technical Product Overview</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Elaborate structural engineering layout, multi-use scenarios, longevity parameters..." className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all resize-none" />
        </div>

        {/* Dynamic Lists Fields Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Highlight Features Points</label>
              <button type="button" onClick={() => addArrayNode("points")} className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 bg-transparent border-none cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Point</button>
            </div>
            {points.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="text" required value={p} onChange={(e) => handleArrayStringChange(idx, e.target.value, "points")} placeholder="Key functional feature item..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-blue-600" />
                {points.length > 1 && <button type="button" onClick={() => removeArrayNode(idx, "points")} className="p-2 border-0 text-slate-400 hover:text-red-500 bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Product Utility Benefits</label>
              <button type="button" onClick={() => addArrayNode("benefits")} className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 bg-transparent border-none cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Benefit</button>
            </div>
            {benefits.map((b, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="text" required value={b} onChange={(e) => handleArrayStringChange(idx, e.target.value, "benefits")} placeholder="Ergonomic design benefits, corrosion resistance specs..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-blue-600" />
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Meta Description</label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO meta description..."
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Binary Media Stream Pipelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-slate-100 py-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Main Catalog Primary Cover</label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-600 rounded-xl p-4 transition-colors flex flex-col items-center justify-center bg-slate-50/30 min-h-[140px]">
              {coverPreview ? (
                <div className="relative w-full h-[120px] rounded-lg overflow-hidden border border-slate-100 shadow-inner">
                  <Image src={coverPreview} alt="Cover preview schema buffer" fill sizes="(max-width: 768px) 100vw, 500px" className="object-cover" />
                  <label htmlFor="coverFileNode" className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors backdrop-blur-sm">Change Asset</label>
                </div>
              ) : (
                <label htmlFor="coverFileNode" className="flex flex-col items-center justify-center cursor-pointer text-center w-full h-full p-2">
                  <ImageIcon className="w-7 h-7 text-slate-400 mb-2 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">Upload primary cover identity document</span>
                  <span className="text-[10px] text-slate-400 mt-1">Supports PNG, JPEG, WEBP assets</span>
                </label>
              )}
              <input id="coverFileNode" type="file" accept="image/*" className="hidden" onChange={handleCoverAssignment} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Showcase Gallery Cluster Array ({galleryImages.length} Nodes Loaded)</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-600 rounded-xl p-4 transition-colors bg-slate-50/30 min-h-[140px]">
              <label htmlFor="galleryNodeFile" className="flex items-center justify-center gap-2 cursor-pointer border border-solid border-slate-200 hover:bg-slate-50 bg-white py-2 rounded-lg text-xs font-bold text-slate-700 transition-colors w-full mb-3 shadow-xs">
                <Plus className="w-4 h-4 text-slate-500" />
                <span>Inject Secondary Pictures</span>
              </label>
              <input id="galleryNodeFile" type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryAddition} />

              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-thin">
                {galleryPreviews.map((srcUrl, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-white shadow-xs">
                    <Image src={srcUrl} alt="Gallery view track node" fill sizes="56px" className="object-cover" />
                    <button type="button" onClick={() => { setGalleryImages(galleryImages.filter((_, i) => i !== idx)); setGalleryPreviews(galleryPreviews.filter((_, i) => i !== idx)); }} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity border-none cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Trace Feedback Component */}
        {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-bold">{error}</div>}

        {/* Action Controls Pipeline Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button type="button" onClick={() => router.push("/nursery/accessories")} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition-all">Cancel Ingestion</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl border-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-all disabled:opacity-60 flex items-center gap-2 shadow-sm">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            <span>Deploy Live to Marketplace</span>
          </button>
        </div>

      </form>
    </div>
  );
}