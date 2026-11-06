/**
 * ======================================================================
 * 💰 FRONTEND PRICING INTEGRITY & DYNAMIC CATEGORY GST ENGINE
 * ======================================================================
 * Client-side calculation engine strictly mirroring backend financial logic:
 * 1. Effective Price = (discountPrice > 0 && discountPrice < originalPrice) ? discountPrice : originalPrice.
 * 2. Paise-safe integer arithmetic prevents floating-point inaccuracies.
 * 3. Dynamic Category-wise GST rates (e.g., Plants 5%, Pots 12%, Tools 18%, Seeds 0%).
 * 4. Free shipping threshold: Subtotal >= ₹500 (50,000 paise), else ₹50.
 * ======================================================================
 */

import {
  PRODUCT_CATEGORIES,
  ProductCategorySlug,
  TaxCategoryMetadata,
  CANONICAL_TAX_CATEGORIES,
  STATUTORY_DEFAULT_TAX,
  normalizeTaxCategory,
} from "../constants/categories";

export {
  PRODUCT_CATEGORIES,
  CANONICAL_TAX_CATEGORIES,
  STATUTORY_DEFAULT_TAX,
  normalizeTaxCategory,
};

export type {
  ProductCategorySlug,
  TaxCategoryMetadata,
};

export interface CategoryTaxConfig {
  taxPercentage: number;
  isTaxInclusive?: boolean;
}

export interface CategoryTaxSummary {
  category: string;
  taxRatePercentage: number;
  taxableAmount: number; // in Rupees
  taxAmount: number; // in Rupees
  isTaxInclusive: boolean;
}

/**
 * Pure function that sanitizes any category input into a clean lowercase hyphenated slug.
 * Strips whitespace, replaces underscores/spaces with hyphens, removes special characters,
 * and handles edge cases (null, undefined, numbers, already-formatted slugs).
 */
