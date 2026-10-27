"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setNurseryLoading, setNurseryError } from "@/redux/slices/nurserySlice";
import { artificialDriedPlantService } from "@/services/artificialDriedPlantService";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Flower2,
  Save,
  AlertCircle,
} from "lucide-react";
import {
  ProductGalleryManager,
  IGalleryImageItem,
  IStagedGalleryFile,
} from "@/components/nursery/ProductGalleryManager";


const ARTIFICIAL_CATEGORIES = [
  "Artificial Plants",
  "Artificial Flowers",
  "Dried Flowers",
  "Artificial Bonsai",
  "Hanging Plants",
  "Artificial Trees",
  "Pampas & Grasses",
];

const MATERIAL_OPTIONS = [
  "Silk & Fabric",
  "High-Grade Plastic",
  "Polyester",
  "Natural Dried Plant",
  "Polyethylene (PE)",
  "Ceramic & Resin Composite",
];

interface GalleryImageItem {
  public_id: string;
  url: string;
}

export default function EditArtificialDriedPlantPage() {
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
  const [brand, setBrand] = useState("Generic");
  const [material, setMaterial] = useState("");
  const [height, setHeight] = useState("");
  const [color, setColor] = useState("");
  const [washable, setWashable] = useState<boolean>(false);
  const [potIncluded, setPotIncluded] = useState<boolean>(false);

  // Dynamic Bullet Points
  const [points, setPoints] = useState<string[]>([""]);

  // SEO States
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Cover Image State
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [existingCoverUrl, setExistingCoverUrl] = useState<string>("");

  // Gallery Management States
  const [existingGalleryImages, setExistingGalleryImages] = useState<IGalleryImageItem[]>([]);
  const [stagedGalleryFiles, setStagedGalleryFiles] = useState<IStagedGalleryFile[]>([]);

  // Gallery Images State
  const [existingGallery, setExistingGallery] = useState<GalleryImageItem[]>([]);
  const [newGalleryImages, setNewGalleryImages] = useState<File[]>([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchPlantData = async () => {
      dispatch(setNurseryLoading(true));
      try {
        const response = await artificialDriedPlantService.getArtificialDetails(plantId);
        const plant = response?.artificialDriedPlant || response?.artificial || response?.data || response;

        setName(plant.name || "");
        setDescription(plant.description || "");
        setShortDesc(plant.descriptionOption?.short || "");
        setCategory(plant.category || "");
        setPrice(plant.price ?? "");
        setDiscountPrice(plant.discountPrice ?? "");
        setStock(plant.stock ?? "");
        setMetaTitle(plant.metaTitle || "");
        setMetaDescription(plant.metaDescription || "");

        if (plant.descriptionOption?.points?.length) {
          setPoints(plant.descriptionOption.points);
        }

        // Specifications mapping
        if (plant.specifications) {
          setBrand(plant.specifications.brand || "Generic");
          setMaterial(plant.specifications.material || "");
          setHeight(plant.specifications.height || "");
          setColor(plant.specifications.color || "");
          setWashable(!!plant.specifications.washable);
          setPotIncluded(!!plant.specifications.potIncluded);
        }

        setExistingCoverUrl(plant.coverImage?.url || "");
        setExistingGalleryImages(Array.isArray(plant.images) ? plant.images : []);
        if (plant.images && Array.isArray(plant.images)) {
          setExistingGallery(plant.images);
        }

        dispatch(setNurseryLoading(false));
      } catch (err: any) {
        const errMsg = err?.message || "Failed to load plant specifications.";
        dispatch(setNurseryError(errMsg));
        toast.error(errMsg);
      }
    };

    if (plantId) fetchPlantData();
  }, [plantId, dispatch]);

  // Clean memory on unmount or preview update
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      newGalleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [coverPreview, newGalleryPreviews]);

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
    setExistingGalleryImages((prev) => prev.filter((_, i) => i !== index));
    toast.success("Gallery photo marked for deletion on save.");
  };

  const handleReplaceExistingGalleryImage = (index: number, newFile: File) => {
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

  const handleGalleryAddition = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const selectedPreviews = selectedFiles.map((f) => URL.createObjectURL(f));

      setNewGalleryImages((prev) => [...prev, ...selectedFiles]);
      setNewGalleryPreviews((prev) => [...prev, ...selectedPreviews]);
    }
  };

  const removeExistingGalleryImage = (publicId: string) => {
    setExistingGallery((prev) => prev.filter((img) => img.public_id !== publicId));
  };

  const removeNewGalleryImage = (index: number) => {
    URL.revokeObjectURL(newGalleryPreviews[index]);
    setNewGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePointChange = (index: number, val: string) => {
    const clone = [...points];
    clone[index] = val;
    setPoints(clone);
  };

  const addPoint = () => setPoints([...points, ""]);
  const removePoint = (index: number) => {
    if (points.length > 1) setPoints(points.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setNurseryLoading(true));
    const loadingToast = toast.loading("Updating plant details...");

    try {
      const formData = new FormData();
      const productDataJson = {
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
        specifications: {
          brand: brand || "Generic",
          material,
          height,
          color,
          washable,
          potIncluded,
        },
        existingImages: existingGallery,
        ...(metaTitle ? { metaTitle } : {}),
        ...(metaDescription ? { metaDescription } : {}),
      };

      formData.append("artificialData", JSON.stringify(productDataJson));

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      // Append preserved existing gallery images
      formData.append("existingImages", JSON.stringify(existingGalleryImages));

      // Append newly staged gallery images (both keys for broad backend compatibility)
      stagedGalleryFiles.forEach((item) => {
        formData.append("images", item.file);
        formData.append("galleryImages", item.file);
      });

      newGalleryImages.forEach((file) => {
        formData.append("images", file);
      });

      await artificialDriedPlantService.updateArtificial(plantId, formData);
      toast.success("Artificial/Dried Plant updated successfully!", { id: loadingToast });
      router.push("/nursery/artificial-dried-plants");
    } catch (err: any) {
      const errMsg = err?.message || "Failed to update plant details.";
      dispatch(setNurseryError(errMsg));
      toast.error(errMsg, { id: loadingToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/nursery/artificial-dried-plants"
          className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            <Flower2 className="text-emerald-600 w-5 h-5" />
            <span>Edit Artificial / Dried Plant</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">
            Reference ID: <span className="font-mono font-bold text-slate-700">{plantId}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Product Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Faux Fiddle Leaf Fig Tree"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Category</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all cursor-pointer"
            >
              <option value="" disabled hidden>Select Category...</option>
              {ARTIFICIAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Primary Material</label>
            <select
              required
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-800 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all cursor-pointer"
            >
              <option value="" disabled hidden>Select Material...</option>
              {MATERIAL_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Brand Name</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Generic / Urban Nursery"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Height / Dimensions</label>
            <input
              type="text"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g., 45 cm / 3 Feet"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Color Variant</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g., Natural Green / Natural Dried Gold"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Price (INR)</label>
            <input
              type="number"
              required
              max={99999999}
              value={price}
              onChange={(e) => setPrice(e.target.value !== "" ? Number(e.target.value) : "")}
              placeholder="₹ Price"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Discount Price (INR) <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="number"
              max={99999999}
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value !== "" ? Number(e.target.value) : "")}
              placeholder="₹ 0 (leave blank if no discount)"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Stock Units</label>
            <input
              type="number"
              required
              max={9999}
              value={stock}
              onChange={(e) => setStock(e.target.value !== "" ? Number(e.target.value) : "")}
              placeholder="Stock quantity"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="washableToggleEdit"
              checked={washable}
              onChange={(e) => setWashable(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-700">
              Waterproof / Washable (Can be cleaned with water safely)
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="potIncludedToggleEdit"
              checked={potIncluded}
              onChange={(e) => setPotIncluded(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-700">
              🪴 Pot / Planter Included with Plant
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Short Summary Overview (Tagline)</label>
          <input
            type="text"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="Provide catchy 1-liner summary snapshot..."
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Detailed Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe visual aesthetic, realism, care guidelines, and ideal placement..."
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all resize-none"
          />
        </div>

        {/* Highlight Points */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Highlight Features Points</label>
            <button type="button" onClick={addPoint} className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-transparent border-none cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Point</button>
          </div>
          {points.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="text" value={p} onChange={(e) => handlePointChange(idx, e.target.value)} placeholder="Key feature or aesthetic highlight..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 outline-hidden focus:border-emerald-600" />
              {points.length > 1 && <button type="button" onClick={() => removePoint(idx)} className="p-2 border-0 text-slate-400 hover:text-red-500 bg-transparent cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
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

        {/* Image Uploads & Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-slate-100 py-6">
          {/* Cover Image */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Main Cover Image
            </label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-600 rounded-xl p-4 transition-colors flex flex-col items-center justify-center bg-slate-50/30 min-h-[140px]">
              {coverPreview || existingCoverUrl ? (
                <div className="relative w-full h-[120px] rounded-lg overflow-hidden border border-slate-100 shadow-inner">
                  <Image
                    src={coverPreview || existingCoverUrl}
                    alt="Cover plant image preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover"
                  />
                  <label
                    htmlFor="plantCoverInput"
                    className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                  >
                    Change Image
                  </label>
                </div>
              ) : (
                <label htmlFor="plantCoverInput" className="flex flex-col items-center justify-center cursor-pointer text-center w-full h-full p-2">
                  <ImageIcon className="w-7 h-7 text-slate-400 mb-2 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">Upload Cover Image</span>
                </label>
              )}
              <input
                id="plantCoverInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverAssignment}
              />
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
        />

          {/* Gallery Images */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Gallery Images ({existingGallery.length + newGalleryImages.length})
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-600 rounded-xl p-4 transition-colors bg-slate-50/30 min-h-[140px]">
              <label
                htmlFor="galleryFilesEdit"
                className="flex items-center justify-center gap-2 cursor-pointer border border-slate-200 bg-white py-2 rounded-lg text-xs font-bold text-slate-700 w-full mb-3 hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-4 h-4 text-slate-500" />
                <span>Add Additional Gallery Images</span>
              </label>
              <input
                id="galleryFilesEdit"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleGalleryAddition}
              />

              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                {/* Existing Gallery Photos */}
                {existingGallery.map((img) => (
                  <div key={img.public_id} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-white">
                    <Image src={img.url} alt="Existing gallery asset" fill sizes="56px" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingGalleryImage(img.public_id)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity border-none cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Newly Added Gallery Previews */}
                {newGalleryPreviews.map((src, idx) => (
                  <div key={`new-${idx}`} className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-300 shrink-0 bg-white">
                    <Image src={src} alt="New gallery upload" fill sizes="56px" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewGalleryImage(idx)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity border-none cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-700 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/nursery/artificial-dried-plants")}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl border-0 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Plant Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}