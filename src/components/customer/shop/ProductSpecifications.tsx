"use client";

import React from "react";
import {
  Sun,
  Droplets,
  HeartHandshake,
  PawPrint,
  ShieldAlert,
  Layers,
  Ruler,
  Palette,
  CheckCircle2,
  XCircle,
  Compass,
  Home,
  Wrench,
  ShieldCheck,
  Scale,
  Box,
  FlaskConical,
  Leaf,
  Calendar,
  Clock,
  Sprout,
  Grid3X3,
  Sparkles,
  PackageCheck,
  Award,
  Info,
  Building2,
} from "lucide-react";
import type { ShopUrlType } from "@/services/server/productServerService";

export interface SpecItem {
  id: string;
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  badge?: {
    text: string;
    variant: "emerald" | "amber" | "blue" | "slate" | "rose";
  };
}

interface ProductSpecificationsProps {
  product: any;
  shopType: ShopUrlType | string;
}

export default function ProductSpecifications({
  product,
  shopType,
}: ProductSpecificationsProps) {
  if (!product) return null;

  const normalizedType = String(shopType || "").toLowerCase() as ShopUrlType;
  const specs: SpecItem[] = [];

  // Helper to format dimensions
  const formatDimensions = (dim: any): string | null => {
    if (!dim) return null;
    if (typeof dim === "string" && dim.trim()) return dim.trim();
    if (typeof dim === "object") {
      const parts = [
        dim.length ? `${dim.length} (L)` : null,
        dim.width ? `${dim.width} (W)` : null,
        dim.height ? `${dim.height} (H)` : null,
        dim.diameter ? `${dim.diameter} (Dia)` : null,
      ].filter(Boolean);
      return parts.length ? parts.join(" × ") : null;
    }
    return null;
  };

  // ─── 1. LIVE PLANTS ────────────────────────────────────────────────────────
  if (normalizedType === "plants") {
    if (product.lightRequirement) {
      specs.push({
        id: "light",
        label: "Sunlight Needed",
        value: product.lightRequirement,
        icon: <Sun className="w-4 h-4 text-amber-500" />,
        badge: {
          text: product.lightRequirement,
          variant: "amber",
        },
      });
    }

    if (product.wateringSchedule) {
      specs.push({
        id: "watering",
        label: "Watering Schedule",
        value: product.wateringSchedule,
        icon: <Droplets className="w-4 h-4 text-blue-500" />,
        badge: {
          text: product.wateringSchedule,
          variant: "blue",
        },
      });
    }

    if (product.maintenanceLevel) {
      specs.push({
        id: "maintenance",
        label: "Maintenance Level",
        value: `${product.maintenanceLevel} Maintenance`,
        icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
        badge: {
          text: product.maintenanceLevel,
          variant:
            product.maintenanceLevel.toLowerCase() === "easy"
              ? "emerald"
              : product.maintenanceLevel.toLowerCase() === "moderate"
              ? "blue"
              : "amber",
        },
      });
    }

    if (typeof product.isPetFriendly === "boolean") {
      specs.push({
        id: "pet-friendly",
        label: "Pet Friendliness",
        value: product.isPetFriendly
          ? "Pet Safe (Non-toxic to cats & dogs)"
          : "Toxic to Pets (Keep away from pets)",
        icon: product.isPetFriendly ? (
          <PawPrint className="w-4 h-4 text-emerald-600" />
        ) : (
          <ShieldAlert className="w-4 h-4 text-rose-500" />
        ),
        badge: {
          text: product.isPetFriendly ? "🐾 Pet Friendly" : "⚠️ Toxic to Pets",
          variant: product.isPetFriendly ? "emerald" : "rose",
        },
      });
    }

    if (product.category) {
      specs.push({
        id: "plant-category",
        label: "Botanical Category",
        value: product.category,
        icon: <Home className="w-4 h-4 text-slate-500" />,
      });
    }
  }

  // ─── 2. POTS & PLANTERS ───────────────────────────────────────────────────
  if (normalizedType === "pots") {
    if (product.material) {
      specs.push({
        id: "material",
        label: "Pot Material",
        value: product.material,
        icon: <Layers className="w-4 h-4 text-amber-600" />,
        badge: {
          text: product.material,
          variant: "amber",
        },
      });
    }

    if (product.color) {
      const colorVal = Array.isArray(product.color)
        ? product.color.filter(Boolean).join(", ")
        : String(product.color);
      if (colorVal) {
        specs.push({
          id: "color",
          label: "Primary Color / Finish",
          value: colorVal,
          icon: <Palette className="w-4 h-4 text-purple-500" />,
        });
      }
    }

    if (product.dimensions?.height) {
      specs.push({
        id: "pot-height",
        label: "Pot Height",
        value: product.dimensions.height,
        icon: <Ruler className="w-4 h-4 text-slate-500" />,
      });
    }

    if (product.dimensions?.diameter) {
      specs.push({
        id: "pot-diameter",
        label: "Pot Diameter",
        value: product.dimensions.diameter,
        icon: <Compass className="w-4 h-4 text-slate-500" />,
      });
    }

    if (typeof product.hasDrainageHole === "boolean") {
      specs.push({
        id: "drainage",
        label: "Drainage Hole",
        value: product.hasDrainageHole
          ? "Yes, Pre-drilled drainage hole included"
          : "No drainage hole (Indoor cachepot / sealed)",
        icon: product.hasDrainageHole ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        ) : (
          <XCircle className="w-4 h-4 text-slate-400" />
        ),
        badge: {
          text: product.hasDrainageHole ? "✓ Drainage Hole" : "No Hole",
          variant: product.hasDrainageHole ? "emerald" : "slate",
        },
      });
    }

    if (product.shape) {
      specs.push({
        id: "shape",
        label: "Pot Shape",
        value: product.shape,
        icon: <Grid3X3 className="w-4 h-4 text-slate-500" />,
      });
    }

    if (product.isIndoorOutdoor) {
      specs.push({
        id: "environment",
        label: "Usage Environment",
        value:
          product.isIndoorOutdoor === "Both"
            ? "Indoor & Outdoor Safe"
            : product.isIndoorOutdoor,
        icon: <Home className="w-4 h-4 text-emerald-600" />,
      });
    }

    if (typeof product.includesSaucer === "boolean") {
      specs.push({
        id: "saucer",
        label: "Matching Saucer / Plate",
        value: product.includesSaucer
          ? "Yes, Matching plate/saucer included"
          : "Not included",
        icon: product.includesSaucer ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        ) : (
          <Info className="w-4 h-4 text-slate-400" />
        ),
        badge: {
          text: product.includesSaucer ? "✓ Saucer Included" : "Saucer Excluded",
          variant: product.includesSaucer ? "emerald" : "slate",
        },
      });
    }
  }

  // ─── 3. ACCESSORIES ───────────────────────────────────────────────────────
  if (normalizedType === "accessories") {
    const specsObj = product.specifications || {};

    if (specsObj.brand || product.brand) {
      specs.push({
        id: "brand",
        label: "Brand Designation",
        value: specsObj.brand || product.brand || "Generic",
        icon: <Award className="w-4 h-4 text-blue-600" />,
      });
    }

    if (specsObj.material || product.material) {
      specs.push({
        id: "material",
        label: "Material Composition",
        value: specsObj.material || product.material,
        icon: <Layers className="w-4 h-4 text-amber-600" />,
      });
    }

    if (specsObj.weight || product.weight) {
      specs.push({
        id: "weight",
        label: "Net Weight",
        value: specsObj.weight || product.weight,
        icon: <Scale className="w-4 h-4 text-slate-500" />,
      });
    }

    if (specsObj.capacity || product.capacity) {
      specs.push({
        id: "capacity",
        label: "Volumetric Capacity",
        value: specsObj.capacity || product.capacity,
        icon: <Box className="w-4 h-4 text-blue-500" />,
      });
    }

    const formattedDim = formatDimensions(specsObj.dimensions || product.dimensions);
    if (formattedDim) {
      specs.push({
        id: "dimensions",
        label: "Dimensions / Sizing",
        value: formattedDim,
        icon: <Ruler className="w-4 h-4 text-slate-500" />,
      });
    }
  }

  // ─── 4. GARDENING TOOLS ───────────────────────────────────────────────────
  if (normalizedType === "gardening-tools") {
    if (product.material) {
      specs.push({
        id: "material",
        label: "Blade / Tool Material",
        value: product.material,
        icon: <Layers className="w-4 h-4 text-emerald-600" />,
        badge: {
          text: product.material,
          variant: "emerald",
        },
      });
    }

    if (product.handleMaterial) {
      specs.push({
        id: "handle-material",
        label: "Handle & Grip Material",
        value: product.handleMaterial,
        icon: <Wrench className="w-4 h-4 text-amber-600" />,
      });
    }

    if (product.warrantyMonths && Number(product.warrantyMonths) > 0) {
      specs.push({
        id: "warranty",
        label: "Warranty Coverage",
        value: `${product.warrantyMonths} Months Manufacturer Warranty`,
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
        badge: {
          text: `${product.warrantyMonths} Mo. Warranty`,
          variant: "emerald",
        },
      });
    }

    if (Array.isArray(product.features) && product.features.length > 0) {
      specs.push({
        id: "features-count",
        label: "Engineered Highlights",
        value: `${product.features.length} Precision features built-in`,
        icon: <Sparkles className="w-4 h-4 text-blue-500" />,
      });
    }
  }

  // ─── 5. PLANT CARE & FERTILIZERS ───────────────────────────────────────────
  if (normalizedType === "plant-care") {
    if (product.composition) {
      specs.push({
        id: "composition",
        label: "Active Ingredients / Composition",
        value: product.composition,
        icon: <FlaskConical className="w-4 h-4 text-teal-600" />,
      });
    }

    if (product.volumeOrWeight) {
      specs.push({
        id: "volume",
        label: "Net Quantity / Volume",
        value: product.volumeOrWeight,
        icon: <Scale className="w-4 h-4 text-slate-500" />,
        badge: {
          text: product.volumeOrWeight,
          variant: "blue",
        },
      });
    }

    if (product.formType) {
      specs.push({
        id: "form-type",
        label: "Formulation Factor",
        value: product.formType,
        icon: <Box className="w-4 h-4 text-teal-500" />,
      });
    }

    if (typeof product.isOrganic === "boolean") {
      specs.push({
        id: "organic",
        label: "Organic Certification",
        value: product.isOrganic
          ? "100% Certified Organic Formula"
          : "Targeted Chemical Formulation",
        icon: <Leaf className="w-4 h-4 text-emerald-600" />,
        badge: {
          text: product.isOrganic ? "🌿 100% Organic" : "Standard Formula",
          variant: product.isOrganic ? "emerald" : "slate",
        },
      });
    }

    if (Array.isArray(product.howToUse) && product.howToUse.length > 0) {
      specs.push({
        id: "dosage-count",
        label: "Application Guidelines",
        value: `${product.howToUse.length} Prescribed application steps`,
        icon: <HeartHandshake className="w-4 h-4 text-teal-600" />,
      });
    }
  }

  // ─── 6. SEEDS & BULBS ─────────────────────────────────────────────────────
  if (normalizedType === "seeds-bulbs") {
    if (product.sowingSeason) {
      const seasonVal = Array.isArray(product.sowingSeason)
        ? product.sowingSeason.filter(Boolean).join(", ")
        : String(product.sowingSeason);
      if (seasonVal) {
        specs.push({
          id: "sowing-season",
          label: "Recommended Sowing Season",
          value: seasonVal,
          icon: <Calendar className="w-4 h-4 text-lime-600" />,
          badge: {
            text: seasonVal,
            variant: "emerald",
          },
        });
      }
    }

    if (product.germinationTime) {
      specs.push({
        id: "germination-time",
        label: "Germination Period",
        value: product.germinationTime,
        icon: <Clock className="w-4 h-4 text-blue-500" />,
        badge: {
          text: product.germinationTime,
          variant: "blue",
        },
      });
    }

    if (product.quantityPerPack) {
      specs.push({
        id: "quantity-pack",
        label: "Pack Quantity / Seed Count",
        value: product.quantityPerPack,
        icon: <Sprout className="w-4 h-4 text-lime-600" />,
      });
    }
  }

  // ─── 7. PLANT STANDS & SHELVES ─────────────────────────────────────────────
  if (normalizedType === "plant-stands-shelves") {
    if (product.material) {
      specs.push({
        id: "material",
        label: "Structural Material",
        value: product.material,
        icon: <Layers className="w-4 h-4 text-amber-600" />,
        badge: {
          text: product.material,
          variant: "amber",
        },
      });
    }

    const formattedDim = formatDimensions(product.dimensions);
    if (formattedDim) {
      specs.push({
        id: "dimensions",
        label: "Dimensions (L × W × H)",
        value: formattedDim,
        icon: <Ruler className="w-4 h-4 text-slate-500" />,
      });
    }

    if (product.tierCount !== undefined && product.tierCount !== null) {
      const count = Number(product.tierCount);
      specs.push({
        id: "tier-count",
        label: "Tier / Shelf Count",
        value: `${count} ${count === 1 ? "Tier" : "Tiers"} / Shelves`,
        icon: <Grid3X3 className="w-4 h-4 text-amber-600" />,
        badge: {
          text: `${count} Tiers`,
          variant: "amber",
        },
      });
    }

    if (product.maxLoadCapacity) {
      const rawCap = String(product.maxLoadCapacity);
      const capStr = rawCap.toLowerCase().includes("kg") ? rawCap : `${rawCap} KG`;
      specs.push({
        id: "load-capacity",
        label: "Maximum Weight Capacity",
        value: `${capStr} Safe Load`,
        icon: <Scale className="w-4 h-4 text-slate-600" />,
        badge: {
          text: capStr,
          variant: "emerald",
        },
      });
    }
  }

  // ─── 8. ARTIFICIAL & DRIED PLANTS ──────────────────────────────────────────
  if (normalizedType === "artificial-dried-plants") {
    const specsObj = product.specifications || {};

    if (specsObj.brand || product.brand) {
      specs.push({
        id: "brand",
        label: "Brand / Collection",
        value: specsObj.brand || product.brand || "Generic",
        icon: <Award className="w-4 h-4 text-emerald-600" />,
      });
    }

    if (specsObj.material || product.material) {
      specs.push({
        id: "material",
        label: "Botanical Material",
        value: specsObj.material || product.material,
        icon: <Layers className="w-4 h-4 text-amber-600" />,
      });
    }

    if (specsObj.height || product.height) {
      specs.push({
        id: "height",
        label: "Display Height / Dimensions",
        value: specsObj.height || product.height,
        icon: <Ruler className="w-4 h-4 text-slate-500" />,
      });
    }

    if (specsObj.color || product.color) {
      specs.push({
        id: "color",
        label: "Color Palette",
        value: specsObj.color || product.color,
        icon: <Palette className="w-4 h-4 text-purple-500" />,
      });
    }

    if (typeof specsObj.washable === "boolean") {
      specs.push({
        id: "washable",
        label: "Water-Resistant / Washable",
        value: specsObj.washable
          ? "Yes, Water-Resistant & Washable"
          : "Wipe clean with dry cloth",
        icon: specsObj.washable ? (
          <Droplets className="w-4 h-4 text-blue-500" />
        ) : (
          <Info className="w-4 h-4 text-slate-400" />
        ),
        badge: {
          text: specsObj.washable ? "✓ Washable" : "Dry Clean",
          variant: specsObj.washable ? "blue" : "slate",
        },
      });
    }

    if (typeof specsObj.potIncluded === "boolean") {
      specs.push({
        id: "pot-included",
        label: "Planter Pot Base Included",
        value: specsObj.potIncluded
          ? "Yes, Decorative pot included with plant"
          : "No Pot Included (Stem bundle only)",
        icon: specsObj.potIncluded ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        ) : (
          <Info className="w-4 h-4 text-slate-400" />
        ),
        badge: {
          text: specsObj.potIncluded ? "✓ Pot Included" : "Pot Excluded",
          variant: specsObj.potIncluded ? "emerald" : "slate",
        },
      });
    }
  }

  // ─── Common Market Details (Universal Fallbacks) ───────────────────────────
  if (product.category && !specs.some((s) => s.id === "plant-category")) {
    specs.push({
      id: "category",
      label: "Product Category",
      value: product.category,
      icon: <PackageCheck className="w-4 h-4 text-slate-500" />,
    });
  }

  if (product.vendor) {
    specs.push({
      id: "vendor",
      label: "Fulfillment Nursery",
      value: product.vendor,
      icon: <Building2 className="w-4 h-4 text-emerald-600" />,
    });
  }

  if (product.stock !== undefined && product.stock !== null) {
    const stockNum = Number(product.stock);
    specs.push({
      id: "stock-status",
      label: "Stock Status",
      value:
        stockNum > 0
          ? `${stockNum} units ready to dispatch`
          : "Currently unavailable in inventory",
      icon: (
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            stockNum > 0 ? "bg-emerald-500" : "bg-rose-500"
          }`}
        />
      ),
      badge: {
        text: stockNum > 0 ? "In Stock" : "Sold Out",
        variant: stockNum > 0 ? "emerald" : "rose",
      },
    });
  }

  if (specs.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Verified Technical Specifications
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {specs.length} attributes logged
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {specs.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:px-4 sm:py-3 gap-2 transition-colors hover:bg-slate-50/60 ${
                idx % 2 === 1 ? "bg-slate-50/30" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-[200px]">
                <div className="w-7 h-7 rounded-lg bg-slate-100/80 border border-slate-200/50 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2 pl-9 sm:pl-0 sm:justify-end text-right">
                <span className="text-xs text-slate-900 font-semibold leading-relaxed">
                  {item.value}
                </span>
                {item.badge && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight border shrink-0 ${
                      item.badge.variant === "emerald"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : item.badge.variant === "amber"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : item.badge.variant === "blue"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : item.badge.variant === "rose"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {item.badge.text}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