export function normalizeCategorySlug(category?: string | null): string {
  if (!category || typeof category !== "string") {
    return "";
  }
  return category
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Single Source of Truth Taxonomy Mapping for all marketplace categories.
 * Maps canonical slugs and customer-facing aliases to statutory GST tax categories.
 */
export interface TaxCategoryDefinition {
  taxCategory: string; // Internal tax category key (e.g. PLANTS, GARDENING_TOOLS)
  canonicalSlug: string; // Canonical kebab-case slug
  displayName: string; // User-facing display title
  taxPercentage: number; // Statutory GST rate
  isTaxInclusive: boolean;
}

export const TAX_CATEGORY_TAXONOMY: Record<string, TaxCategoryDefinition> = {
  // 🌿 Plants / Live Plants -> 5% GST
  plants: { taxCategory: "PLANTS", canonicalSlug: "plants", displayName: "Plants", taxPercentage: 5, isTaxInclusive: false },
  plant: { taxCategory: "PLANTS", canonicalSlug: "plants", displayName: "Plants", taxPercentage: 5, isTaxInclusive: false },
  "live-plants": { taxCategory: "PLANTS", canonicalSlug: "plants", displayName: "Plants", taxPercentage: 5, isTaxInclusive: false },
  "live-plant": { taxCategory: "PLANTS", canonicalSlug: "plants", displayName: "Plants", taxPercentage: 5, isTaxInclusive: false },
  "indoor-plants": { taxCategory: "PLANTS", canonicalSlug: "plants", displayName: "Plants", taxPercentage: 5, isTaxInclusive: false },
  "outdoor-plants": { taxCategory: "PLANTS", canonicalSlug: "plants", displayName: "Plants", taxPercentage: 5, isTaxInclusive: false },

  // 🛠️ Gardening Tools / Tools -> 18% GST
  "gardening-tools": { taxCategory: "GARDENING_TOOLS", canonicalSlug: "gardening-tools", displayName: "Gardening Tools", taxPercentage: 18, isTaxInclusive: false },
  "gardening-tool": { taxCategory: "GARDENING_TOOLS", canonicalSlug: "gardening-tools", displayName: "Gardening Tools", taxPercentage: 18, isTaxInclusive: false },
  tools: { taxCategory: "GARDENING_TOOLS", canonicalSlug: "gardening-tools", displayName: "Gardening Tools", taxPercentage: 18, isTaxInclusive: false },
  tool: { taxCategory: "GARDENING_TOOLS", canonicalSlug: "gardening-tools", displayName: "Gardening Tools", taxPercentage: 18, isTaxInclusive: false },
  gardeningtool: { taxCategory: "GARDENING_TOOLS", canonicalSlug: "gardening-tools", displayName: "Gardening Tools", taxPercentage: 18, isTaxInclusive: false },

  // 🧪 Plant Care / Fertilizers -> 18% GST
  "plant-care": { taxCategory: "PLANT_CARE", canonicalSlug: "plant-care", displayName: "Plant Care", taxPercentage: 18, isTaxInclusive: false },
  plantcare: { taxCategory: "PLANT_CARE", canonicalSlug: "plant-care", displayName: "Plant Care", taxPercentage: 18, isTaxInclusive: false },
  fertilizers: { taxCategory: "PLANT_CARE", canonicalSlug: "plant-care", displayName: "Plant Care", taxPercentage: 18, isTaxInclusive: false },
  fertilizer: { taxCategory: "PLANT_CARE", canonicalSlug: "plant-care", displayName: "Plant Care", taxPercentage: 18, isTaxInclusive: false },
  soil: { taxCategory: "PLANT_CARE", canonicalSlug: "plant-care", displayName: "Plant Care", taxPercentage: 18, isTaxInclusive: false },

  // 🌰 Seeds & Bulbs / Seeds -> 0% GST (Exempt, matching backend taxService)
  "seeds-bulbs": { taxCategory: "SEEDS", canonicalSlug: "seeds-bulbs", displayName: "Seeds & Bulbs", taxPercentage: 0, isTaxInclusive: false },
  seeds: { taxCategory: "SEEDS", canonicalSlug: "seeds-bulbs", displayName: "Seeds & Bulbs", taxPercentage: 0, isTaxInclusive: false },
  seed: { taxCategory: "SEEDS", canonicalSlug: "seeds-bulbs", displayName: "Seeds & Bulbs", taxPercentage: 0, isTaxInclusive: false },
  bulbs: { taxCategory: "SEEDS", canonicalSlug: "seeds-bulbs", displayName: "Seeds & Bulbs", taxPercentage: 0, isTaxInclusive: false },
  bulb: { taxCategory: "SEEDS", canonicalSlug: "seeds-bulbs", displayName: "Seeds & Bulbs", taxPercentage: 0, isTaxInclusive: false },
  seedsbulbs: { taxCategory: "SEEDS", canonicalSlug: "seeds-bulbs", displayName: "Seeds & Bulbs", taxPercentage: 0, isTaxInclusive: false },

  // 🏺 Pots & Planters / Planters -> 18% GST
  "pots-planters": { taxCategory: "POTS", canonicalSlug: "pots", displayName: "Pots & Planters", taxPercentage: 18, isTaxInclusive: false },
  pots: { taxCategory: "POTS", canonicalSlug: "pots", displayName: "Pots & Planters", taxPercentage: 18, isTaxInclusive: false },
  pot: { taxCategory: "POTS", canonicalSlug: "pots", displayName: "Pots & Planters", taxPercentage: 18, isTaxInclusive: false },
  planters: { taxCategory: "POTS", canonicalSlug: "pots", displayName: "Pots & Planters", taxPercentage: 18, isTaxInclusive: false },
  planter: { taxCategory: "POTS", canonicalSlug: "pots", displayName: "Pots & Planters", taxPercentage: 18, isTaxInclusive: false },

  // 🪜 Stands & Shelves / Accessories -> 18% GST
  "stands-shelves": { taxCategory: "ACCESSORIES", canonicalSlug: "plant-stands-shelves", displayName: "Plant Stands & Shelves", taxPercentage: 18, isTaxInclusive: false },
  "plant-stands-shelves": { taxCategory: "ACCESSORIES", canonicalSlug: "plant-stands-shelves", displayName: "Plant Stands & Shelves", taxPercentage: 18, isTaxInclusive: false },
  "plant-stands-and-shelves": { taxCategory: "ACCESSORIES", canonicalSlug: "plant-stands-shelves", displayName: "Plant Stands & Shelves", taxPercentage: 18, isTaxInclusive: false },
  "plant-stands": { taxCategory: "ACCESSORIES", canonicalSlug: "plant-stands-shelves", displayName: "Plant Stands & Shelves", taxPercentage: 18, isTaxInclusive: false },
  stands: { taxCategory: "ACCESSORIES", canonicalSlug: "plant-stands-shelves", displayName: "Plant Stands & Shelves", taxPercentage: 18, isTaxInclusive: false },
  stand: { taxCategory: "ACCESSORIES", canonicalSlug: "plant-stands-shelves", displayName: "Plant Stands & Shelves", taxPercentage: 18, isTaxInclusive: false },
  shelves: { taxCategory: "ACCESSORIES", canonicalSlug: "plant-stands-shelves", displayName: "Plant Stands & Shelves", taxPercentage: 18, isTaxInclusive: false },
  shelf: { taxCategory: "ACCESSORIES", canonicalSlug: "plant-stands-shelves", displayName: "Plant Stands & Shelves", taxPercentage: 18, isTaxInclusive: false },
  accessories: { taxCategory: "ACCESSORIES", canonicalSlug: "accessories", displayName: "Accessories", taxPercentage: 18, isTaxInclusive: false },
  accessory: { taxCategory: "ACCESSORIES", canonicalSlug: "accessories", displayName: "Accessories", taxPercentage: 18, isTaxInclusive: false },

  // 🥀 Artificial & Dried Plants / Decor -> 18% GST
  "artificial-dried": { taxCategory: "DECOR", canonicalSlug: "artificial-dried", displayName: "Artificial & Dried Plants", taxPercentage: 18, isTaxInclusive: false },
  "artificial-dried-plants": { taxCategory: "DECOR", canonicalSlug: "artificial-dried", displayName: "Artificial & Dried Plants", taxPercentage: 18, isTaxInclusive: false },
  decor: { taxCategory: "DECOR", canonicalSlug: "artificial-dried", displayName: "Artificial & Dried Plants", taxPercentage: 18, isTaxInclusive: false },
  artificial: { taxCategory: "DECOR", canonicalSlug: "artificial-dried", displayName: "Artificial & Dried Plants", taxPercentage: 18, isTaxInclusive: false },
  dried: { taxCategory: "DECOR", canonicalSlug: "artificial-dried", displayName: "Artificial & Dried Plants", taxPercentage: 18, isTaxInclusive: false },
};

/**
 * Authoritative GST Tax Rate Resolver.
 * Given a raw category slug or model name, resolves the statutory GST percentage.
 * Unmatched or empty slugs NEVER default to 5% Plants; they safely fall back
 * to the standard 18% GST statutory rate matching Indian e-commerce GST regulations.
 */
export function getCategoryTaxRate(
  category?: string | null,
  customTaxMap?: Record<string, CategoryTaxConfig>
): number {
  const slug = normalizeCategorySlug(category);

  // 1. Check custom dynamic tax map from backend API if available
  if (customTaxMap) {
    if (slug && customTaxMap[slug]?.taxPercentage !== undefined) {
      return Number(customTaxMap[slug].taxPercentage);
    }
    if (category && customTaxMap[category]?.taxPercentage !== undefined) {
      return Number(customTaxMap[category].taxPercentage);
    }
  }

  // 2. Check canonical taxonomy mapping
  if (slug && TAX_CATEGORY_TAXONOMY[slug]) {
    return TAX_CATEGORY_TAXONOMY[slug].taxPercentage;
  }

  // 3. Fallback: Unrecognized, empty, or undefined slug -> 18% GST standard statutory rate
  if (slug) {
    if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
      console.warn(
        `[PricingTaxFallback] Unknown category slug "${slug}" (raw: "${category}"). Triggering statutory fallback 18% GST.`
      );
    }
  }

  return 18;
}

