"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast"; // 👈 Added for uniform elegant notifications
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setNurseryLoading,
  setNurseryError,
  setNurseryAccessories,
  deleteAccessoryFromNurseryState,
  updateAccessoryInNurseryState // 👈 Added for state updates on status toggles
} from "@/redux/slices/nurserySlice";
import { nurseryService } from "@/services/nurseryService";
import {
  Plus,
  Sliders,
  Trash2,
  Edit3,
  Eye,
  Loader2,
  RefreshCw,
  AlertCircle,
  Layers,
  ToggleLeft,     // 👈 Added for status toggle UI
  ToggleRight     // 👈 Added for status toggle UI
} from "lucide-react";
import DataTable, { ColumnConfig } from "@/components/dashboard-common/DataTable";
import QuickStockModal from "@/components/nursery/QuickStockModal";

interface AccessoryRow {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean; // 👈 Mapped boolean flags for dynamic status engines
  ratings?: number;
  numOfReviews?: number;
  coverImage: {
    url: string;
  };
}

export default function NurseryAccessoriesInventoryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const nurseryAccessories = useAppSelector((state) => state.nursery.nurseryAccessories) as AccessoryRow[];
  const isLoading = useAppSelector((state) => state.nursery.isLoading);
  const error = useAppSelector((state) => state.nursery.error);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<AccessoryRow | null>(null);
  const [statusLoadingMap, setStatusLoadingMap] = useState<Record<string, boolean>>({}); // 👈 Loading map state for rows

  const syncInventoryDataStream = async () => {
    dispatch(setNurseryLoading(true));
    try {
      const response = await nurseryService.getMyAccessories();
      dispatch(setNurseryAccessories(response.accessories || []));
    } catch (err: any) {
      dispatch(setNurseryError(err?.message || "Parsing network stream error nodes."));
    }
  };

  useEffect(() => {
    syncInventoryDataStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔄 ✨ NEWLY ADDED: Fixed Runtime Inline Operational Status Toggle Engine for Accessories
  const handleToggleActiveState = async (accId: string, currentStatus: boolean) => {
    setStatusLoadingMap((prev) => ({ ...prev, [accId]: true }));
    const targetStatus = !currentStatus;
    const toastId = toast.loading(`${targetStatus ? "Activating" : "Deactivating"} live marketplace display...`);

    try {
      const response = await nurseryService.updateAccessoryStatus(accId, { isActive: targetStatus });

      if (response && response.success) {
        // Fallback context optimization binding safely if response lacks full entity
        const updatedAsset = response.accessory || { ...nurseryAccessories.find(a => a._id === accId), isActive: targetStatus };
        dispatch(updateAccessoryInNurseryState(updatedAsset));
        toast.success(`Accessory visibility shifted to ${targetStatus ? "Active" : "Inactive"}.`, { id: toastId });
      } else {
        await syncInventoryDataStream();
        toast.success("State synchronized successfully.", { id: toastId });
      }
    } catch (err: any) {
      const fallBackErrorMessage = err?.message || err || "Network handshake dropped. Verify server up-state.";
      toast.error(`Operation Failed: ${fallBackErrorMessage}`, { id: toastId });
    } finally {
      setStatusLoadingMap((prev) => ({ ...prev, [accId]: false }));
    }
  };

  // 🛠️ RECTIFIED: Native confirmation layer replaced with dynamic clean toasts pipeline
  const handleRecordEviction = async (accId: string, accName: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2.5 p-1 text-slate-800">
        <p className="text-xs font-semibold m-0 leading-relaxed">
          Are you sure you want to delete <span className="font-bold text-slate-950">"{accName}"</span>? This clears data across both DB and Cloudinary layers.
        </p>
        <div className="flex items-center justify-end gap-2 mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const deletionToast = toast.loading(`Evicting "${accName}" from registers...`);
              try {
                await nurseryService.deleteAccessoryAsset(accId);
                dispatch(deleteAccessoryFromNurseryState(accId));
                toast.success("Accessory asset discarded successfully!", { id: deletionToast });
              } catch (err: any) {
                toast.error(err?.message || "Failed to successfully delete inventory record row node.", { id: deletionToast });
              }
            }}
            className="px-2.5 py-1.5 rounded-lg border-0 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    ), { duration: 5000, position: "top-center" });
  };

  const handleOpenQuickModal = (acc: AccessoryRow) => {
    setSelectedAccessory(acc);
    setIsModalOpen(true);
  };

  const distinctCategories = useMemo(() => {
    if (!Array.isArray(nurseryAccessories) || !nurseryAccessories.length) return [];
    const set = new Set(nurseryAccessories.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [nurseryAccessories]);

  const columns = useMemo<ColumnConfig<AccessoryRow>[]>(() => [
    {
      header: "Accessory Asset Identity",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 shadow-inner">
            <Image
              src={row.coverImage?.url || "/images/placeholder.svg"}
              alt={`${row.name} blueprint`}
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
      header: "Utility Category Tag",
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
      header: "Marketplace Status", // 👈 ✨ NEWLY ADDED: Status engine columns mapping block built
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
            title="Quick Calibration"
          >
            <Layers className="w-4 h-4" />
          </button>

          <a
            href={`/marketplace/accessories/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-green-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="View Live Item"
          >
            <Eye className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={() => router.push(`/nursery/accessories/edit/${row._id}`)}
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
  ], [router, statusLoadingMap, nurseryAccessories]); // 👈 Appended bindings array matrix mappings correctly

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            <Sliders className="text-blue-600 w-5.5 h-5.5" />
            <span>Nursery Managed Gardening Accessories</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">
            Track stock multipliers, adjust live-store valuation pricings, and analyze user submission updates.
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

          <Link href="/nursery/accessories/new" className="no-underline flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/10 cursor-pointer transition-all active:scale-98">
            <Plus className="w-4 h-4" />
            <span>Add Accessories</span>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Parsing live technical gear registers...</span>
        </div>
      ) : error ? (
        <div className="w-full p-6 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-red-800 block">Stream Processing Failure</span>
            <span className="text-[11px] text-red-600 mt-0.5 block">{error}</span>
          </div>
        </div>
      ) : (
        <DataTable<AccessoryRow>
          data={nurseryAccessories}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Filter tools by name..."
          filterKey="category"
          filterOptions={distinctCategories}
        />
      )}

      <QuickStockModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAccessory(null);
        }}
        plantData={selectedAccessory as any}
      />
    </div>
  );
}