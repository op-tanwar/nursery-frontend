"use client";

import React, { useMemo, useEffect } from "react";
import ReviewForm from "@/components/customer/shop/ReviewForm";
import ProductSpecifications from "@/components/customer/shop/ProductSpecifications";
import { getProductReviewCount } from "@/components/customer/common/ShopItemCard";
import {
  getVisibleTabs,
  getProductHighlights,
  getExtraGalleryImages,
  getAttr,
  formatArrayOrString,
  TabId,
} from "@/utils/productSpecMapper";
import { getShopCategorySegment } from "@/utils/productUrl";
import {
  Sun,
  Droplets,
  Calendar,
  Clock,
  Ruler,
  Compass,
  Layers,
  Sparkles,
} from "lucide-react";

export type { TabId };

interface ReviewType {
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

interface ProductTabsSectionProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  itemId: string;
  itemType: string;
  descriptionOption?: {
    short?: string;
    points?: string[];
  };
  item: any;
  handleAddNewReview: (newReview: ReviewType) => void;
}

export default function ProductTabsSection({
  activeTab,
  setActiveTab,
  itemId,
  itemType,
  item,
  descriptionOption,
  handleAddNewReview,
}: ProductTabsSectionProps) {
  const rawCat = item?.category || itemType || "";
  const canonicalType = getShopCategorySegment(rawCat);
  const isSeeds = canonicalType === "seeds-bulbs";
  const isPlants = canonicalType === "plants";

  // Dynamic review count
  const reviewCount = getProductReviewCount(item);

  // 1. Compute dynamic data-driven tab list
  const visibleTabs = useMemo(() => {
    return getVisibleTabs(item, itemType, descriptionOption, reviewCount);
  }, [item, itemType, descriptionOption, reviewCount]);

  // 2. Safe Default: If currently active tab is not visible, switch to first visible tab
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [visibleTabs, activeTab, setActiveTab]);

  // Dynamic Headings & Labels
  const careHeading = isSeeds
    ? "Recommended Sowing & Sprouting Instructions"
    : isPlants
    ? "Botanical Care & Maintenance Routines"
    : "Recommended Usage & Care Guidelines";

  const benefitsHeading = isPlants
    ? "Atmospheric & Botanical Benefits Matrix"
    : canonicalType === "plant-care"
    ? "Active Biochemical Benefits & Potency"
    : "Verified Product Advantages & Capabilities";

  // Sowing & Care Quick Metrics (for seeds-bulbs and plants)
  const sowingSeason = formatArrayOrString(getAttr(item, "sowingSeason"));
  const germinationDays =
    getAttr(item, "germinationTime", "germinationDays")
      ? String(getAttr(item, "germinationTime", "germinationDays")).toLowerCase().includes("day")
        ? String(getAttr(item, "germinationTime", "germinationDays"))
        : `${getAttr(item, "germinationTime", "germinationDays")} Days`
      : null;
  const sowingDepth = getAttr(item, "sowingDepth");
  const spacing = getAttr(item, "spacing", "plantSpacing");
  const sunlight = getAttr(item, "sunlightRequirement", "lightRequirement", "sunlight");
  const watering = getAttr(item, "wateringSchedule", "wateringFrequency", "watering");
  const soilType = getAttr(item, "soilType", "soilRequirement");
  const maintenance = getAttr(item, "maintenanceLevel");

  const hasSowingMetrics = Boolean(
    sowingSeason || germinationDays || sowingDepth || spacing || sunlight || watering || soilType || maintenance
  );

  // Sowing / Care Step Instructions
  const guidelineSteps: string[] = useMemo(() => {
    if (!item) return [];
    const steps: string[] = [];
    const addList = (list: any) => {
      if (Array.isArray(list)) {
        list.forEach((s) => {
          if (typeof s === "string" && s.trim()) steps.push(s.trim());
        });
      } else if (typeof list === "string" && list.trim()) {
        steps.push(list.trim());
      }
    };
    addList(item.careInstructions);
    addList(item.attributes?.careInstructions);
    addList(item.plantingInstructions);
    addList(item.attributes?.plantingInstructions);
    addList(item.sowingSteps);
    addList(item.attributes?.sowingSteps);

    // If description has steps embedded
    if (steps.length === 0 && typeof item.description === "string") {
      const matchSteps = item.description.match(/(?:Sowing steps|Care instructions|How to use):\s*([\s\S]*?)(?:\n\n|$)/i);
      if (matchSteps && matchSteps[1]) {
        const parsed = matchSteps[1]
          .split(/\n+/)
          .map((line: string) => line.replace(/^\d+[\.\)]\s*/, "").trim())
          .filter(Boolean);
        steps.push(...parsed);
      }
    }

    return Array.from(new Set(steps));
  }, [item]);

  // Product Highlights List
  const productHighlights = useMemo(() => {
    return getProductHighlights(item, descriptionOption);
  }, [item, descriptionOption]);

  // Extra Gallery Images
  const extraGalleryImages = useMemo(() => {
    return getExtraGalleryImages(item);
  }, [item]);

  if (!item) return null;

  return (
    <div className="border border-line bg-panel/40 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)] mt-12">
      {/* ─── Dynamic Tab Navigation Bar ─── */}
      <div className="flex border-b border-line overflow-x-auto scrollbar-none bg-panel">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-xs font-bold tracking-wider uppercase border-none bg-transparent cursor-pointer transition-all relative whitespace-nowrap outline-none ${
              activeTab === tab.id ? "text-brand-primary" : "text-muted-text hover:text-foreground"
            }`}
          >
            {tab.label}

            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* ─── Tab Panels ─── */}
      <div className="p-6 sm:p-8 bg-panel/10 min-h-[220px]">
        {/* TAB 1: SPECIFICATION */}
        {activeTab === "description" && (
          <div className="animate-fadeIn space-y-6">
            <div>
              <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-3">
                Product Description & Architectural Overview
              </h3>
              <p className="text-xs text-muted-text leading-relaxed font-medium m-0 max-w-[850px] whitespace-pre-line">
                {item.description}
              </p>

              {descriptionOption?.points && descriptionOption.points.length > 0 && (
                <ul className="mt-3 space-y-1.5 m-0 pl-4">
                  {descriptionOption.points.map((point: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-600 font-medium leading-relaxed list-disc">
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Dynamic Product Specifications Component */}
            <div className="pt-2">
              <ProductSpecifications product={item} shopType={itemType} />
            </div>
          </div>
        )}

        {/* TAB 2: SOWING & CARE GUIDELINES */}
        {activeTab === "care" && (
          <div className="animate-fadeIn space-y-6">
            <div>
              <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-1">
                {careHeading}
              </h3>
              <p className="text-[11px] text-muted-text m-0 mb-4">
                {isSeeds
                  ? "Cultivation parameters, germination timeline, and planting depth guidelines."
                  : "Botanical sunlight, irrigation frequency, and holistic maintenance protocols."}
              </p>
            </div>

            {/* Quick Sowing / Care Diagnostics Cards */}
            {hasSowingMetrics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {sowingSeason && (
                  <div className="bg-panel border border-line/60 p-3 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-1.5 text-lime-600 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                        Sowing Season
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground block">{sowingSeason}</span>
                  </div>
                )}
                {germinationDays && (
                  <div className="bg-panel border border-line/60 p-3 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                        Germination
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground block">{germinationDays}</span>
                  </div>
                )}
                {sowingDepth && (
                  <div className="bg-panel border border-line/60 p-3 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                      <Ruler className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                        Sowing Depth
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground block">{String(sowingDepth)}</span>
                  </div>
                )}
                {spacing && (
                  <div className="bg-panel border border-line/60 p-3 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-1.5 text-indigo-500 mb-1">
                      <Compass className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                        Plant Spacing
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground block">{String(spacing)}</span>
                  </div>
                )}
                {sunlight && (
                  <div className="bg-panel border border-line/60 p-3 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                      <Sun className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                        Sunlight
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground block">{String(sunlight)}</span>
                  </div>
                )}
                {watering && (
                  <div className="bg-panel border border-line/60 p-3 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                      <Droplets className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                        Watering
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground block">{String(watering)}</span>
                  </div>
                )}
                {soilType && (
                  <div className="bg-panel border border-line/60 p-3 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-1.5 text-amber-700 mb-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                        Soil Mix
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground block">{String(soilType)}</span>
                  </div>
                )}
                {maintenance && (
                  <div className="bg-panel border border-line/60 p-3 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                        Maintenance
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground block">{String(maintenance)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step-by-Step Instructions */}
            {guidelineSteps.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  {isSeeds ? "Step-by-Step Sowing Procedure" : "Routine Care Guidelines"}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {guidelineSteps.map((step: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex gap-3 items-start bg-panel border border-line/50 p-3.5 rounded-xl shadow-2xs"
                    >
                      <span className="text-brand-primary font-bold text-xs bg-brand-light px-2 py-0.5 rounded-md shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <p className="text-xs text-muted-text font-medium m-0 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRODUCT HIGHLIGHTS */}
        {activeTab === "benefits" && (
          <div className="animate-fadeIn">
            <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-4">
              {benefitsHeading}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {productHighlights.map((highlight: string, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-line bg-panel flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5">🌟</span>
                  <span className="text-xs font-semibold text-foreground leading-relaxed">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ASSET GALLERY CANVAS */}
        {activeTab === "gallery" && (
          <div className="animate-fadeIn">
            <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider mb-4">
              Dynamic Asset Render Matrices
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {extraGalleryImages.map((imgUrl: string, idx: number) => (
                <div
                  key={idx}
                  className="aspect-square rounded-xl bg-brand-light/20 border border-line/80 flex items-center justify-center select-none hover:bg-brand-light/40 transition-colors shadow-2xs group cursor-zoom-in overflow-hidden relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`${item.name || "Product"} asset ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                    width={200}
                    height={200}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: VERIFIED REVIEWS */}
        {activeTab === "reviews" && (
          <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/60 pb-5 mb-6">
              <div>
                <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider m-0">
                  Inbound Customer Diagnostic Logs
                </h3>
                <p className="text-[11px] text-muted-text m-0 mt-1">
                  Real-time unedited user experiences compiled from verified purchasers.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-brand-light/30 border border-brand-primary/20 px-4 py-2 rounded-xl w-fit">
                <span className="text-lg font-black text-brand-primary">
                  {item.rating || 4.5} / 5.0
                </span>
                <span className="text-line text-sm">|</span>
                <span className="text-[11px] font-bold text-brand-dark">
                  {reviewCount} Global Signals
                </span>
              </div>
            </div>

            <ReviewForm
              itemId={itemId}
              itemType={itemType}
              onAddReview={handleAddNewReview}
            />

            <div className="flex flex-col gap-4 mt-6">
              {item.verifiedReviews && item.verifiedReviews.length > 0 ? (
                item.verifiedReviews.map((review: ReviewType, idx: number) => (
                  <div key={idx} className="bg-panel border border-line rounded-xl p-4 shadow-2xs flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-light font-bold text-brand-primary text-[11px] flex items-center justify-center border border-brand-primary/10 select-none">
                          {review.author[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground block">
                            {review.author}
                          </span>
                          <span className="text-[10px] text-muted-text block">
                            {review.date}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-full">
                        ✓ Verified Node Buyer
                      </span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, sIdx) => (
                        <span
                          key={sIdx}
                          className={`text-xs ${sIdx < review.rating ? "text-[#f59e0b]" : "text-line/40"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-text leading-relaxed font-medium m-0 pl-1">
                      "{review.comment}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center rounded-xl border border-line/40 bg-panel/30">
                  <p className="text-xs text-muted-text font-medium m-0">
                    No customer reviews yet. Be the first to share your experience with this item!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
