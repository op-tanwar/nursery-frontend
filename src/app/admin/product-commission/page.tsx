"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAppSelector } from "@/redux/hooks";
import {
  commissionService,
  ICategoryCommission,
  BulkCommissionUpdateItem,
} from "@/services/commissionService";
import toast from "react-hot-toast";
import {
  BadgePercent,
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
  TrendingUp,
  TrendingDown,
  Layers,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────
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

const AVAILABLE_ITEM_MODELS = [
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

// Default commission fallbacks if DB is empty
const DEFAULT_FALLBACK_COMMISSIONS: ICategoryCommission[] = [
  {
    _id: "default-plants",
    category: "Plants",
    itemModel: "Plant",
    commissionPercentage: 10,
    description: "Live plants, saplings, and indoor/outdoor botanical greenery — 10% platform commission.",
  },
  {
    _id: "default-pots",
    category: "Pots",
    itemModel: "Pot",
    commissionPercentage: 12,
    description: "Ceramic, terracotta, fiber, and plastic planters — 12% platform commission.",
  },
  {
    _id: "default-accessories",
    category: "Accessories",
    itemModel: "Accessory",
    commissionPercentage: 15,
    description: "Watering cans, decorative pebbles, drip trays, and garden decor — 15% platform commission.",
  },
  {
    _id: "default-tools",
    category: "Gardening Tools",
    itemModel: "GardeningTool",
    commissionPercentage: 15,
    description: "Pruners, shears, trowels, shovels, and metal gardening equipment — 15% platform commission.",
  },
  {
    _id: "default-care",
    category: "Plant Care",
    itemModel: "PlantCare",
    commissionPercentage: 12,
    description: "Bio-fertilizers, neem oil sprays, potting soil mixes, and organic nutrients — 12% platform commission.",
  },
  {
    _id: "default-seeds",
    category: "Seeds & Bulbs",
    itemModel: "SeedsBulbs",
    commissionPercentage: 5,
    description: "Agricultural seeds, flower bulbs, and kitchen garden planting seed packs — 5% platform commission.",
  },
  {
    _id: "default-stands",
    category: "Plant Stands",
    itemModel: "PlantStandsShelves",
    commissionPercentage: 15,
    description: "Iron/metal stands, wooden multi-tier shelves, and corner planters — 15% platform commission.",
  },
  {
    _id: "default-artificial",
    category: "Artificial & Dried Plants",
    itemModel: "ArtificialDriedPlant",
    commissionPercentage: 15,
    description: "Synthetic flora, preserved stems, dried moss, and botanical home accents — 15% platform commission.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminProductCommissionPage() {
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const [commissions, setCommissions] = useState<ICategoryCommission[]>([]);
  const [drafts, setDrafts] = useState<
    Record<string, { commissionPercentage: number; description?: string }>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit modal state
  const [modalItem, setModalItem] = useState<ICategoryCommission | null>(null);
  const [modalPercentage, setModalPercentage] = useState(0);
  const [modalDescription, setModalDescription] = useState("");

  // Add category modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newItemModel, setNewItemModel] = useState("Plant");
  const [newRate, setNewRate] = useState(10);
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // ─── Data Fetching ──────────────────────────────────────────────────────
  const fetchCommissions = async () => {
    setIsLoading(true);
    try {
      const response = await commissionService.getAllCommissions();
      let list: ICategoryCommission[] =
        response?.commissions || response?.data || [];

      if (!list || list.length === 0) {
        console.warn("[AdminCommission] No commissions from server. Loading defaults.");
        list = DEFAULT_FALLBACK_COMMISSIONS;
      }

      setCommissions(list);

      const initialDraft: Record<
        string,
        { commissionPercentage: number; description?: string }
      > = {};
      list.forEach((c) => {
        initialDraft[c._id] = {
          commissionPercentage: c.commissionPercentage,
          description: c.description,
        };
      });
      setDrafts(initialDraft);
    } catch (err: any) {
      console.error("Failed to load commissions:", err);
      setCommissions(DEFAULT_FALLBACK_COMMISSIONS);
      const initialDraft: Record<
        string,
        { commissionPercentage: number; description?: string }
      > = {};
      DEFAULT_FALLBACK_COMMISSIONS.forEach((c) => {
        initialDraft[c._id] = {
          commissionPercentage: c.commissionPercentage,
          description: c.description,
        };
      });
      setDrafts(initialDraft);
      toast.error(
        err?.response?.data?.message ||
          "Could not reach commission service. Loaded system defaults."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  // ─── Draft Handlers ─────────────────────────────────────────────────────
  const handlePercentageChange = (id: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], commissionPercentage: clamped },
    }));
  };

  const hasUnsavedChanges = useMemo(() => {
    return commissions.some((c) => {
      const draft = drafts[c._id];
      if (!draft) return false;
      return (
        draft.commissionPercentage !== c.commissionPercentage ||
        draft.description !== c.description
      );
    });
  }, [commissions, drafts]);

  // ─── Single Save ────────────────────────────────────────────────────────
  const handleSaveSingle = async (item: ICategoryCommission) => {
    const draft = drafts[item._id];
    if (!draft) return;
    const toastId = toast.loading(`Saving ${item.category} commission...`);
    try {
      if (item._id.startsWith("default-")) {
        await commissionService.bulkUpdateCommissions([
          {
            category: item.category,
            itemModel: item.itemModel,
            commissionPercentage: draft.commissionPercentage,
            description: draft.description,
          },
        ]);
      } else {
        await commissionService.updateCategoryCommission(item._id, {
          commissionPercentage: draft.commissionPercentage,
          description: draft.description,
        });
      }
      toast.success(`${item.category} commission rate updated!`, { id: toastId });
      fetchCommissions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update commission.", {
        id: toastId,
      });
    }
  };

  // ─── Batch Save All ─────────────────────────────────────────────────────
  const handleSaveAll = async () => {
    if (!hasUnsavedChanges) {
      toast("No changes to save.", { icon: "ℹ️" });
      return;
    }
    setIsSaving(true);
    const toastId = toast.loading("Saving all commission rates...");
    try {
      const updates: BulkCommissionUpdateItem[] = commissions.map((c) => ({
        id: c._id.startsWith("default-") ? undefined : c._id,
        category: c.category,
        itemModel: c.itemModel,
        commissionPercentage: drafts[c._id]?.commissionPercentage ?? c.commissionPercentage,
        description: drafts[c._id]?.description ?? c.description,
      }));
      await commissionService.bulkUpdateCommissions(updates);
      toast.success("All category commission rates synchronized!", { id: toastId });
      fetchCommissions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to apply bulk updates.", {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Reset Defaults ─────────────────────────────────────────────────────
  const handleResetDefaults = async () => {
    if (
      !window.confirm(
        "Restore default commission rates?\n\n• Plants: 10%\n• Pots: 12%\n• Plant Care: 12%\n• Seeds & Bulbs: 5%\n• Accessories / Tools / Stands / Artificial: 15%\n\nThis will overwrite all custom rates."
      )
    ) {
      return;
    }
    setIsResetting(true);
    const toastId = toast.loading("Restoring default commission rates...");
    try {
      await commissionService.resetDefaultCommissions();
      toast.success("Commission rates restored to defaults!", { id: toastId });
      fetchCommissions();
    } catch (err: any) {
      // Fallback: seed via bulk if reset endpoint fails
      try {
        await commissionService.bulkUpdateCommissions(
          DEFAULT_FALLBACK_COMMISSIONS.map((c) => ({
            category: c.category,
            itemModel: c.itemModel,
            commissionPercentage: c.commissionPercentage,
            description: c.description,
          }))
        );
        toast.success("Commission rates restored to defaults!", { id: toastId });
        fetchCommissions();
      } catch {
        toast.error(
          err?.response?.data?.message || "Failed to reset commission rates.",
          { id: toastId }
        );
      }
    } finally {
      setIsResetting(false);
    }
  };

  // ─── Delete Category ────────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(`Remove commission configuration for "${name}"? This cannot be undone.`)
    )
      return;
    const toastId = toast.loading(`Removing ${name}...`);
    try {
      await commissionService.deleteCategoryCommission(id);
      toast.success(`Removed commission for ${name}.`, { id: toastId });
      fetchCommissions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete commission.", {
        id: toastId,
      });
    }
  };

  // ─── Add Category ───────────────────────────────────────────────────────
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    setIsCreating(true);
    const toastId = toast.loading(`Registering ${newCategoryName.trim()}...`);
    try {
      await commissionService.createCategoryCommission({
        category: newCategoryName.trim(),
        itemModel: newItemModel,
        commissionPercentage: newRate,
        description: newDescription.trim() || undefined,
      });
      toast.success(`"${newCategoryName.trim()}" commission registered!`, { id: toastId });
      setIsAddModalOpen(false);
      setNewCategoryName("");
      setNewDescription("");
      setNewRate(10);
      fetchCommissions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to register category.", {
        id: toastId,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // ─── Edit Modal ─────────────────────────────────────────────────────────
  const openEditModal = (item: ICategoryCommission) => {
    const draft = drafts[item._id] || item;
    setModalItem(item);
    setModalPercentage(draft.commissionPercentage);
    setModalDescription(draft.description || "");
  };

  const closeEditModal = () => setModalItem(null);

  const handleModalSave = async () => {
    if (!modalItem) return;
    const toastId = toast.loading(`Updating ${modalItem.category}...`);
    try {
      if (modalItem._id.startsWith("default-")) {
        await commissionService.bulkUpdateCommissions([
          {
            category: modalItem.category,
            itemModel: modalItem.itemModel,
            commissionPercentage: modalPercentage,
            description: modalDescription,
          },
        ]);
      } else {
        await commissionService.updateCategoryCommission(modalItem._id, {
          commissionPercentage: modalPercentage,
          description: modalDescription,
        });
      }
      toast.success(`Commission for ${modalItem.category} updated!`, { id: toastId });
      closeEditModal();
      fetchCommissions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save.", { id: toastId });
    }
  };

  // ─── Filtered list ──────────────────────────────────────────────────────
  const filteredCommissions = useMemo(() => {
    if (!searchQuery.trim()) return commissions;
    const q = searchQuery.toLowerCase();
    return commissions.filter(
      (c) =>
        c.category.toLowerCase().includes(q) ||
        c.itemModel.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [commissions, searchQuery]);

  // ─── KPI Stats ──────────────────────────────────────────────────────────
  const avgRate = useMemo(() => {
    if (!commissions.length) return 0;
    const sum = commissions.reduce(
      (acc, c) => acc + (drafts[c._id]?.commissionPercentage ?? c.commissionPercentage),
      0
    );
    return Math.round((sum / commissions.length) * 10) / 10;
  }, [commissions, drafts]);

  const highestRate = useMemo(() => {
    if (!commissions.length) return 0;
    return Math.max(
      ...commissions.map((c) => drafts[c._id]?.commissionPercentage ?? c.commissionPercentage)
    );
  }, [commissions, drafts]);

  const lowestRate = useMemo(() => {
    if (!commissions.length) return 0;
    return Math.min(
      ...commissions.map((c) => drafts[c._id]?.commissionPercentage ?? c.commissionPercentage)
    );
  }, [commissions, drafts]);

  // ─── Auth Guard ─────────────────────────────────────────────────────────
  if (!authLoading && user && user.role !== "admin") {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Restricted Administrative Area</h2>
        <p className="text-sm text-slate-500">
          Only authorized administrators can modify platform commission rates.
        </p>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold">
            <BadgePercent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                Product Commission Settings
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full">
                Live Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Global category-wise platform commission rates. Nurseries can override per-category via their profile.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCommissions}
            disabled={isLoading}
            className="p-2.5 border border-slate-200 hover:border-slate-300 rounded-xl bg-white text-slate-600 hover:bg-slate-50 cursor-pointer transition text-xs font-semibold flex items-center gap-1.5"
            title="Refresh from database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2.5 border border-violet-600 bg-violet-50 text-violet-800 hover:bg-violet-100 rounded-xl cursor-pointer transition text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-violet-700" />
            <span>Add Category</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isResetting || isLoading}
            className="px-3.5 py-2.5 border border-amber-200 text-amber-800 hover:bg-amber-50 rounded-xl bg-amber-50/40 cursor-pointer transition text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={!hasUnsavedChanges || isSaving || isLoading}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl cursor-pointer transition text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0">
              Configured Categories
            </p>
            <p className="text-2xl font-black text-slate-900 m-0">{commissions.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <BadgePercent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0">
              Platform Average
            </p>
            <p className="text-2xl font-black text-violet-600 m-0">{avgRate}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0">
              Lowest Slab
            </p>
            <p className="text-2xl font-black text-emerald-600 m-0">{lowestRate}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider m-0">
              Highest Slab
            </p>
            <p className="text-2xl font-black text-rose-600 m-0">{highestRate}%</p>
          </div>
        </div>
      </div>

      {/* ── UNSAVED CHANGES BANNER ── */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You have unsaved commission changes that have not been applied to the database.</span>
          </div>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-3 py-1 bg-amber-700 text-white rounded-lg text-xs font-bold hover:bg-amber-800 transition cursor-pointer"
          >
            Apply Now
          </button>
        </div>
      )}

      {/* ── INFO CARD: Hierarchy Rule ── */}
      <div className="bg-violet-50/60 border border-violet-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-violet-900">
        <Layers className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold m-0 mb-0.5">Commission Hierarchy (Server Single Source of Truth)</p>
          <p className="text-violet-700 m-0">
            <strong>Level 1:</strong> Nursery-specific override →{" "}
            <strong>Level 2:</strong> Global category rate (this page) →{" "}
            <strong>Level 3:</strong> System default (10%). Each order snapshots the rate at purchase time.
          </p>
        </div>
      </div>

      {/* ── COMMISSION TABLE ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Search / Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search category or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-violet-500 focus:bg-white transition"
            />
            <Info className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Showing <b className="text-slate-700">{filteredCommissions.length}</b> of {commissions.length} categories
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 sm:px-6">Category & Model</th>
                <th className="py-3.5 px-4 text-center">Commission Rate</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Description / Notes</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Last Updated</th>
                <th className="py-3.5 px-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-600" />
                    <span>Loading commission configurations...</span>
                  </td>
                </tr>
              ) : filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No categories found matching your query.
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((item) => {
                  const draft = drafts[item._id] || {
                    commissionPercentage: item.commissionPercentage,
                    description: item.description,
                  };
                  const isModified =
                    draft.commissionPercentage !== item.commissionPercentage ||
                    draft.description !== item.description;
                  const emoji = CATEGORY_EMOJIS[item.category] || "🪴";

                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50/60 transition ${
                        isModified ? "bg-amber-50/30" : ""
                      }`}
                    >
                      {/* Category & Model */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <span className="text-xl select-none">{emoji}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-sm">
                                {item.category}
                              </span>
                              {isModified && (
                                <span
                                  className="inline-block w-2 h-2 rounded-full bg-amber-500"
                                  title="Unsaved changes"
                                />
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              Model: {item.itemModel}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rate Input */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={draft.commissionPercentage}
                            onChange={(e) =>
                              handlePercentageChange(item._id, parseFloat(e.target.value))
                            }
                            className="w-14 text-center font-black text-slate-900 bg-white border border-slate-200 rounded-lg py-1 text-sm focus:outline-none focus:border-violet-600 transition"
                          />
                          <span className="font-black text-slate-600 text-xs pr-1.5">%</span>
                        </div>
                        {draft.commissionPercentage === 0 && (
                          <span className="block text-[10px] text-emerald-600 font-bold mt-1">
                            Zero Commission
                          </span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="py-4 px-4 hidden md:table-cell max-w-xs truncate text-slate-500 text-xs">
                        {draft.description || "Platform commission rate"}
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-4 hidden lg:table-cell text-slate-400 text-[11px]">
                        {item.updatedAt
                          ? new Date(item.updatedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "System Default"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          {isModified && (
                            <button
                              type="button"
                              onClick={() => handleSaveSingle(item)}
                              className="p-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 rounded-lg cursor-pointer transition text-xs font-bold"
                              title="Save this row"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg bg-white text-slate-600 cursor-pointer transition"
                            title="Edit Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!item._id.startsWith("default-") && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item._id, item.category)}
                              className="p-1.5 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg bg-white cursor-pointer transition"
                              title="Delete"
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

      {/* ── ADD CATEGORY MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">Add Commission Category</h3>
                  <span className="text-[11px] text-slate-400">Register new commission classification</span>
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
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Organic Fertilizers"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Item Model</label>
                <select
                  value={newItemModel}
                  onChange={(e) => setNewItemModel(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-violet-500 transition"
                >
                  {AVAILABLE_ITEM_MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Commission Rate (%) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.5"
                  value={newRate}
                  onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description of this commission category..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none focus:outline-none focus:border-violet-500 transition"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-xl font-bold cursor-pointer transition flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  {isCreating ? "Registering..." : "Register Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT DETAIL MODAL ── */}
      {modalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {CATEGORY_EMOJIS[modalItem.category] || "🪴"}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">
                    {modalItem.category}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Model: {modalItem.itemModel}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={modalPercentage}
                  onChange={(e) =>
                    setModalPercentage(
                      Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))
                    )
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition font-black text-slate-900 text-base"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={3}
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  placeholder="Describe this commission category..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none focus:outline-none focus:border-violet-500 transition"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleModalSave}
                  className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