export const DEFAULT_CATEGORY_TAXES: Record<string, CategoryTaxConfig> = {
  // Canonical Slugs (SSOT alignment with backend productModel.ts)
  plants: { taxPercentage: 5, isTaxInclusive: false },
  pots: { taxPercentage: 18, isTaxInclusive: false },
  "pots-planters": { taxPercentage: 18, isTaxInclusive: false },
  accessories: { taxPercentage: 18, isTaxInclusive: false },
  "gardening-tools": { taxPercentage: 18, isTaxInclusive: false },
  "plant-care": { taxPercentage: 18, isTaxInclusive: false },
  "seeds-bulbs": { taxPercentage: 0, isTaxInclusive: false },
  "stands-shelves": { taxPercentage: 18, isTaxInclusive: false },
  "artificial-dried": { taxPercentage: 18, isTaxInclusive: false },

  // Taxonomy Aliases
  "live-plants": { taxPercentage: 5, isTaxInclusive: false },
  tools: { taxPercentage: 18, isTaxInclusive: false },
  fertilizers: { taxPercentage: 18, isTaxInclusive: false },
  seeds: { taxPercentage: 0, isTaxInclusive: false },
  planters: { taxPercentage: 18, isTaxInclusive: false },
  "plant-stands-shelves": { taxPercentage: 18, isTaxInclusive: false },
  decor: { taxPercentage: 18, isTaxInclusive: false },

  // Display Names (Title Case)
  Plants: { taxPercentage: 5, isTaxInclusive: false },
  Pots: { taxPercentage: 18, isTaxInclusive: false },
  "Pots & Planters": { taxPercentage: 18, isTaxInclusive: false },
  Accessories: { taxPercentage: 18, isTaxInclusive: false },
  "Gardening Tools": { taxPercentage: 18, isTaxInclusive: false },
  "Plant Care": { taxPercentage: 18, isTaxInclusive: false },
  "Seeds & Bulbs": { taxPercentage: 0, isTaxInclusive: false },
  "Plant Stands": { taxPercentage: 18, isTaxInclusive: false },
  "Plant Stands & Shelves": { taxPercentage: 18, isTaxInclusive: false },
  "Artificial & Dried Plants": { taxPercentage: 18, isTaxInclusive: false },

  // Model Aliases (PascalCase Mongoose models)
  Plant: { taxPercentage: 5, isTaxInclusive: false },
  Pot: { taxPercentage: 18, isTaxInclusive: false },
  Accessory: { taxPercentage: 18, isTaxInclusive: false },
  GardeningTool: { taxPercentage: 18, isTaxInclusive: false },
  Tool: { taxPercentage: 18, isTaxInclusive: false },
  PlantCare: { taxPercentage: 18, isTaxInclusive: false },
  SeedsBulbs: { taxPercentage: 0, isTaxInclusive: false },
  PlantStandsShelves: { taxPercentage: 18, isTaxInclusive: false },
  PlantStand: { taxPercentage: 18, isTaxInclusive: false },
  ArtificialDriedPlant: { taxPercentage: 18, isTaxInclusive: false },
  ArtificialPlant: { taxPercentage: 18, isTaxInclusive: false },
};

