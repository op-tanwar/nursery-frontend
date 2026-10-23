"use client";

import { useState, useMemo } from "react";
import ShopItemCard, { ShopItemType } from "@/components/customer/common/ShopItemCard";

interface VendorCatalogClientProps {
  vendorName?: string;
  vendorSlug?: string;
  products?: ShopItemType[];
}

type CatalogTab = "all" | "plants" | "pots" | "care" | "tools";
type SortOption = "popular" | "price-low" | "price-high" | "rating";

const TABS = [
  { id: "all" as CatalogTab, label: "All Items" },
  { id: "plants" as CatalogTab, label: "🌱 Plants" },
  { id: "pots" as CatalogTab, label: "🪴 Pots & Planters" },
  { id: "care" as CatalogTab, label: "🧴 Care & Fertilizers" },
  { id: "tools" as CatalogTab, label: "🛠️ Tools & Accessories" },
];

export default function VendorCatalogClient({
  products = [],
}: VendorCatalogClientProps) {
  const [activeTab, setActiveTab] = useState<CatalogTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  const safeProducts = Array.isArray(products) ? products : [];

  const filteredProducts = useMemo(() => {
    return safeProducts
      .filter((item: ShopItemType) => {
        if (!item) return false;
        let matchesTab = activeTab === "all";
        if (activeTab === "plants") matchesTab = item.type === "plants";
        else if (activeTab === "pots") matchesTab = item.type === "pots";
        else if (activeTab === "care") matchesTab = item.type === "plant-care" || item.type === "seeds-bulbs";
        else if (activeTab === "tools")
          matchesTab =
            item.type === "accessories" ||
            item.type === "gardening-tools" ||
            item.type === "plant-stands-shelves" ||
            item.type === "artificial-dried-plants";

        const itemName = item.name || "";
        const itemCat = item.category || "";
        const query = (searchQuery || "").toLowerCase();

        const matchesSearch =
          itemName.toLowerCase().includes(query) ||
          itemCat.toLowerCase().includes(query);

        return matchesTab && matchesSearch;
      })
      .sort((a: ShopItemType, b: ShopItemType) => {
        const aPrice = Number(a?.price ?? 0);
        const bPrice = Number(b?.price ?? 0);
        const aRating = Number(a?.rating ?? 0);
        const bRating = Number(b?.rating ?? 0);
        const aReviews = Number(a?.reviews ?? 0);
        const bReviews = Number(b?.reviews ?? 0);

        if (sortBy === "price-low") return aPrice - bPrice;
        if (sortBy === "price-high") return bPrice - aPrice;
        if (sortBy === "rating") return bRating - aRating;
        return bReviews - aReviews;
      });
  }, [safeProducts, activeTab, searchQuery, sortBy]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

      {/* Toolbar & Category Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="Search store..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product: ShopItemType, idx: number) => (
            <ShopItemCard key={product.id || product._id || idx} item={product} index={idx} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-12 text-center my-8">
          <span className="text-3xl sm:text-4xl block mb-3">🔍</span>
          <h3 className="text-base font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or switching category tabs.
          </p>
        </div>
      )}

    </section>
  );
}
