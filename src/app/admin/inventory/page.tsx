"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setAdminProductLoading,
  setAdminProductError,
  setAdminProductsData,
  updateProductStatusInState,
  deleteProductFromAdminState
} from "@/redux/slices/adminProductSlice";
import { adminProductService, getAdminResourceConfig } from "@/services/adminProductService";
import { AdminResourceType } from "@/types/adminProduct.types";
import {
  Leaf,
  Container,
  Wrench,
  Trash2,
  Eye,
  Loader2,
  RefreshCw,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Building2,
  Shovel,
  Droplets,
  Sprout,
  LayoutGrid,
  Flower2,
  LucideIcon
} from "lucide-react";
import DataTable, { ColumnConfig } from "@/components/dashboard-common/DataTable";

type ResourceType = AdminResourceType;

interface AdminProductRow {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  ratings?: number;
  slug?: string,
  numOfReviews?: number;
  coverImage: {
    url: string;
  };
  nursery: {
    _id: string;
    name: string;
    location?: string;
    email?: string;
  };
}

const INVENTORY_TABS: {
  id: ResourceType;
  label: string;
  icon: LucideIcon;
  activeClass: string;
}[] = [
  { id: "plant", label: "Botanical Plants", icon: Leaf, activeClass: "bg-white text-green-700 shadow-xs" },
  { id: "pot", label: "Planter Pots", icon: Container, activeClass: "bg-white text-amber-700 shadow-xs" },
  { id: "accessory", label: "Ecosystem Accessories", icon: Wrench, activeClass: "bg-white text-blue-700 shadow-xs" },
  { id: "gardeningTool", label: "Gardening Tools", icon: Shovel, activeClass: "bg-white text-orange-700 shadow-xs" },
  { id: "plantCare", label: "Plant Care", icon: Droplets, activeClass: "bg-white text-cyan-700 shadow-xs" },
  { id: "seedsBulbs", label: "Seeds & Bulbs", icon: Sprout, activeClass: "bg-white text-lime-700 shadow-xs" },
  { id: "plantStandsShelves", label: "Stands & Shelves", icon: LayoutGrid, activeClass: "bg-white text-violet-700 shadow-xs" },
  { id: "artificial", label: "Artificial & Dried", icon: Flower2, activeClass: "bg-white text-rose-700 shadow-xs" },
];

