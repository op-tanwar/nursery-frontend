"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAppSelector } from "@/redux/hooks";
import { taxService, ICategoryTax } from "@/services/taxService";
import toast from "react-hot-toast";
import {
  Percent,
  RefreshCw,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Edit2,
  ShieldAlert,
  Tag,
  Info,
  X,
  Plus,
  Trash2,
  Layers,
} from "lucide-react";

const CATEGORY_EMOJIS: Record<string, string> = {
  Plants: "🌱",
  Pots: "🏺",
  Accessories: "🎀",
  "Gardening Tools": "✂️",
  "Plant Care": "🧪",
  "Seeds & Bulbs": "🌰",
  "Plant Stands": "🪴",
  "Artificial & Dried Plants": "🌾",
};

const DEFAULT_FALLBACK_TAXES: ICategoryTax[] = [
  {
    _id: "default-plants",
    category: "Plants",
    itemModel: "Plant",
    taxPercentage: 5,
    isTaxInclusive: false,
    description: "Live plants, saplings, and indoor/outdoor botanical greenery (5% GST).",
  },
  {
    _id: "default-pots",
    category: "Pots",
    itemModel: "Pot",
    taxPercentage: 12,
    isTaxInclusive: false,
    description: "Ceramic, terracotta, fiber, and plastic planters (12% GST).",
  },
  {
    _id: "default-accessories",
    category: "Accessories",
    itemModel: "Accessory",
    taxPercentage: 18,
    isTaxInclusive: false,
    description: "Watering cans, decorative pebbles, drip trays, and garden decor (18% GST).",
  },
  {
    _id: "default-tools",
    category: "Gardening Tools",
    itemModel: "GardeningTool",
    taxPercentage: 18,
    isTaxInclusive: false,
    description: "Pruners, shears, trowels, shovels, and metal gardening equipment (18% GST).",
  },
  {
    _id: "default-care",
    category: "Plant Care",
    itemModel: "PlantCare",
    taxPercentage: 12,
    isTaxInclusive: false,
    description: "Bio-fertilizers, neem oil sprays, potting soil mixes, and organic nutrients (12% GST).",
  },
  {
    _id: "default-seeds",
    category: "Seeds & Bulbs",
    itemModel: "SeedsBulbs",
    taxPercentage: 0,
    isTaxInclusive: false,
    description: "Agricultural seeds, flower bulbs, and kitchen garden planting seed packs (0% GST - Exempt).",
  },
  {
    _id: "default-stands",
    category: "Plant Stands",
    itemModel: "PlantStandsShelves",
    taxPercentage: 18,
    isTaxInclusive: false,
    description: "Iron/metal stands, wooden multi-tier shelves, and corner planters (18% GST).",
  },
  {
    _id: "default-artificial",
    category: "Artificial & Dried Plants",
    itemModel: "ArtificialDriedPlant",
    taxPercentage: 18,
    isTaxInclusive: false,
    description: "Synthetic flora, preserved stems, dried moss, and botanical home accents (18% GST).",
  },
];

const AVAILABLE_MODELS = [
  "Plant",
  "Pot",
  "Accessory",
  "GardeningTool",
  "PlantCare",
  "SeedsBulbs",
  "PlantStandsShelves",
  "ArtificialDriedPlant",
  "Custom",
];

