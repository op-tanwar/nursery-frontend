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
  updatePlantInNurseryState
} from "@/redux/slices/nurserySlice";
import { nurseryService } from "@/services/nurseryService";
import { plantService } from "@/services/PlantsService";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Loader2, Leaf, Save, AlertCircle } from "lucide-react";

// Predefined catalog categories for botanical asset mapping
const AVAILABLE_PLANT_CATEGORIES = [
  "Indoor Plants",
  "Outdoor Plants",
  "Flowering Plants",
  "Succulents",
  "Succulents & Cacti",
  "Medicinal Plants",
  "Medicinal & Herbs",
  "Aromatic Plants",
  "Bonsai & Office Desk"
];

export default function EditPlantPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const plantId = params.id as string;

  const { isLoading, error } = useAppSelector((state) => state.nursery);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");

  // Specification States
  const [lightRequirement, setLightRequirement] = useState("");
  const [wateringSchedule, setWateringSchedule] = useState("");
  const [maintenanceLevel, setMaintenanceLevel] = useState("");
  const [isPetFriendly, setIsPetFriendly] = useState(false);

  // SEO States
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [points, setPoints] = useState<string[]>([""]);
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [careInstructions, setCareInstructions] = useState<string[]>([""]);

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [existingCoverUrl, setExistingCoverUrl] = useState<string>("");

  useEffect(() => {
    const fetchPlantDataNode = async () => {
      dispatch(setNurseryLoading(true));
      try {
        let targetedPlant: any = null;
        try {
          const directRes = await plantService.getPlantDetails(plantId);
          targetedPlant = directRes?.plant || directRes?.data;
        } catch {
          // fallback to inventory list
        }

        if (!targetedPlant) {
          const response = await nurseryService.getMyPlants();
          const plantList = response?.plants || [];
          targetedPlant = plantList.find((p: any) => p._id === plantId);
        }

        if (!targetedPlant) {
          throw new Error("Targeted botanical inventory document node not found.");
        }

        setName(targetedPlant.name || "");
        setDescription(targetedPlant.description || "");
        setCategory(targetedPlant.category || "");
        setPrice(targetedPlant.price ?? "");
        setDiscountPrice(targetedPlant.discountPrice ?? "");
        setStock(targetedPlant.stock ?? "");
        setShortDesc(targetedPlant.descriptionOption?.short || "");
        setLightRequirement(targetedPlant.lightRequirement || "");
        setWateringSchedule(targetedPlant.wateringSchedule || "");
        setMaintenanceLevel(targetedPlant.maintenanceLevel || "");
        setIsPetFriendly(targetedPlant.isPetFriendly === true || targetedPlant.isPetFriendly === "true");
        setMetaTitle(targetedPlant.metaTitle || "");
        setMetaDescription(targetedPlant.metaDescription || "");
        setExistingCoverUrl(targetedPlant.coverImage?.url || "");

        if (targetedPlant.descriptionOption?.points?.length) setPoints(targetedPlant.descriptionOption.points);
        if (targetedPlant.benefits?.length) setBenefits(targetedPlant.benefits);
        if (targetedPlant.careInstructions?.length) setCareInstructions(targetedPlant.careInstructions);

        dispatch(setNurseryLoading(false));
      } catch (err: any) {
        const errMsg = err?.message || "Failed parsing target data node stream.";
        dispatch(setNurseryError(errMsg));
        toast.error(errMsg);
      }
    };

    if (plantId) fetchPlantDataNode();
  }, [plantId, dispatch]);

  const handleArrayStringChange = (index: number, val: string, type: "points" | "benefits" | "care") => {
    if (type === "points") { const clone = [...points]; clone[index] = val; setPoints(clone); }
    if (type === "benefits") { const clone = [...benefits]; clone[index] = val; setBenefits(clone); }
    if (type === "care") { const clone = [...careInstructions]; clone[index] = val; setCareInstructions(clone); }
  };

  const addArrayNode = (type: "points" | "benefits" | "care") => {
    if (type === "points") setPoints([...points, ""]);
    if (type === "benefits") setBenefits([...benefits, ""]);
    if (type === "care") setCareInstructions([...careInstructions, ""]);
  };

  const removeArrayNode = (index: number, type: "points" | "benefits" | "care") => {
    if (type === "points" && points.length > 1) setPoints(points.filter((_, i) => i !== index));
    if (type === "benefits" && benefits.length > 1) setBenefits(benefits.filter((_, i) => i !== index));
    if (type === "care" && careInstructions.length > 1) setCareInstructions(careInstructions.filter((_, i) => i !== index));
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
    const mutationToast = toast.loading("Updating plant technical specifications...");

    try {
      const formData = new FormData();

      const plantDataJson = {
        name,
        description,
        descriptionOption: {
          short: shortDesc,
          points: points.filter(p => p.trim() !== ""),
        },
        benefits: benefits.filter(b => b.trim() !== ""),
        careInstructions: careInstructions.filter(c => c.trim() !== ""),
        price: Number(price),
        discountPrice: discountPrice !== "" ? Number(discountPrice) : 0,
        stock: Number(stock),
        category,
        ...(lightRequirement ? { lightRequirement } : {}),
        ...(wateringSchedule ? { wateringSchedule } : {}),
        ...(maintenanceLevel ? { maintenanceLevel } : {}),
        isPetFriendly,
        ...(metaTitle ? { metaTitle } : {}),
        ...(metaDescription ? { metaDescription } : {}),
      };

      formData.append("plantData", JSON.stringify(plantDataJson));

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const response = await nurseryService.updatePlantAsset(plantId, formData);
      dispatch(updatePlantInNurseryState(response.plant));

      toast.success("Inventory metrics matrix altered successfully!", { id: mutationToast });
      router.push("/nursery/plants");
    } catch (err: any) {
      const errMsg = err?.message || "Internal mutator parsing runtime crash.";
      dispatch(setNurseryError(errMsg));
      toast.error(errMsg, { id: mutationToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/nursery/plants" className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            <Leaf className="text-blue-600 w-5 h-5" />
            <span>Modify Botanical Listing Specifications</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">Re-indexing payload configurations for document reference: <span className="font-mono font-bold text-slate-700">{plantId}</span></p>
        </div>
      </div>

      <form onSubmit={handleCatalogUpdateMutation} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Plant Identity Blueprint Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Category Tag Option</label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all cursor-pointer">
              <option value="" disabled hidden>Select botanical category layout...</option>
              {AVAILABLE_PLANT_CATEGORIES.map((cat) => (
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Light Requirement</label>
            <select value={lightRequirement} onChange={(e) => setLightRequirement(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all cursor-pointer">
              <option value="">Select light requirement...</option>
              <option value="Low Light">Low Light</option>
              <option value="Medium Light">Medium Light</option>
              <option value="Bright Indirect Sunlight">Bright Indirect Sunlight</option>
              <option value="Direct Sunlight">Direct Sunlight</option>
              <option value="Full Sun">Full Sun</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Watering Schedule</label>
            <select value={wateringSchedule} onChange={(e) => setWateringSchedule(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all cursor-pointer">
              <option value="">Select watering schedule...</option>
              <option value="Daily">Daily</option>
              <option value="Every 2-3 Days">Every 2-3 Days</option>
              <option value="Once a Week">Once a Week</option>
              <option value="Every 10-14 Days">Every 10-14 Days</option>
              <option value="When Soil is Dry">When Soil is Dry</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Maintenance Level</label>
            <select value={maintenanceLevel} onChange={(e) => setMaintenanceLevel(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all cursor-pointer">
              <option value="">Select maintenance level...</option>
              <option value="Easy">Easy (Low Maintenance)</option>
              <option value="Moderate">Moderate</option>
              <option value="Demanding">Demanding (High Maintenance)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 mt-4 md:col-span-2">
            <input
              type="checkbox"
              id="editIsPetFriendly"
              checked={isPetFriendly}
              onChange={(e) => setIsPetFriendly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="editIsPetFriendly" className="text-xs font-bold text-slate-700 cursor-pointer">
              🐾 Pet-Friendly Plant (Non-toxic to cats & dogs)
            </label>
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
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Atmospheric Benefits</label>
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

        {/* 🛠️ Dynamic Array Processing Node for Care & Maintenance Instructions Layer */}
        <div className="space-y-2 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Care & Maintenance Protocols</label>
            <button type="button" onClick={() => addArrayNode("care")} className="text-[11px] font-bold text-blue-700 flex items-center gap-1 bg-transparent border-0 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Insert Step</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careInstructions.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="text" required value={c} onChange={(e) => handleArrayStringChange(idx, e.target.value, "care")} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-hidden" />
                {careInstructions.length > 1 && <button type="button" onClick={() => removeArrayNode(idx, "care")} className="p-2 border-0 text-slate-400 hover:text-red-500 bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
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
                <Image src={coverPreview || existingCoverUrl} alt="Product tracking layout print" fill sizes="(max-width: 768px) 100vw, 384px" className="object-cover" />
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

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-700 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4">
          <button type="button" onClick={() => router.push("/nursery/plants")} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer">Cancel Mutations</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl border-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Commit Specification Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}