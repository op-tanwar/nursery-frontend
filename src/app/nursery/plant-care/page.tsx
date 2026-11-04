"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setNurseryLoading,
  setNurseryError,
  setNurseryPlantCare,
  deletePlantCareFromNurseryState,
  updatePlantCareInNurseryState,
} from "@/redux/slices/nurserySlice";
import { nurseryService } from "@/services/nurseryService";
import {
  Plus,
  ShieldCheck,
  Trash2,
  Edit3,
  Eye,
  Loader2,
  RefreshCw,
  AlertCircle,
  Layers,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import DataTable, { ColumnConfig } from "@/components/dashboard-common/DataTable";
import QuickStockModal from "@/components/nursery/QuickStockModal";

interface PlantCareRow {
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

export default function NurseryPlantCarePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { nurseryPlantCare: plantCareList = [], isLoading, error } = useAppSelector(
    (state) => state.nursery
  );
  const plantCareItems = plantCareList as unknown as PlantCareRow[];

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<PlantCareRow | null>(null);
  const [statusLoadingMap, setStatusLoadingMap] = useState<Record<string, boolean>>({});

  const syncInventoryDataStream = async () => {
    dispatch(setNurseryLoading(true));
    try {
      const response = await nurseryService.getMyPlantCare();
      const items = response.products || response.plantCare || [];
      dispatch(setNurseryPlantCare(items));
    } catch (err: any) {
      const errMsg = err?.message || err || "Parsing network stream error nodes.";
      dispatch(setNurseryError(errMsg));
      toast.error(errMsg);
    }
  };

  useEffect(() => {
    syncInventoryDataStream();
  }, []);

  const handleToggleActiveState = async (id: string, currentStatus: boolean) => {
    setStatusLoadingMap((prev) => ({ ...prev, [id]: true }));
    const targetStatus = !currentStatus;
    const toastId = toast.loading(`${targetStatus ? "Activating" : "Deactivating"} live marketplace display...`);

    try {
      const response = await nurseryService.togglePlantCareStatus(id);

      if (response && response.success) {
        const existing = plantCareItems.find((item) => item._id === id);
        const updatedAsset = {
          ...existing,
          _id: id,
          isActive: (response as any).isActive ?? targetStatus,
        } as PlantCareRow;
        dispatch(updatePlantCareInNurseryState(updatedAsset as any));
        toast.success(`Care item visibility shifted to ${targetStatus ? "Active" : "Inactive"}.`, { id: toastId });
      } else {
        await syncInventoryDataStream();
        toast.success("State synchronized successfully.", { id: toastId });
      }
    } catch (err: any) {
      const fallBackErrorMessage = err?.message || err || "Network handshake dropped. Verify server up-state.";
      toast.error(`Operation Failed: ${fallBackErrorMessage}`, { id: toastId });
    } finally {
      setStatusLoadingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRecordEviction = (id: string, name: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2.5 p-1">
        <p className="m-0 text-xs font-medium text-slate-800 leading-relaxed">
          Are you sure you want to delete <strong className="font-bold text-slate-900">"{name}"</strong>? This will clear all assets from DB and Cloudinary layers.
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
              executeEvictionPipeline(id, name);
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
      style: { minWidth: "320px", padding: "12px" },
    });
  };

  const executeEvictionPipeline = async (id: string, name: string) => {
    const loadingToast = toast.loading(`Evicting "${name}" from registry...`);
    try {
      await nurseryService.deletePlantCare(id);
      dispatch(deletePlantCareFromNurseryState(id));
      toast.success(`Successfully removed "${name}"`, { id: loadingToast });
    } catch (err: any) {
      toast.error(err?.message || err || "Failed to delete inventory record row node.", { id: loadingToast });
    }
  };

  const handleOpenQuickModal = (item: PlantCareRow) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const distinctCategories = useMemo<string[]>(() => {
    if (!plantCareItems.length) return [];
    const set = new Set(plantCareItems.map((t) => t.category).filter(Boolean) as string[]);
    return Array.from(set);
  }, [plantCareItems]);

  const columns = useMemo<ColumnConfig<PlantCareRow>[]>(() => [
    {
      header: "Formulation Identity",
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
            <span className="text-[10px] text-slate-400 font-mono tracking-tight">{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/60 shadow-xs">
          <Layers className="w-3 h-3 text-emerald-500" />
          {row.category}
        </span>
      ),
    },
    {
      header: "Unit Price",
      accessorKey: "price",
      cell: (row) => (
        <span className="font-bold text-slate-800 text-sm">
          ₹{row.price?.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Warehouse Reserve",
      accessorKey: "stock",
      cell: (row) => {
        const isDepleted = row.stock === 0;
        const isCritical = row.stock > 0 && row.stock <= 5;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isDepleted ? "bg-red-500" : isCritical ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
            <span
              className={`font-semibold text-xs ${
                isDepleted ? "text-red-600" : isCritical ? "text-amber-600" : "text-slate-600"
              }`}
            >
              {row.stock} {isDepleted ? "(Out)" : "units"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Marketplace State",
      accessorKey: "isActive",
      cell: (row) => {
        const isOperating = !!statusLoadingMap[row._id];
        return (
          <button
            onClick={() => handleToggleActiveState(row._id, row.isActive)}
            disabled={isOperating}
            title={row.isActive ? "Deactivate Formulation from Public Access" : "Activate Formulation for Public Access"}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs cursor-pointer ${
              row.isActive
                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200"
            } ${isOperating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isOperating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
            ) : row.isActive ? (
              <ToggleRight className="w-4 h-4 text-emerald-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-400" />
            )}
            <span>{row.isActive ? "Active" : "Draft"}</span>
          </button>
        );
      },
    },
    {
      header: "Control Actions",
      accessorKey: "_id",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenQuickModal(row)}
            title="Fast Modify Stock / Price"
            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/shop/plant-care/${row.slug}`)}
            title="View Live Listing Document"
            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/nursery/plant-care/edit/${row._id}`)}
            title="Edit Full Attributes Specification"
            className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleRecordEviction(row._id, row.name)}
            title="Permanently Delete Formulation Blueprint"
            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [plantCareItems, statusLoadingMap]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Plant Care & Nutrition Registry
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Govern fertilizers, nutrients, soil remedies and organic protection matrices.
          </p>
        </div>

        <button
          onClick={() => router.push("/nursery/plant-care/new")}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 border-none cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Register New Formulation</span>
        </button>
      </div>

      {isLoading && !plantCareItems.length ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-100 space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading formulations catalog telemetry...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <span className="text-xs font-bold text-red-800 block">Stream Processing Failure Context Triggered</span>
            <span className="text-[11px] text-red-600 mt-0.5 block">{error}</span>
          </div>
        </div>
      ) : (
        <DataTable<PlantCareRow>
          data={plantCareItems}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Filter items by name..."
          filterKey="category"
          filterOptions={distinctCategories}
        />
      )}

      <QuickStockModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        plantData={selectedItem}
        onUpdate={(id, formData) => nurseryService.updatePlantCare(id, formData)}
        onSuccess={(updated) => {
          const item = updated?.plantCare || updated?.product || updated;
          if (item?._id) dispatch(updatePlantCareInNurseryState(item));
        }}
      />
    </div>
  );
}
