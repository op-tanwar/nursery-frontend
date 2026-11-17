import React from "react";
import {
  Sun,
  Droplets,
  PawPrint,
  ShieldAlert,
  Leaf,
  Home,
  CheckCircle2,
  XCircle,
  Ruler,
  Layers,
  Palette,
  Grid3X3,
  Compass,
  Award,
  Scale,
  Box,
  Wrench,
  ShieldCheck,
  FlaskConical,
  Sprout,
  Calendar,
  Clock,
  Sparkles,
  Info,
  PackageCheck,
  Building2,
} from "lucide-react";
import { getShopCategorySegment } from "./productUrl";
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

export type TabId = "description" | "care" | "benefits" | "gallery" | "reviews";

export interface VisibleTab {
  id: TabId;
  label: string;
}

/**
 * Robust polymorphic attribute getter that searches all payload structures:
 * product.attributes -> product -> product.specifications -> product.rawSpecifications
 */
export function getAttr(product: any, ...keys: string[]): any {
  if (!product) return undefined;
  const attrs = product.attributes || {};
  const specs = product.specifications || {};
  const rawAttrs = product.rawSpecifications?.attributes || {};
  const raw = product.rawSpecifications || {};

  for (const key of keys) {
    if (attrs[key] !== undefined && attrs[key] !== null && attrs[key] !== "") return attrs[key];
    if (product[key] !== undefined && product[key] !== null && product[key] !== "") return product[key];
    if (specs[key] !== undefined && specs[key] !== null && specs[key] !== "") return specs[key];
    if (rawAttrs[key] !== undefined && rawAttrs[key] !== null && rawAttrs[key] !== "") return rawAttrs[key];
    if (raw[key] !== undefined && raw[key] !== null && raw[key] !== "") return raw[key];
  }
  return undefined;
}

/**
 * Formats dimensions cleanly into human-readable notation (e.g. "12 × 10 Inches" or "L × W × H")
 */
export function formatDimensions(dim: any): string | null {
  if (!dim) return null;
  if (typeof dim === "string" && dim.trim()) return dim.trim();
  if (typeof dim === "object") {
    // If Height and Diameter (common in pots)
    if (dim.height && dim.diameter) {
      return `${dim.height} (H) × ${dim.diameter} (Dia)`;
    }
    // If Length, Width, Height
    const parts = [
      dim.length ? `${dim.length} (L)` : null,
      dim.width ? `${dim.width} (W)` : null,
      dim.height ? `${dim.height} (H)` : null,
      dim.diameter ? `${dim.diameter} (Dia)` : null,
    ].filter(Boolean);
    return parts.length ? parts.join(" × ") : null;
  }
  return null;
}

/**
 * Formats array or string cleanly
 */
export function formatArrayOrString(val: any): string | null {
  if (!val) return null;
  if (Array.isArray(val)) {
    const filtered = val.filter((item) => item !== undefined && item !== null && String(item).trim() !== "");
    return filtered.length ? filtered.join(", ") : null;
  }
  if (typeof val === "string" && val.trim()) return val.trim();
  return String(val);
}

/**
 * 🛠️ Comprehensive 8-Category Specification Builder
 * Maps every filled create/edit form field to human-readable rows with badges and icons.
 * Ignores empty/null values so zero blank or "N/A" rows appear.
 */
