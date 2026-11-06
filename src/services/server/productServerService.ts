/**
 * Server-side product resolver for the PDP (Product Detail Page).
 * Uses native fetch() with Next.js ISR caching against the unified Product API.
 */

import { cache } from "react";
import { determineProductTag } from "@/utils/productBadge";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://nursery-backend-2rg3.onrender.com/api/v1";

export type ShopUrlType =
  | "plants"
  | "pots"
  | "accessories"
  | "gardening-tools"
  | "plant-care"
  | "seeds-bulbs"
  | "plant-stands-shelves"
  | "artificial-dried-plants";

export const TYPE_LABELS: Record<ShopUrlType, string> = {
  plants: "Plants",
  pots: "Pots",
  accessories: "Accessories",
  "gardening-tools": "Gardening Tools",
  "plant-care": "Plant Care",
  "seeds-bulbs": "Seeds & Bulbs",
  "plant-stands-shelves": "Plant Stands",
  "artificial-dried-plants": "Artificial & Dried Plants",
};

export const FALLBACK_EMOJI: Record<ShopUrlType, string> = {
  plants: "🌿",
  pots: "🏺",
  accessories: "🛠️",
  "gardening-tools": "🔧",
  "plant-care": "🧪",
  "seeds-bulbs": "🌱",
  "plant-stands-shelves": "🪜",
  "artificial-dried-plants": "🥀",
};

