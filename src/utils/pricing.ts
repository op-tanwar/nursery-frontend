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

export const DEFAULT_CATEGORY_TAXES: Record<string, CategoryTaxConfig> = {
  Plants: { taxPercentage: 5, isTaxInclusive: false },
  Pots: { taxPercentage: 12, isTaxInclusive: false },
  Accessories: { taxPercentage: 18, isTaxInclusive: false },
  "Gardening Tools": { taxPercentage: 18, isTaxInclusive: false },
  "Plant Care": { taxPercentage: 12, isTaxInclusive: false },
  "Seeds & Bulbs": { taxPercentage: 0, isTaxInclusive: false },
  "Plant Stands": { taxPercentage: 18, isTaxInclusive: false },
  "Artificial & Dried Plants": { taxPercentage: 18, isTaxInclusive: false },
  // Model aliases
  Plant: { taxPercentage: 5, isTaxInclusive: false },
  Pot: { taxPercentage: 12, isTaxInclusive: false },
  Accessory: { taxPercentage: 18, isTaxInclusive: false },
  Tool: { taxPercentage: 18, isTaxInclusive: false },
  PlantCare: { taxPercentage: 12, isTaxInclusive: false },
  SeedsBulbs: { taxPercentage: 0, isTaxInclusive: false },
  PlantStand: { taxPercentage: 18, isTaxInclusive: false },
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

    // Resolve Category for Tax
    const categoryKey =
      item.product.category ||
      item.category ||
      item.product.itemModel ||
      item.itemModel ||
      "Plants";

    const modelKey = item.product.itemModel || item.itemModel || "";

    // Lookup Tax Config
    let taxConfig =
      activeTaxMap[categoryKey] ||
      activeTaxMap[modelKey] ||
      activeTaxMap[categoryKey.toLowerCase()] ||
      activeTaxMap["Plants"] || { taxPercentage: 18, isTaxInclusive: false };

    // Case-insensitive lookup fallback
    if (!taxConfig) {
      const match = Object.keys(activeTaxMap).find(
        (k) => k.toLowerCase() === categoryKey.toLowerCase()
      );
      taxConfig = match ? activeTaxMap[match] : { taxPercentage: 18, isTaxInclusive: false };
    }

    const itemTax = calculateItemTax(effPrice, qty, taxConfig);

    if (!itemTax.isTaxInclusive) {
      exclusiveTaxPaise += itemTax.taxPaise;
    }

    // Accumulate category-wise breakdown
    const groupKey = categoryKey;
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