export function buildProductSpecs(product: any, shopType: ShopUrlType | string): SpecItem[] {
  if (!product) return [];

  const rawCat = product.category || shopType || "";
  const canonicalType = (getShopCategorySegment(rawCat) || "plants") as ShopUrlType;
  const specs: SpecItem[] = [];

  // =========================================================================
  // 1. LIVE PLANTS
  // =========================================================================
  if (canonicalType === "plants") {
    const botanicalName = getAttr(product, "botanicalName", "scientificName");
    if (botanicalName) {
      specs.push({
        id: "botanical-name",
        label: "Botanical / Scientific Name",
        value: botanicalName,
        icon: <Leaf className="w-4 h-4 text-emerald-600" />,
        badge: { text: "Botanical Specimen", variant: "emerald" },
      });
    }

    const subCategory = getAttr(product, "subCategory", "plantType");
    if (subCategory && subCategory !== "plants") {
      specs.push({
        id: "subcategory",
        label: "Plant Classification",
        value: subCategory,
        icon: <Home className="w-4 h-4 text-slate-500" />,
        badge: { text: subCategory, variant: "slate" },
      });
    }

    const plantSize = getAttr(product, "plantSize", "height", "size");
    if (plantSize) {
      specs.push({
        id: "plant-size",
        label: "Plant Size / Height",
        value: plantSize,
        icon: <Ruler className="w-4 h-4 text-slate-500" />,
      });
    }

    const light = getAttr(product, "lightRequirement", "sunlightRequirement", "sunlight");
    if (light) {
      specs.push({
        id: "sunlight",
        label: "Sunlight Requirement",
        value: light,
        icon: <Sun className="w-4 h-4 text-amber-500" />,
        badge: { text: light, variant: "amber" },
      });
    }

    const watering = getAttr(product, "wateringSchedule", "wateringFrequency", "watering");
    if (watering) {
      specs.push({
        id: "watering",
        label: "Watering Frequency",
        value: watering,
        icon: <Droplets className="w-4 h-4 text-blue-500" />,
        badge: { text: watering, variant: "blue" },
      });
    }

    const humidity = getAttr(product, "humidity", "humidityRequirement");
    if (humidity) {
      specs.push({
        id: "humidity",
        label: "Humidity Level",
        value: humidity,
        icon: <Droplets className="w-4 h-4 text-teal-500" />,
      });
    }

    const maintenance = getAttr(product, "maintenanceLevel");
    if (maintenance) {
      const lowerMaint = String(maintenance).toLowerCase();
      specs.push({
        id: "maintenance",
        label: "Maintenance Level",
        value: `${maintenance} Maintenance`,
        icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
        badge: {
          text: maintenance,
          variant: lowerMaint === "easy" ? "emerald" : lowerMaint === "moderate" ? "blue" : "amber",
        },
      });
    }

    const petFriendly = getAttr(product, "isPetFriendly", "petFriendly");
    if (petFriendly !== undefined) {
      const isPet = petFriendly === true || String(petFriendly).toLowerCase() === "true";
      specs.push({
        id: "pet-friendly",
        label: "Pet Friendliness",
        value: isPet ? "Yes, Pet Safe (Non-toxic to cats & dogs)" : "No, Toxic to Pets (Keep out of reach)",
        icon: isPet ? <PawPrint className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-rose-500" />,
        badge: { text: isPet ? "🐾 Pet Friendly" : "⚠️ Toxic to Pets", variant: isPet ? "emerald" : "rose" },
      });
    }

    const airPurifying = getAttr(product, "isAirPurifying", "airPurifying");
    if (airPurifying !== undefined) {
      const isAir = airPurifying === true || String(airPurifying).toLowerCase() === "true";
      specs.push({
        id: "air-purifying",
        label: "Air Purifying Capability",
        value: isAir ? "Yes, Certified NASA Clean Air Plant" : "Standard Oxygen Release",
        icon: <Leaf className="w-4 h-4 text-emerald-600" />,
        badge: isAir ? { text: "✓ Air Purifier", variant: "emerald" } : undefined,
      });
    }

    const potIncluded = getAttr(product, "potIncluded", "includesPot");
    if (potIncluded !== undefined) {
      const isPot = potIncluded === true || String(potIncluded).toLowerCase() === "true";
      specs.push({
        id: "pot-included",
        label: "Planter Pot Included",
        value: isPot ? "Yes, Standard Nursery Pot Included" : "No, Bare Root / Plant Only",
        icon: isPot ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-slate-400" />,
        badge: { text: isPot ? "✓ Pot Included" : "Plant Only", variant: isPot ? "emerald" : "slate" },
      });
    }

    const soilType = getAttr(product, "soilType", "soilRequirement");
    if (soilType) {
      specs.push({
        id: "soil-type",
        label: "Recommended Soil Mix",
        value: soilType,
        icon: <Layers className="w-4 h-4 text-amber-700" />,
      });
    }
  }

  // =========================================================================
  // 2. POTS & PLANTERS
  // =========================================================================
  if (canonicalType === "pots") {
    const material = getAttr(product, "material", "potMaterial");
    if (material) {
      specs.push({
        id: "material",
        label: "Planter Material",
        value: material,
        icon: <Layers className="w-4 h-4 text-amber-600" />,
        badge: { text: material, variant: "amber" },
      });
    }

    const color = formatArrayOrString(getAttr(product, "color"));
    if (color) {
      specs.push({
        id: "color",
        label: "Primary Color / Glaze",
        value: color,
        icon: <Palette className="w-4 h-4 text-purple-500" />,
      });
    }

    const finish = getAttr(product, "finish", "surfaceFinish");
    if (finish) {
      specs.push({
        id: "finish",
        label: "Surface Finish",
        value: finish,
        icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      });
    }

    const shape = getAttr(product, "shape", "potShape");
    if (shape) {
      specs.push({
        id: "shape",
        label: "Planter Shape",
        value: shape,
        icon: <Grid3X3 className="w-4 h-4 text-slate-500" />,
      });
    }

    const formattedDim = formatDimensions(getAttr(product, "dimensions"));
    if (formattedDim) {
      specs.push({
        id: "dimensions",
        label: "Dimensions (Height × Diameter)",
        value: formattedDim,
        icon: <Ruler className="w-4 h-4 text-slate-500" />,
      });
    }

    const drainage = getAttr(product, "hasDrainageHole", "drainageHoles");
    if (drainage !== undefined) {
      const hasDrain = drainage === true || String(drainage).toLowerCase() === "true";
      specs.push({
        id: "drainage",
        label: "Drainage Hole",
        value: hasDrain ? "Yes, Pre-drilled drainage hole included" : "No drainage hole (Indoor cachepot / sealed)",
        icon: hasDrain ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-slate-400" />,
        badge: { text: hasDrain ? "✓ Drainage Hole" : "No Hole", variant: hasDrain ? "emerald" : "slate" },
      });
    }

    const saucer = getAttr(product, "includesSaucer", "saucerIncluded");
    if (saucer !== undefined) {
      const hasSaucer = saucer === true || String(saucer).toLowerCase() === "true";
      specs.push({
        id: "saucer",
        label: "Matching Saucer / Plate",
        value: hasSaucer ? "Yes, Matching plate/saucer included" : "Not included",
        icon: hasSaucer ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Info className="w-4 h-4 text-slate-400" />,
        badge: { text: hasSaucer ? "✓ Saucer Included" : "Saucer Excluded", variant: hasSaucer ? "emerald" : "slate" },
      });
    }

    const env = getAttr(product, "isIndoorOutdoor", "suitableFor", "usageEnvironment");
    if (env) {
      specs.push({
        id: "environment",
        label: "Usage Environment",
        value: env === "Both" ? "Indoor & Outdoor Safe" : env,
        icon: <Home className="w-4 h-4 text-emerald-600" />,
      });
    }

    const weight = getAttr(product, "weight", "potWeight");
    if (weight) {
      specs.push({
        id: "weight",
        label: "Net Weight",
        value: String(weight).toLowerCase().includes("kg") || String(weight).toLowerCase().includes("g") ? String(weight) : `${weight} KG`,
        icon: <Scale className="w-4 h-4 text-slate-500" />,
      });
    }
  }

  // =========================================================================
  // 3. ACCESSORIES
  // =========================================================================
  if (canonicalType === "accessories") {
    const brand = getAttr(product, "brand");
    if (brand) {
      specs.push({
        id: "brand",
        label: "Brand Designation",
        value: brand,
        icon: <Award className="w-4 h-4 text-blue-600" />,
      });
    }

    const material = getAttr(product, "material");
    if (material) {
      specs.push({
        id: "material",
        label: "Material Composition",
        value: material,
        icon: <Layers className="w-4 h-4 text-amber-600" />,
      });
    }

    const capacity = getAttr(product, "capacity");
    if (capacity) {
      specs.push({
        id: "capacity",
        label: "Volumetric Capacity",
        value: capacity,
        icon: <Box className="w-4 h-4 text-blue-500" />,
      });
    }

    const formattedDim = formatDimensions(getAttr(product, "dimensions"));
    if (formattedDim) {
      specs.push({
        id: "dimensions",
        label: "Dimensions / Sizing",
        value: formattedDim,
        icon: <Ruler className="w-4 h-4 text-slate-500" />,
      });
    }

    const weight = getAttr(product, "weight");
    if (weight) {
      specs.push({
        id: "weight",
        label: "Net Weight",
        value: String(weight),
        icon: <Scale className="w-4 h-4 text-slate-500" />,
      });
    }

    const color = formatArrayOrString(getAttr(product, "color"));
    if (color) {
      specs.push({
        id: "color",
        label: "Color / Finish",
        value: color,
        icon: <Palette className="w-4 h-4 text-purple-500" />,
      });
    }

    const usage = getAttr(product, "usageType", "compatibility", "suitableFor");
    if (usage) {
      specs.push({
        id: "usage",
        label: "Compatibility & Usage",
        value: usage,
        icon: <PackageCheck className="w-4 h-4 text-teal-600" />,
      });
    }
  }

  // =========================================================================
  // 4. GARDENING TOOLS
  // =========================================================================
  if (canonicalType === "gardening-tools") {
    const brand = getAttr(product, "brand");
    if (brand) {
      specs.push({
        id: "brand",
        label: "Brand Designation",
        value: brand,
        icon: <Award className="w-4 h-4 text-blue-600" />,
      });
    }

    const material = getAttr(product, "material", "bladeMaterial");
    if (material) {
      specs.push({
        id: "material",
        label: "Blade & Tool Material",
        value: material,
        icon: <Layers className="w-4 h-4 text-emerald-600" />,
        badge: { text: material, variant: "emerald" },
      });
    }

    const handleMaterial = getAttr(product, "handleMaterial", "gripMaterial");
    if (handleMaterial) {
      specs.push({
        id: "handle-material",
        label: "Handle & Grip Material",
        value: handleMaterial,
        icon: <Wrench className="w-4 h-4 text-amber-600" />,
      });
    }

    const formattedDim = formatDimensions(getAttr(product, "dimensions"));
    if (formattedDim) {
      specs.push({
        id: "dimensions",
        label: "Tool Length / Sizing",
        value: formattedDim,
        icon: <Ruler className="w-4 h-4 text-slate-500" />,
      });
    }

    const weight = getAttr(product, "weight");
    if (weight) {
      specs.push({
        id: "weight",
        label: "Tool Weight",
        value: String(weight),
        icon: <Scale className="w-4 h-4 text-slate-500" />,
      });
    }

    const rust = getAttr(product, "rustResistant", "isRustResistant");
    if (rust !== undefined) {
      const isRust = rust === true || String(rust).toLowerCase() === "true";
      specs.push({
        id: "rust-resistance",
        label: "Rust Resistance",
        value: isRust ? "Yes, Anti-corrosive / Rust-resistant coating" : "Standard Steel (Clean & dry after use)",
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
        badge: isRust ? { text: "✓ Rust Resistant", variant: "emerald" } : undefined,
      });
    }

    const warranty = getAttr(product, "warrantyMonths");
    if (warranty && Number(warranty) > 0) {
      specs.push({
        id: "warranty",
        label: "Warranty Coverage",
        value: `${warranty} Months Manufacturer Warranty`,
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
        badge: { text: `${warranty} Mo. Warranty`, variant: "emerald" },
      });
    }

    const toolType = getAttr(product, "toolType", "usageType");
    if (toolType) {
      specs.push({
        id: "tool-type",
        label: "Tool Category & Application",
        value: toolType,
        icon: <Wrench className="w-4 h-4 text-slate-500" />,
      });
    }
  }

  // =========================================================================
  // 5. PLANT CARE & FERTILIZERS
  // =========================================================================
  if (canonicalType === "plant-care") {
    const formType = getAttr(product, "formType");
    if (formType) {
      specs.push({
        id: "form-type",
        label: "Formulation Factor",
        value: formType,
        icon: <Box className="w-4 h-4 text-teal-500" />,
        badge: { text: formType, variant: "blue" },
      });
    }

    const volume = getAttr(product, "volumeOrWeight", "netQuantity", "volume", "weight");
    if (volume) {
      specs.push({
        id: "volume",
        label: "Net Quantity / Volume",
        value: String(volume),
        icon: <Scale className="w-4 h-4 text-slate-500" />,
        badge: { text: String(volume), variant: "blue" },
      });
    }

    const organic = getAttr(product, "isOrganic");
    if (organic !== undefined) {
      const isOrg = organic === true || String(organic).toLowerCase() === "true";
      specs.push({
        id: "organic",
        label: "Organic Certification",
        value: isOrg ? "Yes, 100% Certified Organic & Bio-degradable" : "Targeted Chemical Formulation",
        icon: <Leaf className="w-4 h-4 text-emerald-600" />,
        badge: { text: isOrg ? "🌿 100% Organic" : "Standard Formula", variant: isOrg ? "emerald" : "slate" },
      });
    }

    const comp = getAttr(product, "composition", "npkRatio", "activeIngredients");
    if (comp) {
      specs.push({
        id: "composition",
        label: "Active Ingredients / Composition",
        value: comp,
        icon: <FlaskConical className="w-4 h-4 text-teal-600" />,
      });
    }

    const suitable = formatArrayOrString(getAttr(product, "suitableFor", "targetPlants"));
    if (suitable) {
      specs.push({
        id: "suitable-for",
        label: "Target Plants",
        value: suitable,
        icon: <Sprout className="w-4 h-4 text-emerald-600" />,
      });
    }

    const freq = getAttr(product, "applicationFrequency", "howOften");
    if (freq) {
      specs.push({
        id: "frequency",
        label: "Application Frequency",
        value: freq,
        icon: <Calendar className="w-4 h-4 text-blue-500" />,
      });
    }

    const shelfLife = getAttr(product, "shelfLife", "expiryMonths");
    if (shelfLife) {
      specs.push({
        id: "shelf-life",
        label: "Shelf Life / Longevity",
        value: String(shelfLife),
        icon: <Clock className="w-4 h-4 text-slate-500" />,
      });
    }
  }

  // =========================================================================
  // 6. SEEDS & BULBS
  // =========================================================================
  if (canonicalType === "seeds-bulbs") {
    const seedType = getAttr(product, "seedType", "seedOrBulbType", "subCategory");
    if (seedType && seedType !== "seeds-bulbs") {
      specs.push({
        id: "seed-type",
        label: "Seed / Bulb Classification",
        value: seedType,
        icon: <Sprout className="w-4 h-4 text-lime-600" />,
      });
    }

    const packQty = getAttr(product, "quantityPerPack", "seedQuantity", "packQuantity");
    if (packQty) {
      specs.push({
        id: "quantity-pack",
        label: "Pack Quantity / Seed Count",
        value: String(packQty),
        icon: <Box className="w-4 h-4 text-lime-600" />,
      });
    }

    const germination = getAttr(product, "germinationTime", "germinationDays");
    if (germination) {
      const germStr = String(germination).toLowerCase().includes("day") ? String(germination) : `${germination} Days`;
      specs.push({
        id: "germination-time",
        label: "Germination Period",
        value: germStr,
        icon: <Clock className="w-4 h-4 text-blue-500" />,
        badge: { text: germStr, variant: "blue" },
      });
    }

    const season = formatArrayOrString(getAttr(product, "sowingSeason"));
    if (season) {
      specs.push({
        id: "sowing-season",
        label: "Recommended Sowing Season",
        value: season,
        icon: <Calendar className="w-4 h-4 text-lime-600" />,
        badge: { text: season, variant: "emerald" },
      });
    }

    const sunlight = getAttr(product, "sunlightRequirement", "sunlight");
    if (sunlight) {
      specs.push({
        id: "sunlight",
        label: "Sunlight Requirement",
        value: sunlight,
        icon: <Sun className="w-4 h-4 text-amber-500" />,
      });
    }

    const depth = getAttr(product, "sowingDepth");
    if (depth) {
      specs.push({
        id: "sowing-depth",
        label: "Sowing Depth",
        value: String(depth),
        icon: <Ruler className="w-4 h-4 text-slate-500" />,
      });
    }

    const spacing = getAttr(product, "spacing", "plantSpacing");
    if (spacing) {
      specs.push({
        id: "spacing",
        label: "Plant Spacing",
        value: String(spacing),
        icon: <Compass className="w-4 h-4 text-slate-500" />,
      });
    }

    const harvest = getAttr(product, "harvestTime", "maturityDays");
    if (harvest) {
      specs.push({
        id: "harvest-time",
        label: "Harvest / Maturity Time",
        value: String(harvest),
        icon: <Clock className="w-4 h-4 text-teal-600" />,
      });
    }

    const variety = getAttr(product, "seedVariety", "isHybrid");
    if (variety !== undefined) {
      const isHyb = variety === true || String(variety).toLowerCase() === "true" || String(variety).toLowerCase().includes("hybrid");
      specs.push({
        id: "variety",
        label: "Breeding Classification",
        value: isHyb ? "F1 High-Yield Hybrid" : "Open-Pollinated / Heirloom",
        icon: <Award className="w-4 h-4 text-lime-600" />,
      });
    }
  }

  // =========================================================================
  // 7. PLANT STANDS & SHELVES
  // =========================================================================
  if (canonicalType === "plant-stands-shelves") {
    const material = getAttr(product, "material", "structuralMaterial");
    if (material) {
      specs.push({
        id: "material",
        label: "Structural Material",
        value: material,
        icon: <Layers className="w-4 h-4 text-amber-600" />,
        badge: { text: material, variant: "amber" },
      });
    }

    const tiers = getAttr(product, "tierCount", "shelvesCount");
    if (tiers !== undefined && tiers !== null && tiers !== "") {
      const count = Number(tiers);
      specs.push({
        id: "tier-count",
        label: "Tier / Shelf Count",
        value: `${count} ${count === 1 ? "Tier" : "Tiers"} / Shelves`,
        icon: <Grid3X3 className="w-4 h-4 text-amber-600" />,
        badge: { text: `${count} Tiers`, variant: "amber" },
      });
    }

    const maxLoad = getAttr(product, "maxLoadCapacity", "weightCapacityKg");
    if (maxLoad) {
      const rawCap = String(maxLoad);
      const capStr = rawCap.toLowerCase().includes("kg") ? rawCap : `${rawCap} KG`;
      specs.push({
        id: "load-capacity",
        label: "Maximum Weight Capacity",
        value: `${capStr} Safe Load`,
        icon: <Scale className="w-4 h-4 text-slate-600" />,
        badge: { text: capStr, variant: "emerald" },
      });
    }

    const formattedDim = formatDimensions(getAttr(product, "dimensions"));
    if (formattedDim) {
      specs.push({
        id: "dimensions",
        label: "Dimensions (L × W × H)",
        value: formattedDim,
        icon: <Ruler className="w-4 h-4 text-slate-500" />,
      });
    }

    const color = formatArrayOrString(getAttr(product, "color", "finish"));
    if (color) {
      specs.push({
        id: "color",
        label: "Color & Finish",
        value: color,
        icon: <Palette className="w-4 h-4 text-purple-500" />,
      });
    }

    const assembly = getAttr(product, "assemblyRequired", "isFoldable");
    if (assembly !== undefined) {
      const isFold = assembly === true || String(assembly).toLowerCase() === "true" || String(assembly).toLowerCase().includes("fold");
      specs.push({
        id: "assembly",
        label: "Assembly & Installation",
        value: isFold ? "No Assembly Required (Foldable / Pre-assembled)" : "Yes, DIY Assembly (Tools & Hardware Included)",
        icon: <Wrench className="w-4 h-4 text-slate-500" />,
        badge: { text: isFold ? "✓ Foldable" : "DIY Assembly", variant: isFold ? "emerald" : "slate" },
      });
    }

    const env = getAttr(product, "isIndoorOutdoor", "usageEnvironment");
    if (env) {
      specs.push({
        id: "environment",
        label: "Usage Environment",
        value: env === "Both" ? "Indoor & Outdoor Safe" : env,
        icon: <Home className="w-4 h-4 text-emerald-600" />,
      });
    }

    const weight = getAttr(product, "weight");
    if (weight) {
      specs.push({
        id: "weight",
        label: "Stand Weight",
        value: String(weight),
        icon: <Scale className="w-4 h-4 text-slate-500" />,
      });
    }
  }

  // =========================================================================
  // 8. ARTIFICIAL & DRIED PLANTS
  // =========================================================================
  if (canonicalType === "artificial-dried-plants") {
    const material = getAttr(product, "material");
    if (material) {
      specs.push({
        id: "material",
        label: "Botanical Material Composition",
        value: material,
        icon: <Layers className="w-4 h-4 text-amber-600" />,
        badge: { text: material, variant: "amber" },
      });
    }

    const height = getAttr(product, "height") || formatDimensions(getAttr(product, "dimensions"));
    if (height) {
      specs.push({
        id: "height",
        label: "Display Height / Sizing",
        value: String(height),
        icon: <Ruler className="w-4 h-4 text-slate-500" />,
      });
    }

    const color = formatArrayOrString(getAttr(product, "color"));
    if (color) {
      specs.push({
        id: "color",
        label: "Color Palette",
        value: color,
        icon: <Palette className="w-4 h-4 text-purple-500" />,
      });
    }

    const potIncluded = getAttr(product, "potIncluded", "includesVase");
    if (potIncluded !== undefined) {
      const isPot = potIncluded === true || String(potIncluded).toLowerCase() === "true";
      specs.push({
        id: "pot-included",
        label: "Planter Pot Included",
        value: isPot ? "Yes, Decorative Pot Included" : "No Pot Included (Stem / Bouquet Bundle Only)",
        icon: isPot ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Info className="w-4 h-4 text-slate-400" />,
        badge: { text: isPot ? "✓ Pot Included" : "Pot Excluded", variant: isPot ? "emerald" : "slate" },
      });
    }

    const washable = getAttr(product, "washable", "uvResistant");
    if (washable !== undefined) {
      const isWash = washable === true || String(washable).toLowerCase() === "true";
      specs.push({
        id: "washable",
        label: "Water & UV Resistance",
        value: isWash ? "Yes, Water-Resistant & Washable" : "Wipe clean with a soft dry cloth",
        icon: isWash ? <Droplets className="w-4 h-4 text-blue-500" /> : <Info className="w-4 h-4 text-slate-400" />,
        badge: { text: isWash ? "✓ Washable" : "Dry Clean Only", variant: isWash ? "blue" : "slate" },
      });
    }

    const placement = getAttr(product, "placement", "usageType");
    if (placement) {
      specs.push({
        id: "placement",
        label: "Recommended Placement",
        value: placement,
        icon: <Home className="w-4 h-4 text-slate-500" />,
      });
    }

    const maintenance = getAttr(product, "maintenance");
    specs.push({
      id: "maintenance",
      label: "Maintenance Level",
      value: maintenance || "Zero Maintenance Required (No sunlight, watering, or pruning)",
      icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
      badge: { text: "Zero Maintenance", variant: "emerald" },
    });
  }

  // =========================================================================
  // COMMON MARKET DETAILS (Fulfillment & Stock)
  // =========================================================================
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
      label: "Inventory Status",
      value: stockNum > 0 ? `${stockNum} units ready to dispatch` : "Currently backordered",
      icon: <span className={`w-2.5 h-2.5 rounded-full ${stockNum > 0 ? "bg-emerald-500" : "bg-rose-500"}`} />,
      badge: { text: stockNum > 0 ? "In Stock" : "Sold Out", variant: stockNum > 0 ? "emerald" : "rose" },
    });
  }

  return specs;
}

