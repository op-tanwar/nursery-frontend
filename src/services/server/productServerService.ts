/**
 * Server-side product resolver for the PDP (Product Detail Page).
 * Backed by resilient server-api engine with React.cache() deduplication and Next.js ISR.
 */

import { cache } from "react";
import {
  getProductDetailServer,
  type ShopUrlType,
  TYPE_LABELS,
  FALLBACK_EMOJI,
} from "@/lib/server-api";

export type { ShopUrlType } from "@/lib/server-api";
export { TYPE_LABELS, FALLBACK_EMOJI } from "@/lib/server-api";

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
 * Deduplicated via React.cache().
 */
export const resolveProductServer = cache(async function resolveProductServer(
  shopType: ShopUrlType,
  slug: string
): Promise<ServerProductData | null> {
  const result = await getProductDetailServer(shopType, slug);
  return result.product;
});
