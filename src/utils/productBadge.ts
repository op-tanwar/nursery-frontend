/**
 * Product Badge Qualification Utility
 *
 * Deterministic badge and tag qualification logic for e-commerce product cards.
 * Ensures "Bestseller" and other contextual badges render strictly when verified
 * by database flags, sales criteria, or rating thresholds.
 */

export interface BadgeQualificationData {
  isBestSeller?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  tags?: string[] | string;
  totalSales?: number;
  salesCount?: number;
  rating?: number;
  ratings?: number;
  reviews?: number | any[];
  reviewsCount?: number;
  numOfReviews?: number;
  price?: number;
  originalPrice?: number | null;
  discountPrice?: number;
  stock?: number;
  createdAt?: string;
  tag?: string | null;
  [key: string]: any;
}

/**
 * Checks whether a product genuinely qualifies for the "Bestseller" badge.
 * Criteria:
 * 1. Explicit database boolean flag (`isBestSeller` or `isBestseller`)
 * 2. Explicit bestseller tag in product tags array or comma-delimited string
 * 3. Verified sales threshold (totalSales >= 50 or salesCount >= 50)
 * 4. Verified high satisfaction volume (ratings >= 4.8 AND reviews >= 20)
 */
export function isExplicitBestseller(product?: BadgeQualificationData | null): boolean {
  if (!product) return false;

  // 1. Explicit boolean flag
  if (product.isBestSeller === true || product.isBestseller === true) {
    return true;
  }

  // 2. Explicit tag within tags collection
  if (Array.isArray(product.tags)) {
    if (product.tags.some((t) => typeof t === "string" && t.trim().toLowerCase() === "bestseller")) {
      return true;
    }
  } else if (typeof product.tags === "string" && product.tags.trim() !== "") {
    const parsedTags = product.tags.toLowerCase().split(",").map((s) => s.trim());
    if (parsedTags.includes("bestseller")) {
      return true;
    }
  }

  // 3. Verified sales count threshold
  const sales = product.totalSales ?? product.salesCount;
  if (typeof sales === "number" && sales >= 50) {
    return true;
  }

  // 4. Verified rating & review count threshold
  const ratingValue = product.ratings ?? product.rating;
  const reviewCount =
    product.reviewsCount ??
    product.numOfReviews ??
    (Array.isArray(product.reviews)
      ? product.reviews.length
      : typeof product.reviews === "number"
      ? product.reviews
      : 0);

  if (
    typeof ratingValue === "number" &&
    ratingValue >= 4.8 &&
    typeof reviewCount === "number" &&
    reviewCount >= 20
  ) {
    return true;
  }

  return false;
}

/**
 * Resolves discount percentage if product has a genuine active discount.
 */
export function getProductDiscountPercent(product?: BadgeQualificationData | null): number {
  if (!product) return 0;

  // Standard ShopItemType representation: originalPrice is strike-through, price is selling price
  if (
    typeof product.originalPrice === "number" &&
    typeof product.price === "number" &&
    product.originalPrice > product.price &&
    product.originalPrice > 0
  ) {
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }

  // Raw API representation: price is base price, discountPrice is lower promotional price
  if (
    typeof product.discountPrice === "number" &&
    typeof product.price === "number" &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price &&
    product.price > 0
  ) {
    return Math.round(((product.price - product.discountPrice) / product.price) * 100);
  }

  return 0;
}

/**
 * Checks whether a product qualifies as a new arrival (flag or created within 14 days).
 */
export function isProductNewArrival(product?: BadgeQualificationData | null): boolean {
  if (!product) return false;
  if (product.isNewArrival === true || (product as any).isNew === true) return true;
  if (product.tag === "New" || product.tag === "New Arrival") return true;

  if (product.createdAt) {
    const createdTime = new Date(product.createdAt).getTime();
    if (!isNaN(createdTime)) {
      const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
      if (Date.now() - createdTime <= fourteenDaysMs) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks whether a product has limited remaining stock (1 to 5 units).
 */
export function isProductLimitedStock(product?: BadgeQualificationData | null): boolean {
  if (!product) return false;
  if (product.tag === "Limited") return true;
  if (typeof product.stock === "number" && product.stock <= 5 && product.stock > 0) {
    return true;
  }
  return false;
}

/**
 * Safely computes the appropriate deterministic contextual tag string for a product.
 * Returns null if no badge should render.
 */
export function determineProductTag(product?: BadgeQualificationData | null): string | null {
  if (!product) return null;

  if (isExplicitBestseller(product)) {
    return "Bestseller";
  }

  if (isProductLimitedStock(product)) {
    return "Limited";
  }

  const discountPercent = getProductDiscountPercent(product);
  if (discountPercent >= 10) {
    return "Sale";
  }

  if (isProductNewArrival(product)) {
    return "New Arrival";
  }

  // Preserve explicit custom contextual tags if they exist and aren't legacy blanket tags
  if (product.tag && product.tag !== "Bestseller" && product.tag !== "Limited") {
    return product.tag;
  }

  return null;
}