/**
 * Checks whether sowing/planting guidelines exist for a product.
 * Returns true ONLY if category is seeds-bulbs (or plants) AND at least one guideline field is filled.
 * Completely returns false for pots, accessories, gardening-tools, plant-stands-shelves, artificial-dried-plants, etc.
 */
export function hasSowingOrCareGuidelines(product: any, shopType: ShopUrlType | string): boolean {
  if (!product) return false;
  const rawCat = product.category || shopType || "";
  const canonicalType = (getShopCategorySegment(rawCat) || "plants") as ShopUrlType;

  // STRICT: Completely hide for non-plant/non-seed categories
  if (canonicalType !== "seeds-bulbs" && canonicalType !== "plants") {
    return false;
  }

  // Check guideline content fields
  const season = getAttr(product, "sowingSeason");
  const germination = getAttr(product, "germinationTime", "germinationDays");
  const depth = getAttr(product, "sowingDepth");
  const sunlight = getAttr(product, "sunlightRequirement", "lightRequirement", "sunlight");
  const watering = getAttr(product, "wateringSchedule", "wateringFrequency", "watering");
  const soil = getAttr(product, "soilType", "soilRequirement");
  const planting = getAttr(product, "plantingInstructions");

  const care = product.careInstructions || product.attributes?.careInstructions;
  const hasCareSteps = Array.isArray(care) ? care.some((c: any) => typeof c === "string" && c.trim().length > 0) : Boolean(care);

  const sowingSteps = product.sowingSteps || product.attributes?.sowingSteps;
  const hasSowingSteps = Array.isArray(sowingSteps) ? sowingSteps.some((s: any) => typeof s === "string" && s.trim().length > 0) : Boolean(sowingSteps);

  return Boolean(
    season ||
    germination ||
    depth ||
    sunlight ||
    watering ||
    soil ||
    planting ||
    hasCareSteps ||
    hasSowingSteps
  );
}