export const toPaise = (rupees: number): number => {
  return Math.round(Number(rupees || 0) * 100);
};

export const toRupees = (paise: number): number => {
  return Math.round(Number(paise || 0)) / 100;
};

export const roundMoney = (rupees: number): number => {
  return toRupees(toPaise(rupees));
};

export const getEffectivePrice = (
  originalPrice: number,
  discountPrice?: number | null
): number => {
  const orig = Number(originalPrice) || 0;
  const disc = Number(discountPrice);
  if (!isNaN(disc) && disc > 0 && disc < orig) {
    return roundMoney(disc);
  }
  return roundMoney(orig);
};

/**
 * Calculates tax in paise for a single line item
 */
export const calculateItemTax = (
  effectivePriceRupees: number,
  quantity: number,
  taxConfig: CategoryTaxConfig = { taxPercentage: 18, isTaxInclusive: false }
): { taxPaise: number; isTaxInclusive: boolean; rate: number } => {
  const rate = Math.max(0, Number(taxConfig.taxPercentage) || 0);
  const isTaxInclusive = Boolean(taxConfig.isTaxInclusive);
  const lineGrossPaise = toPaise(effectivePriceRupees) * Math.max(1, quantity);

  if (rate === 0) {
    return { taxPaise: 0, isTaxInclusive, rate: 0 };
  }

  let taxPaise = 0;
  if (isTaxInclusive) {
    taxPaise = Math.round(lineGrossPaise * (rate / (100 + rate)));
  } else {
    taxPaise = Math.round(lineGrossPaise * (rate / 100));
  }

  return { taxPaise, isTaxInclusive, rate };
};

export const calculateShippingAndTax = (
  subtotalRupees: number
): { shipping: number; tax: number } => {
  const subtotalPaise = toPaise(subtotalRupees);

  // Free shipping threshold: ₹500 (50,000 paise)
  const shippingPaise = subtotalPaise >= 50000 || subtotalPaise === 0 ? 0 : 5000;

  // 18% GST standard alignment fallback
  const taxPaise = Math.round(subtotalPaise * 0.18);

  return {
    shipping: toRupees(shippingPaise),
    tax: toRupees(taxPaise),
  };
};

