"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Truck, Sparkles, MapPin } from "lucide-react";

export interface ShopHeroHeaderProps {
  activeType: string;
  activeSubCategory: string;
  totalCount: number;
  visibleCount: number;
  userPincode: string | null;
  onClearPincode: () => void;
}

const CATEGORY_TITLES: Record<string, { title: string; subtitle: string; icon: string }> = {
  All: {
    title: "All Plants & Garden Essentials",
    subtitle:
      "Explore 1,200+ botanist-verified live plants, handcrafted planters, organic nutrition & gardening tools.",
    icon: "🌱",
  },
  Plants: {
    title: "Certified Live Plants & Trees",
    subtitle:
      "Nursery-grown indoor, air-purifying, and outdoor plants conditioned for vibrant growth in Indian homes.",
    icon: "🌿",
  },
  Pots: {
    title: "Handcrafted Pots & Planters",
    subtitle:
      "Breathable terracotta, glazed ceramics, and lightweight fiber planters with precision drainage.",
    icon: "🏺",
  },
  Accessories: {
    title: "Botanical Accessories & Decor",
    subtitle:
      "Stackable moss poles, watering cans, moisture meters, and curated plant parent essentials.",
    icon: "🪴",
  },
  "Gardening Tools": {
    title: "Gardening Tools & Equipment",
    subtitle:
      "Ergonomic pruning shears, stainless steel trowels, and heavy-duty gear built to last.",
    icon: "🛠️",
  },
  "Plant Care": {
    title: "Organic Plant Care & Nutrition",
    subtitle:
      "Bio-enzymatic fertilizers, cold-pressed neem oils, and microbe-rich potting mixes.",
    icon: "🧪",
  },
  "Seeds & Bulbs": {
    title: "High-Yield Seeds & Flower Bulbs",
    subtitle:
      "Certified 85%+ germination vegetable, herb, and flower seeds for kitchen balconies and beds.",
    icon: "🌾",
  },
  "Plant Stands": {
    title: "Plant Stands & Multi-Tier Shelves",
    subtitle:
      "Rustproof powder-coated metal and bamboo displays engineered for heavy pots and optimal sunlight.",
    icon: "🪜",
  },
  "Artificial & Dried Plants": {
    title: "Artificial & Dried Botanical Decor",
    subtitle:
      "Botanically accurate UV-resistant faux trees and preserved moss for zero-maintenance greenery.",
    icon: "🌵",
  },
};

export default function ShopHeroHeader({
  activeType,
  activeSubCategory,
  totalCount,
  visibleCount,
  userPincode,
  onClearPincode,
}: ShopHeroHeaderProps) {
  const currentCategory = CATEGORY_TITLES[activeType] || CATEGORY_TITLES.All;
  const isSubCategoryActive = activeSubCategory && activeSubCategory !== "All";

  const displayTitle = isSubCategoryActive
    ? `${activeSubCategory}`
    : currentCategory.title;

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-900 via-[#0e3b22] to-emerald-950 text-white p-5 sm:p-8 lg:p-10 shadow-lg border border-emerald-800/40 mb-6">
      {/* Subtle botanical decorative ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/3 -bottom-24 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl"
      />

      <div className="relative z-10 flex flex-col gap-4 sm:gap-6">
        {/* Top Meta Row: Breadcrumbs & Hyperlocal Delivery Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-emerald-200/80 flex-wrap">
            <Link
              href="/"
              className="hover:text-white transition-colors duration-150 font-medium inline-flex items-center gap-1"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" />
            <Link
              href="/shop"
              className={`hover:text-white transition-colors duration-150 font-medium ${
                activeType === "All" && !isSubCategoryActive ? "text-emerald-100 font-bold" : ""
              }`}
            >
              Shop
            </Link>
            {activeType !== "All" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" />
                <span className={!isSubCategoryActive ? "text-emerald-100 font-bold" : "text-emerald-200/80"}>
                  {activeType}
                </span>
              </>
            )}
            {isSubCategoryActive && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" />
                <span className="text-emerald-100 font-bold">{activeSubCategory}</span>
              </>
            )}
          </nav>

          {/* Hyperlocal Pincode Tag */}
          {userPincode && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs text-emerald-200 shadow-xs">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Delivering to <strong className="text-white font-semibold">{userPincode}</strong>
              </span>
              <span className="text-emerald-400/40">|</span>
              <button
                type="button"
                onClick={onClearPincode}
                className="text-emerald-300 hover:text-white underline text-[11px] font-semibold cursor-pointer transition-colors"
                title="Change or clear delivery pincode"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Main Title & Dynamic Count Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="text-xl sm:text-2xl" role="img" aria-hidden="true">
                {currentCategory.icon}
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                Certified D2C Nursery Collection
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {displayTitle}
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal">
              {currentCategory.subtitle}
            </p>
          </div>

          {/* Product Count Badge */}
          <div className="shrink-0 self-start md:self-end">
            <div className="inline-flex items-center gap-2 bg-emerald-800/60 backdrop-blur-md border border-emerald-600/40 px-3.5 py-1.5 rounded-xl text-xs text-emerald-100 font-medium shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                Showing <strong className="text-white font-bold">{visibleCount}</strong> of{" "}
                <strong className="text-white font-bold">{totalCount}</strong> items
              </span>
            </div>
          </div>
        </div>

        {/* Botanical Guarantee Trust Highlights */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[11px] sm:text-xs text-emerald-200/90 font-medium">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            24-Hour Botanical Health Guarantee
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
            Safe Transit Packaging Across India
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            Direct from Certified Grower Nurseries
          </span>
        </div>
      </div>
    </section>
  );
}