/**
 * Extracts all non-empty bullet points/highlights from product
 */
export function getProductHighlights(product: any, descriptionOption?: any): string[] {
  if (!product) return [];
  const highlights: string[] = [];

  const add = (items: any) => {
    if (Array.isArray(items)) {
      items.forEach((x) => {
        if (typeof x === "string" && x.trim() && !highlights.includes(x.trim())) {
          highlights.push(x.trim());
        }
      });
    } else if (typeof items === "string" && items.trim() && !highlights.includes(items.trim())) {
      highlights.push(items.trim());
    }
  };

  add(product.highlights);
  add(product.features);
  add(product.keyFeatures);
  add(product.benefits);
  add(product.attributes?.benefits);
  add(product.attributes?.features);
  add(product.attributes?.highlights);
  add(descriptionOption?.points);
  add(product.descriptionOption?.points);

  return highlights;
}

/**
 * Returns list of extra gallery image URLs (excluding single cover placeholder)
 */
export function getExtraGalleryImages(product: any): string[] {
  if (!product) return [];
  const rawList = product.galleryImages || product.images || [];

  const urls = (Array.isArray(rawList) ? rawList : [rawList])
    .map((img: any) => (typeof img === "string" ? img : img?.url))
    .filter((url: any) => typeof url === "string" && (url.startsWith("http") || url.startsWith("/")));

  const uniqueUrls = Array.from(new Set(urls)) as string[];

  // Only consider gallery valid if there are > 1 images
  return uniqueUrls.length > 1 ? uniqueUrls : [];
}