export interface CartCalculationResult {
  itemsCount: number;
  originalTotal: number; // MRP subtotal
  discountAmount: number; // Total savings
  subtotal: number; // Effective items price
  shipping: number; // Delivery fee
  tax: number; // Total GST
  grandTotal: number; // Final payable amount
  hasSavings: boolean;
  savingsPercent: number;
  categoryTaxBreakdown: CategoryTaxSummary[];
}

export const calculateCartTotals = (
  items: Array<{
    product?: {
      price: number;
      discountPrice?: number | null;
      category?: string;
      itemModel?: string;
    } | null;
    category?: string;
    itemModel?: string;
    quantity: number;
  }>,
  customTaxMap?: Record<string, CategoryTaxConfig>
): CartCalculationResult => {
  let itemsCount = 0;
  let originalTotalPaise = 0;
  let subtotalPaise = 0;
  let exclusiveTaxPaise = 0;

  const breakdownMap: Record<
    string,
    { rate: number; taxablePaise: number; taxPaise: number; isInclusive: boolean }
  > = {};

  const activeTaxMap = customTaxMap || DEFAULT_CATEGORY_TAXES;

  for (const item of items) {
    if (!item?.product) continue;
    const qty = Math.max(1, Number(item.quantity) || 1);
    const origPrice = Number(item.product.price) || 0;
    const effPrice = getEffectivePrice(origPrice, item.product.discountPrice);

    itemsCount += qty;
    const itemOriginalPaise = toPaise(origPrice) * qty;
    const itemSubtotalPaise = toPaise(effPrice) * qty;

    originalTotalPaise += itemOriginalPaise;
    subtotalPaise += itemSubtotalPaise;

    // Resolve Category for Tax using exact normalized slug & statutory rate resolver
    const rawIdentifier =
      item.product.category ||
      item.category ||
      item.product.itemModel ||
      item.itemModel ||
      "";

    const normalizedSlug = normalizeCategorySlug(rawIdentifier);
    const taxRate = getCategoryTaxRate(rawIdentifier, activeTaxMap);
    const taxonomyMeta = TAX_CATEGORY_TAXONOMY[normalizedSlug];

    const taxConfig: CategoryTaxConfig = {
      taxPercentage: taxRate,
      isTaxInclusive: false,
    };

    const itemTax = calculateItemTax(effPrice, qty, taxConfig);

    if (!itemTax.isTaxInclusive) {
      exclusiveTaxPaise += itemTax.taxPaise;
    }

    // Accumulate category-wise breakdown using user-friendly Title Case name
    const groupKey = taxonomyMeta?.displayName || rawIdentifier || "General";
    if (!breakdownMap[groupKey]) {
      breakdownMap[groupKey] = {
        rate: itemTax.rate,
        taxablePaise: 0,
        taxPaise: 0,
        isInclusive: itemTax.isTaxInclusive,
      };
    }
    breakdownMap[groupKey].taxablePaise += itemSubtotalPaise;
    breakdownMap[groupKey].taxPaise += itemTax.taxPaise;
  }

  const originalTotal = toRupees(originalTotalPaise);
  const subtotal = toRupees(subtotalPaise);
  const discountAmount = Math.max(0, toRupees(originalTotalPaise - subtotalPaise));

  // Free shipping threshold: ₹500 (50,000 paise)
  const shippingPaise = subtotalPaise >= 50000 || subtotalPaise === 0 ? 0 : 5000;
  const shipping = toRupees(shippingPaise);

  const tax = toRupees(exclusiveTaxPaise);
  const grandTotalPaise = subtotalPaise + shippingPaise + exclusiveTaxPaise;
  const grandTotal = toRupees(grandTotalPaise);

  const hasSavings = discountAmount > 0;
  const savingsPercent =
    originalTotal > 0 ? Math.round((discountAmount / originalTotal) * 100) : 0;

  const categoryTaxBreakdown: CategoryTaxSummary[] = Object.entries(breakdownMap).map(
    ([category, data]) => ({
      category,
      taxRatePercentage: data.rate,
      taxableAmount: toRupees(data.taxablePaise),
      taxAmount: toRupees(data.taxPaise),
      isTaxInclusive: data.isInclusive,
    })
  );

  return {
    itemsCount,
    originalTotal,
    discountAmount,
    subtotal,
    shipping,
    tax,
    grandTotal,
    hasSavings,
    savingsPercent,
    categoryTaxBreakdown,
  };
};

export const formatCurrencyINR = (amount: number): string => {
  return `₹${(Number(amount) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};
