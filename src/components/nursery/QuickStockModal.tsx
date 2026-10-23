"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { updatePlantInNurseryState } from "@/redux/slices/nurserySlice";
import { nurseryService } from "@/services/nurseryService";
import { X, Layers, AlertCircle, Loader2 } from "lucide-react";

interface QuickStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantData: {
    _id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
  } | null;
  onUpdate?: (id: string, formData: FormData) => Promise<any>;
  onSuccess?: (updated: any) => void;
}

export default function QuickStockModal({
  isOpen,
  onClose,
  plantData,
  onUpdate,
  onSuccess,
}: QuickStockModalProps) {
  const dispatch = useAppDispatch();

  const [localPrice, setLocalPrice] = useState<number | "">("");
  const [localStock, setLocalStock] = useState<number | "">("");
  const [isMutating, setIsMutating] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    if (plantData) {
      setLocalPrice(plantData.price);
      setLocalStock(plantData.stock);
      setFeedbackError(null);
    }
  }, [plantData, isOpen]);

  if (!isOpen || !plantData) return null;

  const handleQuickMutationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMutating(true);
    setFeedbackError(null);

    try {
      const payloadForm = new FormData();

      payloadForm.append("name", plantData.name);
      payloadForm.append("category", plantData.category);
      payloadForm.append("price", String(localPrice));
      payloadForm.append("stock", String(localStock));

      const response = onUpdate
        ? await onUpdate(plantData._id, payloadForm)
        : await nurseryService.updatePlantAsset(plantData._id, payloadForm);

      if (onSuccess) {
        onSuccess(response);
      } else {
        // Warning: This component is being used without an onSuccess callback for a non-plant product.
        // It relies on a plant-specific redux slice fallback which could cause state corruption.
        // You should provide an onSuccess callback for all products.
        dispatch(updatePlantInNurseryState(response.plant || response.data || response));
      }
      onClose();
    } catch (err: any) {
      setFeedbackError(err?.message || "Stream updates tracking synchronization failure node.");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#121814]/40 backdrop-blur-xs select-none">

      <div className="w-full max-w-sm bg-panel rounded-2xl border border-line shadow-xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">

        <div className="flex items-center justify-between p-4 bg-background border-b border-line">
          <div className="flex items-center gap-2">
            <Layers className="text-brand-primary w-4 h-4 shrink-0" />
            <span className="text-xs font-black text-foreground tracking-tight uppercase">Quick Calibration</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 border-0 bg-transparent text-muted-text hover:text-foreground cursor-pointer rounded-md hover:bg-background transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleQuickMutationSubmit} className="p-5 space-y-4">
          <div>
            <span className="text-[10px] text-muted-text font-bold uppercase tracking-wider block">Target Plant Node</span>
            <span className="text-xs font-bold text-foreground mt-0.5 block truncate">{plantData.name}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground">Market Valuation (INR)</label>
            <input
              type="number"
              required
              value={localPrice}
              onChange={(e) => setLocalPrice(e.target.value !== "" ? Number(e.target.value) : "")}
              placeholder="₹ Amount"
              className="px-3 py-2 bg-background border border-line rounded-xl text-xs font-mono text-foreground outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-light transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground">Active In-House Storage Stock</label>
            <input
              type="number"
              required
              value={localStock}
              onChange={(e) => setLocalStock(e.target.value !== "" ? Number(e.target.value) : "")}
              placeholder="Units count"
              className="px-3 py-2 bg-background border border-line rounded-xl text-xs font-mono text-foreground outline-hidden focus:border-brand-primary focus:ring-2 focus:ring-brand-light transition-all"
            />
          </div>

          {feedbackError && (
            <div className="p-2.5 bg-red-50/50 border border-red-200 rounded-lg flex items-start gap-1.5 text-red-700 text-[11px] font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <span>{feedbackError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              disabled={isMutating}
              className="px-3.5 py-2 border border-line bg-panel text-muted-text rounded-xl text-xs font-bold hover:bg-background hover:text-foreground cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isMutating}
              className="px-4 py-2 border-0 bg-brand-primary text-white rounded-xl text-xs font-bold cursor-pointer transition-colors hover:bg-brand-dark flex items-center gap-1.5 shadow-xs"
            >
              {isMutating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Apply Changes</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