function extractRawProduct(data: any): any {
  if (!data) return null;
  if (data.product) return data.product;
  if (data._id || data.name) return data;
  return null;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function extractCareInstructions(raw: any, attrs: any = {}): string[] {
  const candidates = [
    raw.careInstructions, attrs.careInstructions, raw.howToUse, attrs.howToUse,
    raw.dosageInstructions, raw.tips, raw.sowingSteps, raw.assemblyInstructions, raw.features,
  ];
  for (const c of candidates) {
    const arr = toStringArray(c);
    if (arr.length) return arr;
  }
  if (raw.shortDescription) return [String(raw.shortDescription)];
  if (raw.description) return [String(raw.description).slice(0, 240)];
  return ["See product description for usage details."];
}

function extractBenefits(raw: any, attrs: any = {}): string[] {
  const candidates = [raw.benefits, attrs.benefits, raw.features, attrs.features, raw.ingredients];
  for (const c of candidates) {
    const arr = toStringArray(c);
    if (arr.length) return arr;
  }
  const bits: string[] = [];
  if (attrs.sowingSeason || raw.sowingSeason) bits.push(`Sowing season: ${attrs.sowingSeason || raw.sowingSeason}`);
  if (attrs.material || raw.material) bits.push(`Material: ${attrs.material || raw.material}`);
  if (attrs.composition || raw.composition) bits.push(`Composition: ${attrs.composition || raw.composition}`);
  if (attrs.formType || raw.formType) bits.push(`Form: ${attrs.formType || raw.formType}`);
  if (bits.length) return bits;
  return ["Premium quality marketplace selection."];
}

export interface ServerProductData {
  id: string;
  slug: string;
  type: string;
  shopType: ShopUrlType;
  category: string;
  name: string;
  vendor: string;
  vendorId?: string;
  vendorSlug?: string;
  nurseryId?: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  badge: string;
  badgeColor: string;
  tag: string | null;
  emoji: string;
  description: string;
  descriptionOption?: { short: string; points: string[] };
  careInstructions: string[];
  benefits: string[];
  galleryImages: string[];
  verifiedReviews: {
    author: string;
    rating: number;
    date: string;
    comment: string;
    verified: boolean;
  }[];
  // Raw for metadata
  metaTitle?: string;
  metaDescription?: string;

  // Category-specific specifications
  stock?: number;
  lightRequirement?: string;
  wateringSchedule?: string;
  maintenanceLevel?: string;
  isPetFriendly?: boolean;
  material?: string;
  color?: string | string[];
  dimensions?: any;
  hasDrainageHole?: boolean;
  shape?: string;
  isIndoorOutdoor?: string;
  includesSaucer?: boolean;
  handleMaterial?: string;
  warrantyMonths?: number;
  howToUse?: string[];
  composition?: string;
  volumeOrWeight?: string;
  formType?: string;
  isOrganic?: boolean;
  sowingSeason?: string[] | string;
  germinationTime?: string;
  quantityPerPack?: string;
  tierCount?: number;
  maxLoadCapacity?: string | number;
  specifications?: Record<string, any>;
  rawSpecifications?: Record<string, any>;
  isBestSeller?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  totalSales?: number;
  salesCount?: number;
  tags?: string[] | string;
  discountPrice?: number;
  createdAt?: string;
}

/**
 * Fetches and transforms a product by slug on the server using unified /products endpoint.
 */
export const resolveProductServer = cache(async function resolveProductServer(
  shopType: ShopUrlType,
  slug: string
): Promise<ServerProductData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60, tags: [`product-${shopType}-${slug}`] },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data = await res.json();
    const raw = extractRawProduct(data);
    if (!raw) return null;

    const attrs = raw.attributes || {};
    const nurseryObj = typeof raw.nursery === "object" ? raw.nursery : null;
    const vendorObj = typeof raw.vendor === "object" ? raw.vendor : null;

    const nurseryName =
      nurseryObj?.name || nurseryObj?.businessName ||
      vendorObj?.name || vendorObj?.businessName ||
      raw.businessName ||
      (typeof raw.vendor === "string" ? raw.vendor : null) ||
      "Certified Nursery";

    const nurseryLoc =
      nurseryObj?.location || nurseryObj?.businessAddress?.city ||
      vendorObj?.location || raw.city || "Indore";

    const vendorId =
      raw.vendorId || nurseryObj?._id || vendorObj?._id ||
      (typeof raw.nursery === "string" ? raw.nursery : undefined);

    const vendorSlug =
      raw.vendorSlug || nurseryObj?.slug || vendorObj?.slug ||
      nurseryName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

    const nurseryUserId =
      raw.nurseryId || nurseryObj?.nurseryId || vendorObj?.nurseryId ||
      (typeof raw.nursery === "string" ? raw.nursery : undefined);

    const formTypeMatch = raw.description?.match(/Form:\s*([^|\n]+)/i)?.[1]?.trim();
    const isOrganicDerived =
      raw.isOrganic !== undefined
        ? raw.isOrganic
        : raw.description?.includes("Organic") || raw.name?.toLowerCase().includes("organic")
          ? true
          : undefined;
    const maxLoadMatch = raw.description?.match(/Max weight capacity:\s*([^\n]+)/i)?.[1]?.trim();

    return {
      id: raw._id || raw.id || slug,
      slug: raw.slug || slug,
      type: TYPE_LABELS[shopType],
      shopType,
      category: raw.category || "Standard Tier",
      name: raw.name || "Ecosystem Dynamic Unit",
      vendor: `${nurseryName}, ${nurseryLoc}`,
      vendorId: vendorId ? String(vendorId) : undefined,
      vendorSlug: vendorSlug ? String(vendorSlug) : undefined,
      nurseryId: nurseryUserId ? String(nurseryUserId) : undefined,
      price:
        raw.discountPrice > 0 && raw.discountPrice < raw.price
          ? raw.discountPrice
          : raw.price || 0,
      originalPrice:
        raw.discountPrice > 0 && raw.discountPrice < raw.price
          ? raw.price || 0
          : null,
      rating: raw.ratingsAverage || raw.ratings || raw.rating || 4.5,
      reviews: raw.ratingsQuantity || raw.numOfReviews || raw.reviews?.length || 0,
      badge: (raw.stock ?? 0) > 0 ? "In Stock" : "Unavailable",
      badgeColor: (raw.stock ?? 0) > 0 ? "#15803d" : "#dc2626",
      tag: determineProductTag({
        ...raw,
        ratings: raw.ratingsAverage || raw.ratings || raw.rating,
        reviewsCount: raw.ratingsQuantity || raw.numOfReviews || raw.reviews?.length,
      }),
      emoji: raw.coverImage?.url || raw.images?.[0]?.url || FALLBACK_EMOJI[shopType],
      isBestSeller: raw.isBestSeller ?? raw.isBestseller,
      isBestseller: raw.isBestseller ?? raw.isBestSeller,
      isFeatured: raw.isFeatured,
      isNewArrival: raw.isNewArrival,
      totalSales: raw.totalSales ?? raw.salesCount,
      salesCount: raw.salesCount ?? raw.totalSales,
      tags: raw.tags,
      discountPrice: raw.discountPrice,
      description: raw.description || "No descriptions attached to this item.",
      descriptionOption: raw.descriptionOption || undefined,
      careInstructions: extractCareInstructions(raw, attrs),
      benefits: extractBenefits(raw, attrs),
      galleryImages:
        raw.images?.map((img: any) => (typeof img === "string" ? img : img.url)) ||
        [FALLBACK_EMOJI[shopType]],
      verifiedReviews:
        raw.reviews?.map((rev: any) => ({
          author: rev.name || "Anonymous",
          rating: rev.rating || 5,
          date: rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recent",
          comment: rev.comment || "No comment.",
          verified: Boolean(rev.isVerifiedBuyer ?? rev.verified),
        })) || [],
      metaTitle: raw.metaTitle,
      metaDescription: raw.metaDescription,

      // Specifications pass-through (reads from unified attributes or root)
      stock: raw.stock,
      lightRequirement: raw.lightRequirement || attrs.lightRequirement,
      wateringSchedule: raw.wateringSchedule || attrs.wateringSchedule,
      maintenanceLevel: raw.maintenanceLevel || attrs.maintenanceLevel,
      isPetFriendly: raw.isPetFriendly ?? attrs.isPetFriendly,
      material: raw.material || attrs.material || raw.specifications?.material,
      color: raw.color || attrs.color || raw.specifications?.color,
      dimensions: raw.dimensions || attrs.dimensions || raw.specifications?.dimensions,
      hasDrainageHole: raw.hasDrainageHole ?? attrs.drainageHoles,
      shape: raw.shape || attrs.shape,
      isIndoorOutdoor: raw.isIndoorOutdoor,
      includesSaucer: raw.includesSaucer,
      handleMaterial: raw.handleMaterial || attrs.handleMaterial,
      warrantyMonths: raw.warrantyMonths || attrs.warrantyMonths,
      howToUse: raw.howToUse || attrs.howToUse,
      composition: raw.composition || attrs.composition,
      volumeOrWeight: raw.volumeOrWeight || attrs.volumeOrWeight,
      formType: raw.formType || attrs.formType || formTypeMatch,
      isOrganic: isOrganicDerived,
      sowingSeason: raw.sowingSeason || attrs.sowingSeason,
      germinationTime: raw.germinationTime || attrs.germinationTime,
      quantityPerPack: raw.quantityPerPack || attrs.quantityPerPack,
      tierCount: raw.tierCount || attrs.tierCount,
      maxLoadCapacity: raw.maxLoadCapacity || attrs.maxLoadCapacity || maxLoadMatch,
      specifications: raw.specifications || attrs,
      rawSpecifications: raw,
    };
  } catch {
    return null;
  }
});