export default function AdminGlobalInventoryPage() {
  const dispatch = useAppDispatch();
  const { products = [], isLoading, error } = useAppSelector((state) => state.adminProduct);

  // 🎛️ Active Tab State & Local loading maps
  const [activeTab, setActiveTab] = useState<ResourceType>("plant");
  const [statusLoadingMap, setStatusLoadingMap] = useState<Record<string, boolean>>({});

  const activeTabLabel = INVENTORY_TABS.find((t) => t.id === activeTab)?.label ?? activeTab;

  // Sync Global Data Stream from Admin Endpoint
  const syncGlobalDataStream = async (type: ResourceType) => {
    dispatch(setAdminProductLoading(true));
    try {
      const response = await adminProductService.getAdminAllProducts(type);
      const { responseKey } = getAdminResourceConfig(type);
      const fetchedProducts = response[responseKey] || [];

      dispatch(setAdminProductsData({
        products: fetchedProducts,
        totalCount: response.totalCount || fetchedProducts.length,
        filteredCount: response.filteredCount || fetchedProducts.length
      }));
    } catch (err: any) {
      const errMsg = err?.message || err || "Failed to parse system catalog streams.";
      dispatch(setAdminProductError(errMsg));
      toast.error(errMsg);
    }
  };

  // Trigger stream on tab change
  useEffect(() => {
    syncGlobalDataStream(activeTab);
  }, [activeTab]);

  // 🔄 Administrative Runtime Status Toggle Switch Engine
  const handleToggleActiveState = async (id: string, currentStatus: boolean) => {
    setStatusLoadingMap((prev) => ({ ...prev, [id]: true }));
    const targetStatus = !currentStatus;
    const toastId = toast.loading(`System Override: ${targetStatus ? "Activating" : "Deactivating"} asset visible flags...`);

    try {
      const response = await adminProductService.toggleProductStatus(activeTab, id);
      if (response && response.success) {
        dispatch(updateProductStatusInState({ id, isActive: response.isActive }));
        toast.success(`Product marketplace visibility altered successfully.`, { id: toastId });
      }
    } catch (err: any) {
      toast.error(`Override Failed: ${err?.message || "Handshake dropped."}`, { id: toastId });
    } finally {
      setStatusLoadingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Admin Eviction Flow Wrapper
  const handleAdminRecordEviction = (id: string, name: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2.5 p-1">
        <p className="m-0 text-xs font-medium text-slate-800 leading-relaxed">
          <span className="text-red-600 font-bold block mb-1">⚠️ ADMINISTRATIVE HARD DELETE</span>
          Are you sure you want to permanently erase <strong className="font-bold text-slate-900">"{name}"</strong>? This clears database entries and removes media layers globally from Cloudinary.
        </p>
        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-bold border-none cursor-pointer transition-colors"
          >
            Abort
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              executeAdminEvictionPipeline(id, name);
            }}
            className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold border-none cursor-pointer transition-colors shadow-xs"
          >
            Force Evict
          </button>
        </div>
      </div>
    ), {
      duration: 7000,
      position: "top-center",
      style: { minWidth: "340px", padding: "14px" }
    });
  };

  // Execution call to service layer
  const executeAdminEvictionPipeline = async (id: string, name: string) => {
    const loadingToast = toast.loading(`Purging "${name}" from ecosystem registers...`);
    try {
      await adminProductService.deleteProductForce(activeTab, id);
      dispatch(deleteProductFromAdminState(id));
      toast.success(`Ecosystem record successfully wiped.`, { id: loadingToast });
    } catch (err: any) {
      toast.error(err?.message || "Purge tracking pipeline exception context.", { id: loadingToast });
    }
  };

  // Dynamic Distinct Categories Extraction
  const distinctCategories = useMemo<string[]>(() => {
    if (!products.length) return [];
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [products]);

  // 📊 Columns Architecture Configuration Matrix
  const columns = useMemo<ColumnConfig<AdminProductRow>[]>(() => [
    {
      header: "Product Assets Blueprint",
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
            <span className="font-bold text-slate-900 block truncate max-w-[160px]">{row.name}</span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate max-w-[140px]">{row._id}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Source Vendor (Nursery)",
      accessorKey: "nursery",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[150px]">{row.nursery?.name || "System Injected"}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
            {row.nursery?.location || "Unknown Location"}
          </span>
        </div>
      ),
    },
    {
      header: "Category Tag",
      accessorKey: "category",
      cell: (row) => (
        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-wider">
          {row.category}
        </span>
      ),
    },
    {
      header: "Valuation Price",
      accessorKey: "price",
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900">
          ₹{row.price?.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "System Stocks",
      accessorKey: "stock",
      cell: (row) => (
        <span className={`font-mono font-bold ${row.stock <= 5 ? "text-red-600 bg-red-50 px-2 py-0.5 rounded-md" : "text-slate-800"}`}>
          {row.stock} units
        </span>
      ),
    },
    {
      header: "Visibility Status",
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
      header: "Ecosystem Actions",
      accessorKey: "_id",
      className: "text-right pr-6",
      cell: (row) => {
        const shopType = getAdminResourceConfig(activeTab).shopType;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => window.open(`/shop/${shopType}/${row.slug || ""}`, "_blank", "noopener,noreferrer")}
              className="p-2 text-slate-400 hover:text-green-600 hover:bg-slate-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
              title="Inspect Live Node Object"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleAdminRecordEviction(row._id, row.name)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
              title="Administrative Force Purge Matrix"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ], [activeTab, statusLoadingMap, products]);

  return (
    <div className="w-full space-y-6">

      {/* Title Bar Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            <span>Global Administrative Catalog Matrix</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">
            Override product visibility parameters, audit distinct vendor-wise stock clusters, and implement system catalog force purges.
          </p>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => syncGlobalDataStream(activeTab)}
            disabled={isLoading}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl cursor-pointer active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 🎛️ Operational Control Tabs Interface Engine */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-fit border border-slate-200/60">
        {INVENTORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black transition-all border-none cursor-pointer ${isActive
                ? tab.activeClass
                : "text-slate-500 hover:text-slate-800 bg-transparent"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid Dynamic Sub-Layers Tables */}
      {isLoading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Mapping systemic global clusters for {activeTabLabel}...
          </span>
        </div>
      ) : error ? (
        <div className="w-full p-6 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-red-800 block">System Infrastructure Stream Exception context triggered</span>
            <span className="text-[11px] text-red-600 mt-0.5 block">{error}</span>
          </div>
        </div>
      ) : (
        <DataTable<AdminProductRow>
          data={products}
          columns={columns}
          searchKey="name"
          searchPlaceholder={`Filter global ${activeTabLabel.toLowerCase()} by name...`}
          filterKey="category"
          filterOptions={distinctCategories}
        />
      )}

    </div>
  );
}
