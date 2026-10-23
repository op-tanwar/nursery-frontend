"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setNurseryLoading, setNurseryError, addPotToNurseryState } from "@/redux/slices/nurserySlice";
import { nurseryService } from "@/services/nurseryService";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Loader2, Archive, CheckCircle } from "lucide-react";

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

export default function CreatePotPage() {
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

  // Schema Required States Added
  const [material, setMaterial] = useState("");
  const [height, setHeight] = useState("");
  const [diameter, setDiameter] = useState("");
  const [color, setColor] = useState("");
  const [shape, setShape] = useState("");
  const [hasDrainageHole, setHasDrainageHole] = useState(false);
  const [isIndoorOutdoor, setIsIndoorOutdoor] = useState("Both");
  const [includesSaucer, setIncludesSaucer] = useState(false);

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

    // 🛠️ RECTIFIED: Native window alert replaced with toast warning context block
    if (!coverImage) {
      toast.error("Please attach a main Cover Image for planter visual architecture mapping.");
      return;
    }

    dispatch(setNurseryLoading(true));
    const creationToast = toast.loading("Deploying new planter product specifications to marketplace...");

    try {
      const formData = new FormData();

      // Strict schema structure mapping matching potsModel requirements
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

      // Append stringified schema structure data node
      formData.append("potData", JSON.stringify(potDataJson));

      // Bind files payloads parameters
      formData.append("coverImage", coverImage);
      galleryImages.forEach((imgFile) => {
        formData.append("images", imgFile);
      });

      const response = await nurseryService.createNewPot(formData);
      dispatch(addPotToNurseryState(response.pot));

      toast.success("Planter product record deployed successfully!", { id: creationToast });
      router.push("/nursery/pots");
    } catch (err: any) {
      const errMsg = err?.message || "Internal downstream data parsing layout failure.";
      dispatch(setNurseryError(errMsg));
      toast.error(errMsg, { id: creationToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">

      {/* Structural Control Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/nursery/pots" className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            <Archive className="text-amber-600 w-5 h-5" />
            <span>Provision New Nursery Planter Asset</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">Inbound ingestion pipeline setup node for global store listings.</p>
        </div>
      </div>

      <form onSubmit={handleCatalogSubmission} className="space-y-8">

        {/* Core Profile Parameters Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Planter / Pot Variant Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Ceramic Geometric Pot" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Store Category Mapping Option</label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all cursor-pointer">
              <option value="" disabled hidden>Select catalog category standard...</option>
              {AVAILABLE_POT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Material Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Material Composition (Required)</label>
            <input type="text" required value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g., Ceramic, Terracotta, Plastic" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          {/* Color Specs */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Primary Color Tag</label>
            <input type="text" required value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g., Terracotta Red, Matte Black" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          {/* Height */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Pot Height Metric (Required)</label>
            <input type="text" required value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g., 6 inches, 15 cm" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          {/* Diameter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Pot Diameter Metric (Required)</label>
            <input type="text" required value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder="e.g., 8 inches, 20 cm" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Price Valuation (INR)</label>
            <input type="number" required value={price} onChange={(e) => setPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="₹ Price" max={99999999} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Discount Price (INR) <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="₹ 0 (leave blank if no discount)" max={99999999} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Stock Multiplier Units Available</label>
            <input type="number" required value={stock} onChange={(e) => setStock(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="Stock units" max={9999} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-tight">Pot Shape</label>
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
            <label className="text-xs font-bold text-slate-700 tracking-tight">Usage Environment</label>
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

        {/* Text descriptions layer setup blocks */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 tracking-tight">Short Form Parameter Overview</label>
          <input type="text" required value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Provide catchy 1-liner summary snapshot..." className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 tracking-tight">Comprehensive Technical Product Overview</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Elaborate dimensions, clay properties, structural stability logs..." className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600 focus:ring-4 focus:ring-amber-600/5 transition-all resize-none" />
        </div>

        {/* Dynamic String Buffers Management Blocks (Points, Benefits) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Product Points Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Highlight Features Points</label>
              <button type="button" onClick={() => addArrayNode("points")} className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-transparent border-none cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Point</button>
            </div>
            {points.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="text" required value={p} onChange={(e) => handleArrayStringChange(idx, e.target.value, "points")} placeholder="Bullet points spec layout..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600" />
                {points.length > 1 && <button type="button" onClick={() => removeArrayNode(idx, "points")} className="p-2 border-0 text-slate-400 hover:text-red-500 bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
          </div>

          {/* Planter Key Structural Benefits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Planter Key Structural Benefits</label>
              <button type="button" onClick={() => addArrayNode("benefits")} className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-transparent border-none cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Benefit</button>
            </div>
            {benefits.map((b, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="text" required value={b} onChange={(e) => handleArrayStringChange(idx, e.target.value, "benefits")} placeholder="e.g., Weatherproof matrix, smart drainage nodes..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-amber-600" />
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

        {/* Assets Binary Cloudinary Stream Pipelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-slate-100 py-6">
          {/* Cover Asset Selection Block */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Main Catalog Primary Cover</label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-amber-600 rounded-xl p-4 transition-colors flex flex-col items-center justify-center bg-slate-50/30 min-h-[140px]">
              {coverPreview ? (
                <div className="relative w-full h-[120px] rounded-lg overflow-hidden border border-slate-100 shadow-inner">
                  <Image src={coverPreview} alt="Cover preview" fill sizes="(max-width: 768px) 100vw, 500px" className="object-cover" />
                  <label htmlFor="potCoverFileNode" className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors backdrop-blur-xs">Change Asset</label>
                </div>
              ) : (
                <label htmlFor="potCoverFileNode" className="flex flex-col items-center justify-center cursor-pointer text-center w-full h-full p-2">
                  <ImageIcon className="w-7 h-7 text-slate-400 mb-2 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">Upload primary cover identity</span>
                  <span className="text-[10px] text-slate-400 mt-1">Supports PNG, JPEG, WEBP assets</span>
                </label>
              )}
              <input id="potCoverFileNode" type="file" accept="image/*" className="hidden" onChange={handleCoverAssignment} />
            </div>
          </div>

          {/* Showcase Gallery Cluster Array */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">Showcase Gallery Cluster Array ({galleryImages.length} Nodes)</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-amber-600 rounded-xl p-4 transition-colors bg-slate-50/30 min-h-[140px]">
              <label htmlFor="potGalleryNodeFile" className="flex items-center justify-center gap-2 cursor-pointer border border-solid border-slate-200 hover:bg-slate-50 bg-white py-2 rounded-lg text-xs font-bold text-slate-700 transition-colors w-full mb-3 shadow-xs">
                <Plus className="w-4 h-4 text-slate-500" />
                <span>Inject Secondary Pictures</span>
              </label>
              <input id="potGalleryNodeFile" type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryAddition} />

              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-thin">
                {galleryPreviews.map((srcUrl, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-white shadow-xs">
                    <Image src={srcUrl} alt="Gallery view" fill sizes="56px" className="object-cover" />
                    <button type="button" onClick={() => { setGalleryImages(galleryImages.filter((_, i) => i !== idx)); setGalleryPreviews(galleryPreviews.filter((_, i) => i !== idx)); }} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity border-none cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Feedback Message Box Trace Component */}
        {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-bold">{error}</div>}

        {/* Execution Submit Buttons Controllers */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button type="button" onClick={() => router.push("/nursery/pots")} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition-all">Cancel Ingestion</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl border-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-all disabled:opacity-60 flex items-center gap-2 shadow-sm">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            <span>Deploy Live to Marketplace</span>
          </button>
        </div>

      </form>
    </div>
  );
}