export default function AdminTaxSettingsPage() {
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const [taxes, setTaxes] = useState<ICategoryTax[]>([]);
  const [draftTaxes, setDraftTaxes] = useState<
    Record<string, { taxPercentage: number; isTaxInclusive: boolean; description?: string }>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Edit Modal State
  const [modalItem, setModalItem] = useState<ICategoryTax | null>(null);
  const [modalPercentage, setModalPercentage] = useState<number>(0);
  const [modalInclusive, setModalInclusive] = useState<boolean>(false);
  const [modalDescription, setModalDescription] = useState<string>("");

  // Add Category Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [newItemModel, setNewItemModel] = useState<string>("Plant");
  const [newTaxRate, setNewTaxRate] = useState<number>(18);
  const [newIsInclusive, setNewIsInclusive] = useState<boolean>(false);
  const [newDescription, setNewDescription] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const fetchTaxes = async () => {
    setIsLoading(true);
    try {
      const response: any = await taxService.getAllTaxes();
      let list: ICategoryTax[] =
        response?.taxes || response?.data || (Array.isArray(response) ? response : []);

      // If backend returns an empty list or unseeded table, fallback to default statutory slabs
      if (!list || list.length === 0) {
        console.warn("[AdminTax] No taxes returned from server. Populating statutory default slabs.");
        list = DEFAULT_FALLBACK_TAXES;
      }

      setTaxes(list);

      // Initialize draft editing mapping
      const initialDraft: Record<
        string,
        { taxPercentage: number; isTaxInclusive: boolean; description?: string }
      > = {};
      list.forEach((t) => {
        initialDraft[t._id] = {
          taxPercentage: t.taxPercentage,
          isTaxInclusive: t.isTaxInclusive,
          description: t.description,
        };
      });
      setDraftTaxes(initialDraft);
    } catch (err: any) {
      console.error("Failed to load taxes from API:", err);
      // Fallback to offline defaults so admin is never locked out
      setTaxes(DEFAULT_FALLBACK_TAXES);
      const initialDraft: Record<
        string,
        { taxPercentage: number; isTaxInclusive: boolean; description?: string }
      > = {};
      DEFAULT_FALLBACK_TAXES.forEach((t) => {
        initialDraft[t._id] = {
          taxPercentage: t.taxPercentage,
          isTaxInclusive: t.isTaxInclusive,
          description: t.description,
        };
      });
      setDraftTaxes(initialDraft);
      toast.error(
        err?.response?.data?.message ||
          "Could not reach remote tax service. Loaded default statutory GST slabs."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handlePercentageChange = (id: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));
    setDraftTaxes((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        taxPercentage: clamped,
      },
    }));
  };

  const handleInclusiveToggle = (id: string) => {
    setDraftTaxes((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isTaxInclusive: !prev[id]?.isTaxInclusive,
      },
    }));
  };

  const hasUnsavedChanges = useMemo(() => {
    return taxes.some((t) => {
      const draft = draftTaxes[t._id];
      if (!draft) return false;
      return (
        draft.taxPercentage !== t.taxPercentage ||
        draft.isTaxInclusive !== t.isTaxInclusive ||
        draft.description !== t.description
      );
    });
  }, [taxes, draftTaxes]);

  const handleSaveSingle = async (taxItem: ICategoryTax) => {
    const draft = draftTaxes[taxItem._id];
    if (!draft) return;

    const toastId = toast.loading(`Saving ${taxItem.category} tax slab...`);
    try {
      if (taxItem._id.startsWith("default-")) {
        // Unseeded item: save via bulk or create
        await taxService.bulkUpdateCategoryTaxes([
          {
            category: taxItem.category,
            itemModel: taxItem.itemModel,
            taxPercentage: draft.taxPercentage,
            isTaxInclusive: draft.isTaxInclusive,
            description: draft.description,
          },
        ]);
      } else {
        await taxService.updateCategoryTax(taxItem._id, {
          taxPercentage: draft.taxPercentage,
          isTaxInclusive: draft.isTaxInclusive,
          description: draft.description,
        });
      }
      toast.success(`${taxItem.category} tax rate updated successfully!`, { id: toastId });
      fetchTaxes();
    } catch (err: any) {
      console.error("Save single tax failed:", err);
      toast.error(err?.response?.data?.message || "Failed to update tax rate.", { id: toastId });
    }
  };

  const handleSaveAll = async () => {
    if (!hasUnsavedChanges) {
      toast("No changes to save.", { icon: "ℹ️" });
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving all category tax modifications...");
    try {
      const updates = taxes.map((t) => ({
        id: t._id.startsWith("default-") ? undefined : t._id,
        category: t.category,
        itemModel: t.itemModel,
        taxPercentage: draftTaxes[t._id]?.taxPercentage ?? t.taxPercentage,
        isTaxInclusive: draftTaxes[t._id]?.isTaxInclusive ?? t.isTaxInclusive,
        description: draftTaxes[t._id]?.description ?? t.description,
      }));

      await taxService.bulkUpdateCategoryTaxes(updates);
      toast.success("All category tax rates synchronized successfully!", { id: toastId });
      fetchTaxes();
    } catch (err: any) {
      console.error("Bulk save failed:", err);
      toast.error(err?.response?.data?.message || "Failed to apply bulk tax updates.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (
      !window.confirm(
        "Are you sure you want to restore official GST default slabs?\n\n- Plants: 5%\n- Pots: 12%\n- Plant Care: 12%\n- Seeds & Bulbs: 0% (Exempt)\n- Tools & Accessories: 18%"
      )
    ) {
      return;
    }

    setIsResetting(true);
    const toastId = toast.loading("Restoring official GST tax rates...");
    try {
      await taxService.resetDefaultTaxes();
      toast.success("GST rates restored to official defaults!", { id: toastId });
      fetchTaxes();
    } catch (err: any) {
      console.error("Reset failed:", err);
      // Fallback: seed via bulk update if reset endpoint fails
      try {
        await taxService.bulkUpdateCategoryTaxes(DEFAULT_FALLBACK_TAXES);
        toast.success("GST rates restored to official defaults!", { id: toastId });
        fetchTaxes();
      } catch (fbErr: any) {
        toast.error(fbErr?.response?.data?.message || "Failed to reset tax rates.", { id: toastId });
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove tax configuration for "${name}"?`)) {
      return;
    }

    const toastId = toast.loading(`Removing ${name}...`);
    try {
      await taxService.deleteCategoryTax(id);
      toast.success(`Removed tax configuration for ${name}.`, { id: toastId });
      fetchTaxes();
    } catch (err: any) {
      console.error("Delete category failed:", err);
      toast.error(err?.response?.data?.message || "Failed to delete category tax rule.", { id: toastId });
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }

    setIsCreating(true);
    const toastId = toast.loading(`Registering ${newCategoryName.trim()}...`);
    try {
      await taxService.createCategoryTax({
        category: newCategoryName.trim(),
        itemModel: newItemModel,
        taxPercentage: newTaxRate,
        isTaxInclusive: newIsInclusive,
        description: newDescription.trim() || undefined,
      });

      toast.success(`Category "${newCategoryName.trim()}" registered successfully!`, { id: toastId });
      setIsAddModalOpen(false);
      setNewCategoryName("");
      setNewDescription("");
      setNewTaxRate(18);
      fetchTaxes();
    } catch (err: any) {
      console.error("Create category failed:", err);
      toast.error(err?.response?.data?.message || "Failed to register new category tax.", { id: toastId });
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (item: ICategoryTax) => {
    const draft = draftTaxes[item._id] || item;
    setModalItem(item);
    setModalPercentage(draft.taxPercentage);
    setModalInclusive(draft.isTaxInclusive);
    setModalDescription(draft.description || "");
  };

  const closeEditModal = () => {
    setModalItem(null);
  };

  const handleModalSave = async () => {
    if (!modalItem) return;
    const toastId = toast.loading(`Updating ${modalItem.category}...`);
    try {
      if (modalItem._id.startsWith("default-")) {
        await taxService.bulkUpdateCategoryTaxes([
          {
            category: modalItem.category,
            itemModel: modalItem.itemModel,
            taxPercentage: modalPercentage,
            isTaxInclusive: modalInclusive,
            description: modalDescription,
          },
        ]);
      } else {
        await taxService.updateCategoryTax(modalItem._id, {
          taxPercentage: modalPercentage,
          isTaxInclusive: modalInclusive,
          description: modalDescription,
        });
      }
      toast.success(`Tax settings for ${modalItem.category} updated!`, { id: toastId });
      closeEditModal();
      fetchTaxes();
    } catch (err: any) {
      console.error("Modal save failed:", err);
      toast.error(err?.response?.data?.message || "Failed to save category tax settings.", { id: toastId });
    }
  };

  const filteredTaxes = useMemo(() => {
    if (!searchQuery.trim()) return taxes;
    const q = searchQuery.toLowerCase();
    return taxes.filter(
      (t) =>
        t.category.toLowerCase().includes(q) ||
        t.itemModel.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }, [taxes, searchQuery]);

  // Statistics
  const avgTaxRate = useMemo(() => {
    if (!taxes.length) return 0;
    const sum = taxes.reduce(
      (acc, t) => acc + (draftTaxes[t._id]?.taxPercentage ?? t.taxPercentage),
      0
    );
    return Math.round((sum / taxes.length) * 10) / 10;
  }, [taxes, draftTaxes]);

  const exemptCount = useMemo(() => {
    return taxes.filter(
      (t) => (draftTaxes[t._id]?.taxPercentage ?? t.taxPercentage) === 0
    ).length;
  }, [taxes, draftTaxes]);

  // Security authorization check (only block if user is confirmed non-admin)
  if (!authLoading && user && user.role !== "admin") {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Restricted Administrative Area</h2>
        <p className="text-sm text-slate-500">
          Only authorized Executive Administrators can modify category-level GST tax rules.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🟢 TOP HEADER WITH ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                Category GST Tax Settings
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Active System
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Manage dynamic GST slabs across all product categories. Zero trust on client prices; enforced directly on server.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchTaxes}
            disabled={isLoading}
            className="p-2.5 border border-slate-200 hover:border-slate-300 rounded-xl bg-white text-slate-600 hover:bg-slate-50 cursor-pointer transition text-xs font-semibold flex items-center gap-1.5"
            title="Refresh tax rates from database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2.5 border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl cursor-pointer transition text-xs font-bold flex items-center gap-1.5"
            title="Add a new category tax slab"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>Add Category</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isResetting || isLoading}
            className="px-3.5 py-2.5 border border-amber-200 text-amber-800 hover:bg-amber-50 rounded-xl bg-amber-50/40 cursor-pointer transition text-xs font-bold flex items-center gap-1.5"
            title="Restore official Indian GST slab defaults"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Reset GST Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={!hasUnsavedChanges || isSaving || isLoading}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl cursor-pointer transition text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* 📊 KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0">
              Managed Categories
            </p>
            <p className="text-2xl font-black text-slate-900 m-0">{taxes.length} Categories</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0">
              Average Tax Rate
            </p>
            <p className="text-2xl font-black text-emerald-600 m-0">{avgTaxRate}% GST</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0">
              Exempt Categories (0%)
            </p>
            <p className="text-2xl font-black text-amber-700 m-0">{exemptCount} Category</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0">
              Precision Engine
            </p>
            <p className="text-xs font-bold text-slate-900 m-0">Paise-Safe (Integer math)</p>
            <p className="text-[10px] text-slate-400 m-0">Zero floating-point drift</p>
          </div>
        </div>
      </div>

      {/* ⚠️ UNSAVED CHANGES NOTICE */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You have modified tax rates that have not yet been synchronized with the database.</span>
          </div>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-3 py-1 bg-amber-700 text-white rounded-lg text-xs font-bold hover:bg-amber-800 transition cursor-pointer"
          >
            Apply Changes Now
          </button>
        </div>
      )}

      {/* 📋 TAX TABLE CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search category or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
            <Info className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <b className="text-slate-700">{filteredTaxes.length}</b> of {taxes.length} Categories
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 sm:px-6">Category & Model</th>
                <th className="py-3.5 px-4 text-center">Current GST Rate</th>
                <th className="py-3.5 px-4 text-center">Tax Type</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Description / Notes</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Last Updated</th>
                <th className="py-3.5 px-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>Loading category tax configurations...</span>
                  </td>
                </tr>
              ) : filteredTaxes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No categories found matching your query.
                  </td>
                </tr>
              ) : (
                filteredTaxes.map((tax) => {
                  const draft = draftTaxes[tax._id] || {
                    taxPercentage: tax.taxPercentage,
                    isTaxInclusive: tax.isTaxInclusive,
                    description: tax.description,
                  };
                  const isModified =
                    draft.taxPercentage !== tax.taxPercentage ||
                    draft.isTaxInclusive !== tax.isTaxInclusive;

                  const emoji = CATEGORY_EMOJIS[tax.category] || "🪴";

                  return (
                    <tr
                      key={tax._id}
                      className={`hover:bg-slate-50/60 transition ${
                        isModified ? "bg-amber-50/30" : ""
                      }`}
                    >
                      {/* 🏷️ Category & Model */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <span className="text-xl select-none">{emoji}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-sm">{tax.category}</span>
                              {isModified && (
                                <span
                                  className="inline-block w-2 h-2 rounded-full bg-amber-500"
                                  title="Unsaved changes"
                                />
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              Model: {tax.itemModel}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 🔢 Current GST Rate % */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={draft.taxPercentage}
                            onChange={(e) =>
                              handlePercentageChange(tax._id, parseFloat(e.target.value))
                            }
                            className="w-14 text-center font-black text-slate-900 bg-white border border-slate-200 rounded-lg py-1 text-sm focus:outline-none focus:border-emerald-600 transition"
                          />
                          <span className="font-black text-slate-600 text-xs pr-1.5">% GST</span>
                        </div>
                        {draft.taxPercentage === 0 && (
                          <span className="block text-[10px] text-emerald-600 font-bold mt-1">
                            GST Exempt
                          </span>
                        )}
                      </td>

                      {/* 🔄 Tax Type (Inclusive / Exclusive) */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleInclusiveToggle(tax._id)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                            draft.isTaxInclusive
                              ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                              : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                          }`}
                          title="Click to toggle Inclusive vs Exclusive"
                        >
                          {draft.isTaxInclusive ? "Inclusive (In Price)" : "Exclusive (+ Added)"}
                        </button>
                      </td>

                      {/* 📝 Description */}
                      <td className="py-4 px-4 hidden md:table-cell max-w-xs truncate text-slate-500 text-xs">
                        {draft.description || "Official statutory rate"}
                      </td>

                      {/* 🕒 Last Updated */}
                      <td className="py-4 px-4 hidden lg:table-cell text-slate-400 text-[11px]">
                        {tax.updatedAt
                          ? new Date(tax.updatedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Statutory Default"}
                      </td>

                      {/* ⚙️ Actions */}
                      <td className="py-4 px-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          {isModified && (
                            <button
                              type="button"
                              onClick={() => handleSaveSingle(tax)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg cursor-pointer transition text-xs font-bold"
                              title="Save this category changes"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditModal(tax)}
                            className="p-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg bg-white text-slate-600 cursor-pointer transition text-xs"
                            title="Edit Category Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!tax._id.startsWith("default-") && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(tax._id, tax.category)}
                              className="p-1.5 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg bg-white cursor-pointer transition text-xs"
                              title="Delete custom category tax rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ➕ ADD CATEGORY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">Add Category Tax Slab</h3>
                  <span className="text-[11px] text-slate-400">Register new tax classification</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Terrariums, Bonsai, Fertilizers"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Applicable Model *</label>
                <select
                  value={newItemModel}
                  onChange={(e) => setNewItemModel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 bg-white"
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">GST Tax Rate (% GST) *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    required
                    value={newTaxRate}
                    onChange={(e) => setNewTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                  <div className="flex gap-1 shrink-0">
                    {[0, 5, 12, 18, 28].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setNewTaxRate(preset)}
                        className={`px-2 py-1 rounded-lg font-bold text-[10px] border cursor-pointer ${
                          newTaxRate === preset
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Calculation Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewIsInclusive(false)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                      !newIsInclusive
                        ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span className="block text-xs">Tax Exclusive</span>
                    <span className="text-[10px] text-slate-400">Added on top of price</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewIsInclusive(true)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                      newIsInclusive
                        ? "border-purple-600 bg-purple-50/50 text-purple-900 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span className="block text-xs">Tax Inclusive</span>
                    <span className="text-[10px] text-slate-400">Included in product price</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g., Statutory rate applicable for mini decorative plants"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  {isCreating ? "Registering..." : "Add Tax Slab"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✏️ EDIT MODAL */}
      {modalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{CATEGORY_EMOJIS[modalItem.category] || "📦"}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">
                    Edit {modalItem.category} Tax Slabs
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Model: {modalItem.itemModel}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Tax Percentage (% GST)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={modalPercentage}
                    onChange={(e) => setModalPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                  <div className="flex gap-1 shrink-0">
                    {[0, 5, 12, 18, 28].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setModalPercentage(preset)}
                        className={`px-2 py-1 rounded-lg font-bold text-[10px] border cursor-pointer ${
                          modalPercentage === preset
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Tax Calculation Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalInclusive(false)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      !modalInclusive
                        ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span className="block text-xs">Tax Exclusive</span>
                    <span className="text-[10px] text-slate-400">Tax added on top of base price</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalInclusive(true)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      modalInclusive
                        ? "border-purple-600 bg-purple-50/50 text-purple-900 font-bold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span className="block text-xs">Tax Inclusive</span>
                    <span className="text-[10px] text-slate-400">Product base price includes tax</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Description / Statutory Reference
                </label>
                <textarea
                  rows={3}
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  placeholder="e.g., GST Council notification rate for botanical live flora"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSave}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
              >
                Save Slabs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
