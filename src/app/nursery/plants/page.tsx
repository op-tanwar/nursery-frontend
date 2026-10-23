"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setNurseryLoading,
  setNurseryError,
  setNurseryPlants,
  deletePlantFromNurseryState,
  updatePlantInNurseryState
} from "@/redux/slices/nurserySlice";
import { nurseryService } from "@/services/nurseryService";
import {
  Plus,
  Leaf,
  Trash2,
  Edit3,
  Eye,
  Loader2,
  RefreshCw,
  AlertCircle,
  Layers,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import DataTable, { ColumnConfig } from "@/components/dashboard-common/DataTable";
import QuickStockModal from "@/components/nursery/QuickStockModal";

interface PlantRow {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  ratings?: number;
  numOfReviews?: number;
  coverImage: {
    url: string;
  };
}

export default function NurseryInventoryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { nurseryPlants = [], isLoading, error } = useAppSelector((state) => state.nursery);

  // 🎛️ Quick Stock Modal & Loading Maps
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantRow | null>(null);
  const [statusLoadingMap, setStatusLoadingMap] = useState<Record<string, boolean>>({});

  // Sync downstream catalog collections
  const syncInventoryDataStream = async () => {
    dispatch(setNurseryLoading(true));
    try {
      const response = await nurseryService.getMyPlants();
      dispatch(setNurseryPlants(response.plants || []));
    } catch (err: any) {
      const errMsg = err?.message || err || "Parsing network stream error nodes.";
      dispatch(setNurseryError(errMsg));
      toast.error(errMsg);
    }
  };

  useEffect(() => {
    syncInventoryDataStream();
  }, []);

  // 🔄 Fixed Runtime Inline Operational Status Toggle Engine
  const handleToggleActiveState = async (plantId: string, currentStatus: boolean) => {
    setStatusLoadingMap((prev) => ({ ...prev, [plantId]: true }));
    const targetStatus = !currentStatus;
    const toastId = toast.loading(`${targetStatus ? "Activating" : "Deactivating"} live marketplace display...`);

    try {
      const response = await nurseryService.updatePlantStatus(plantId, { isActive: targetStatus });

      if (response && response.success) {
        // Safe binding from mutations response node
        const updatedAsset = response.plant || { ...nurseryPlants.find(p => p._id === plantId), isActive: targetStatus };
        dispatch(updatePlantInNurseryState(updatedAsset));
        toast.success(`Plant visibility shifted to ${targetStatus ? "Active" : "Inactive"}.`, { id: toastId });
      } else {
        await syncInventoryDataStream();
        toast.success("State synchronized successfully.", { id: toastId });
      }
    } catch (err: any) {
      // Catch framework error context to bypass handshake drops safely
      const fallBackErrorMessage = err?.message || err || "Network handshake dropped. Verify server up-state.";
      toast.error(`Operation Failed: ${fallBackErrorMessage}`, { id: toastId });
      console.warn("Handshake recovery handler bypass executed successfully.");
    } finally {
      setStatusLoadingMap((prev) => ({ ...prev, [plantId]: false }));
    }
  };

  // Custom Toast Confirmation Interface Wrapper Pipeline
  const handleRecordEviction = (plantId: string, plantName: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2.5 p-1">
        <p className="m-0 text-xs font-medium text-slate-800 leading-relaxed">
          Are you sure you want to delete <strong className="font-bold text-slate-900">"{plantName}"</strong>? This will clear all assets from DB and Cloudinary layers.
        </p>
        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-bold border-none cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              executeEvictionPipeline(plantId, plantName);
            }}
            className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold border-none cursor-pointer transition-colors shadow-xs"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: "top-center",
      style: { minWidth: "320px", padding: "12px" }
    });
  };

  // Safe Operational Execution Lifecycle Handler
  const executeEvictionPipeline = async (plantId: string, plantName: string) => {
    const loadingToast = toast.loading(`Evicting "${plantName}" from registry...`);
    try {
      await nurseryService.deletePlantAsset(plantId);
      dispatch(deletePlantFromNurseryState(plantId));
      toast.success(`Successfully removed "${plantName}"`, { id: loadingToast });
    } catch (err: any) {
      toast.error(err?.message || err || "Failed to delete inventory record row node.", { id: loadingToast });
    }
  };

  // Open modal handler function
  const handleOpenQuickModal = (plant: PlantRow) => {
    setSelectedPlant(plant);
    setIsModalOpen(true);
  };

  // Extract distinct category strings dynamically for the Dropdown Filter
  const distinctCategories = useMemo<string[]>(() => {
    if (!nurseryPlants.length) return [];
    const set = new Set(nurseryPlants.map((p: PlantRow) => p.category).filter(Boolean));
    return Array.from(set);
  }, [nurseryPlants]);

  // 📊 DataTable Column Architecture Definitions
  const columns = useMemo<ColumnConfig<PlantRow>[]>(() => [
    {
      header: "Plant Profile Identity",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 shadow-inner">
            <Image
              src={row.coverImage?.url || "/images/placeholder.svg"}
              alt={`${row.name} production blueprint`}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div>
            <span className="font-bold text-slate-900 block truncate max-w-[180px]">{row.name}</span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate max-w-[140px]">{row._id}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Category Variant Tag",
      accessorKey: "category",
      cell: (row) => (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-wider">
          {row.category}
        </span>
      ),
    },
    {
      header: "Price Value",
      accessorKey: "price",
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900">
          ₹{row.price?.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Stock In-House Units",
      accessorKey: "stock",
      cell: (row) => (
        <span className={`font-mono font-bold ${row.stock <= 5 ? "text-red-600 bg-red-50 px-2 py-0.5 rounded-md" : "text-slate-800"}`}>
          {row.stock} units
        </span>
      ),
    },
    {
      header: "Marketplace Status",
      accessorKey: "isActive",
      cell: (row) => {
        const isCurrentLoading = !!statusLoadingMap[row._id];
        return (
          <button
            type="button"
            disabled={isCurrentLoading}
            onClick={() => handleToggleActiveState(row._id, row.isActive)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-black tracking-wide uppercase cursor-pointer select-none transition-all ${isCurrentLoading
              ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
              : row.isActive
                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
              }`}
          >
            {isCurrentLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : row.isActive ? (
              <ToggleRight className="w-4 h-4 text-green-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-amber-500" />
            )}
            <span>{row.isActive ? "Active" : "Inactive"}</span>
          </button>
        );
      },
    },
    {
      header: "Customer Ratings",
      accessorKey: "ratings",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-amber-600">★ {row.ratings?.toFixed(1) || "0.0"}</span>
          <span className="text-slate-400 text-[10px] font-semibold">({row.numOfReviews || 0})</span>
        </div>
      ),
    },
    {
      header: "Actions Operations Engine",
      accessorKey: "_id",
      className: "text-right pr-6",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenQuickModal(row)}
            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            title="Quick Calibration (Price & Stock)"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => window.open(`/marketplace/plants/${row.slug}`, "_blank", "noopener,noreferrer")}
            className="p-2 text-slate-400 hover:text-green-600 hover:bg-slate-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            title="View Live Item Page"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => router.push(`/nursery/plants/edit/${row._id}`)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            title="Full Edit Configs"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleRecordEviction(row._id, row.name)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            title="Evict Asset From Store"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [router, statusLoadingMap, nurseryPlants]);

  return (
    <div className="w-full space-y-6">

      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            <Leaf className="text-green-600 w-5.5 h-5.5" />
            <span>Nursery Managed Inventory</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">
            Track stock multipliers, adjust live-store valuation pricings, and manage marketplace visibility toggles.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={syncInventoryDataStream}
            disabled={isLoading}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl cursor-pointer active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => router.push("/nursery/plants/new")}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-green-600/10 cursor-pointer transition-all border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Stock</span>
          </button>
        </div>
      </div>

      {/* Grid Status Tables */}
      {isLoading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Parsing live botanical asset registers...</span>
        </div>
      ) : error ? (
        <div className="w-full p-6 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-red-800 block">Stream Processing Failure Context Triggered</span>
            <span className="text-[11px] text-red-600 mt-0.5 block">{error}</span>
          </div>
        </div>
      ) : (
        <DataTable<PlantRow>
          data={nurseryPlants}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Filter stock by name..."
          filterKey="category"
          filterOptions={distinctCategories}
        />
      )}

      <QuickStockModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlant(null);
        }}
        plantData={selectedPlant}
      />

    </div>
  );
}