/**
 * 🎯 Dynamic Tab Computation Engine
 * Computes the visible tabs based strictly on data availability and category relevance.
 */
export function getVisibleTabs(
  product: any,
  shopType: ShopUrlType | string,
  descriptionOption?: any,
  reviewCount: number = 0
): VisibleTab[] {
  if (!product) return [{ id: "reviews", label: "Verified Reviews" }];

  const rawCat = product.category || shopType || "";
  const canonicalType = (getShopCategorySegment(rawCat) || "plants") as ShopUrlType;
  const tabs: VisibleTab[] = [];

  // 1. Specification Tab: Show if specs or description exist
  const specs = buildProductSpecs(product, shopType);
  if (specs.length > 0 || (product.description && product.description.trim())) {
    tabs.push({ id: "description", label: "Specification" });
  }

  // 2. Sowing Guidelines Tab: ONLY for seeds-bulbs or plants with actual content
  if (hasSowingOrCareGuidelines(product, shopType)) {
    const label = canonicalType === "seeds-bulbs" ? "Sowing Guidelines" : "Plant Care & Sowing Guidelines";
    tabs.push({ id: "care", label });
  }

  // 3. Product Highlights Tab: ONLY if highlights/benefits > 0
  const highlights = getProductHighlights(product, descriptionOption);
  if (highlights.length > 0) {
    const label =
      canonicalType === "plants"
        ? "Botanical Benefits"
        : canonicalType === "plant-care"
        ? "Biochemical Benefits"
        : "Product Highlights";
    tabs.push({ id: "benefits", label });
  }

  // 4. Asset Gallery Canvas Tab: ONLY if extra images exist beyond single cover
  const extraImages = getExtraGalleryImages(product);
  if (extraImages.length > 0) {
    tabs.push({ id: "gallery", label: "Asset Gallery Canvas" });
  }

  // 5. Verified Reviews Tab: Always visible
  const reviewsLabel = reviewCount > 0 ? `Verified Reviews (${reviewCount})` : "Verified Reviews";
  tabs.push({ id: "reviews", label: reviewsLabel });

  return tabs;
}
