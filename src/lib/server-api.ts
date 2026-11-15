/**
 * 🚀 Urban Nursery High-Performance Server-Side API Engine
 * Resilient Server Component (RSC) & ISR Data Fetching Layer
 *
 * Implements:
 * - Cold-start tolerant fetch wrapper with exponential backoff retries & timeouts
 * - Active nursery defense-in-depth verification (zero suspended vendor leaks)
 * - Polymorphic 8-category mapping to standardized ShopItemType
 * - React.cache() deduplication for zero-waterfall metadata & RSC data fetching
 */

import { cache } from "react";
import { ShopItemType } from "@/components/customer/common/ShopItemCard";
import { determineProductTag } from "@/utils/productBadge";

export type ShopUrlType =
  | "plants"
  | "pots"
  | "accessories"
  | "gardening-tools"
  | "plant-care"
  | "seeds-bulbs"
  | "plant-stands-shelves"
  | "artificial-dried-plants";

import type { ServerProductData } from "@/services/server/productServerService";

// ─── API Base URL Resolution ──────────────────────────────────────────────────
export const API_BASE_URL = (() => {
  const resolved =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "https://nursery-backend-2rg3.onrender.com/api/v1";
  return resolved.replace(/\/+$/, "");
})();

// ─── Standard RSC Request Headers ─────────────────────────────────────────────
const SERVER_FETCH_HEADERS: HeadersInit = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "UrbanNursery-RSC/2.0 (NextJS-AppRouter)",
};

// ─── Category Types & Normalization ───────────────────────────────────────────
export const VALID_SHOP_TYPES: ShopUrlType[] = [
  "plants",
  "pots",
  "accessories",
  "gardening-tools",
  "plant-care",
  "seeds-bulbs",
  "plant-stands-shelves",
  "artificial-dried-plants",
];

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

export const URL_TYPE_TO_CATEGORY: Record<string, string | undefined> = {
  All: undefined,
  all: undefined,
  Plants: "plants",
  plants: "plants",
  Pots: "pots",
  pots: "pots",
  Accessories: "accessories",
  accessories: "accessories",
  "Gardening Tools": "gardening-tools",
  "gardening-tools": "gardening-tools",
  "Plant Care": "plant-care",
  "plant-care": "plant-care",
  "Seeds & Bulbs": "seeds-bulbs",
  "seeds-bulbs": "seeds-bulbs",
  "Plant Stands": "plant-stands-shelves",
  "plant-stands-shelves": "plant-stands-shelves",
  "stands-shelves": "plant-stands-shelves",
  "Artificial & Dried Plants": "artificial-dried",
  "artificial-dried-plants": "artificial-dried",
  "artificial-dried": "artificial-dried",
};

export const CATEGORY_TO_URL_TYPE: Record<string, ShopUrlType> = {
  plants: "plants",
  pots: "pots",
  "pots-planters": "pots",
  accessories: "accessories",
  "gardening-tools": "gardening-tools",
  "plant-care": "plant-care",
  "seeds-bulbs": "seeds-bulbs",
  "plant-stands-shelves": "plant-stands-shelves",
  "stands-shelves": "plant-stands-shelves",
  "artificial-dried": "artificial-dried-plants",
  "artificial-dried-plants": "artificial-dried-plants",
};

export const FALLBACK_EMOJI: Record<ShopUrlType, string> = {
  plants: "🌿",
  pots: "🏺",
  accessories: "🛠️",
  "gardening-tools": "🔧",
  "plant-care": "🧪",
  "seeds-bulbs": "🌱",
  "plant-stands-shelves": "🪜",
  "artificial-dried-plants": "🌵",
};

// ─── Resilient Fetch with Retry & Timeout ──────────────────────────────────────
export interface FetchServerOptions {
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
  timeoutMs?: number;
  retries?: number;
  headers?: HeadersInit;
}

export interface FetchResult<T> {
  data: T | null;
  status: number;
  ok: boolean;
  error?: string;
}

export async function fetchWithRetry<T>(
  endpoint: string,
  options: FetchServerOptions = {}
): Promise<FetchResult<T>> {
  const {
    cache: cacheMode = "no-store",
    revalidate,
    tags,
    timeoutMs = 12000,
    retries = 2,
    headers = {},
  } = options;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const fetchOptions: RequestInit = {
    headers: {
      ...SERVER_FETCH_HEADERS,
      ...headers,
    },
    ...(revalidate !== undefined
      ? { next: { revalidate, ...(tags ? { tags } : {}) } }
      : { cache: cacheMode }),
  };

  let lastError: any = null;
  let lastStatus = 0;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (attempt > 0) {
        // Exponential backoff: 400ms, 1200ms
        const backoff = 400 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }

      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timer);
      lastStatus = res.status;

      // Definite 404: product or resource doesn't exist / suspended
      if (res.status === 404) {
        return { data: null, status: 404, ok: false };
      }

      // Retryable 5xx gateway/cold-start errors (e.g. Render waking up)
      if ([502, 503, 504].includes(res.status) && attempt < retries) {
        lastError = new Error(`HTTP ${res.status} gateway error from ${url}`);
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text().catch(() => "(unreadable)");
        return {
          data: null,
          status: res.status,
          ok: false,
          error: errorText.slice(0, 300),
        };
      }

      const data = await res.json();
      return { data, status: res.status, ok: true };
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;

      // AbortError or connection drop on cold start -> retry if attempts remain
      if (attempt < retries) {
        continue;
      }
    }
  }

  return {
    data: null,
    status: lastStatus || 500,
    ok: false,
    error: lastError?.message || "Server request failed after retries.",
  };
}

// ─── Polymorphic Product to ShopItemType Mapper ────────────────────────────────
export function mapRawProductToShopItem(product: any): ShopItemType {
  const nurseryObj = typeof product.nursery === "object" ? product.nursery : null;
  const vendorObj = typeof product.vendor === "object" ? product.vendor : null;

  const nurseryName =
    product.vendorName ||
    nurseryObj?.businessName ||
    nurseryObj?.name ||
    vendorObj?.businessName ||
    vendorObj?.name ||
    product.businessName ||
    (typeof product.vendor === "string" ? product.vendor : null) ||
    (typeof product.nursery === "string" ? product.nursery : null) ||
    "Urban Nursery";

  const nurseryLoc =
    nurseryObj?.businessAddress?.city ||
    nurseryObj?.location ||
    nurseryObj?.city ||
    vendorObj?.location ||
    vendorObj?.city ||
    product.city ||
    "Indore";

  const vendorId =
    product.vendorId ||
    nurseryObj?._id ||
    nurseryObj?.id ||
    vendorObj?._id ||
    vendorObj?.id ||
    (typeof product.nursery === "string" ? product.nursery : undefined);

  const vendorSlug =
    product.vendorSlug ||
    nurseryObj?.slug ||
    vendorObj?.slug ||
    nurseryName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const nurseryUserId =
    product.nurseryId ||
    nurseryObj?.nurseryId ||
    vendorObj?.nurseryId ||
    (typeof product.nursery === "string" ? product.nursery : undefined);

  const rawCategory = product.category || "plants";
  const determinedType: ShopUrlType =
    CATEGORY_TO_URL_TYPE[rawCategory] || "plants";

  const calculatedStock = product.stock ?? 0;
  const generatedSlug =
    product.slug ||
    (product.name
      ? product.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")
      : String(product._id || product.id));

  const hasDiscount =
    product.discountPrice > 0 && product.discountPrice < product.price;
  const effectivePrice = hasDiscount ? product.discountPrice : (product.price || 0);
  const effectiveOriginalPrice = hasDiscount ? (product.price || 0) : null;

  const badgeColor =
    determinedType === "plants"
      ? "#15803d"
      : determinedType === "pots"
        ? "#0369a1"
        : "#475569";

  return {
    id: String(product._id || product.id),
    _id: String(product._id || product.id),
    slug: generatedSlug,
    type: determinedType,
    category: product.category || "General",
    subCategory: product.attributes?.subCategory || product.subCategory,
    name: product.name || "Botanical Unit",
    vendor: `${nurseryName}, ${nurseryLoc}`,
    vendorName: nurseryName,
    vendorId: vendorId ? String(vendorId) : undefined,
    vendorSlug: vendorSlug ? String(vendorSlug) : undefined,
    nurseryId: nurseryUserId ? String(nurseryUserId) : undefined,
    price: effectivePrice,
    originalPrice: effectiveOriginalPrice,
    rating: product.ratingsAverage || product.ratings || 4.5,
    reviews: product.ratingsQuantity || product.numOfReviews || 0,
    badge: calculatedStock > 0 ? (determinedType === "plants" ? "Fresh Stock" : "Available") : "Out of Stock",
    badgeColor: calculatedStock > 0 ? badgeColor : "#dc2626",
    tag: determineProductTag({
      ...product,
      stock: calculatedStock,
      ratings: product.ratingsAverage || product.ratings,
      reviewsCount: product.ratingsQuantity || product.numOfReviews,
    }),
    emoji:
      product.coverImage?.url ||
      product.images?.[0]?.url ||
      FALLBACK_EMOJI[determinedType],
    isBestSeller: product.isBestSeller ?? product.isBestseller,
    isBestseller: product.isBestseller ?? product.isBestSeller,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    totalSales: product.totalSales ?? product.salesCount ?? product.sold,
    salesCount: product.salesCount ?? product.totalSales ?? product.sold,
    tags: product.tags,
    stock: calculatedStock,
    ratings: product.ratingsAverage || product.ratings,
    reviewsCount: product.ratingsQuantity || product.numOfReviews,
    discountPrice: product.discountPrice,
    createdAt: product.createdAt,
  };
}

// ─── Query Parameters Interface for Shop Catalog ──────────────────────────────
export interface ShopServerQueryParams {
  type?: string;
  category?: string;
  subCategory?: string;
  search?: string;
  keyword?: string;
  sort?: string;
  page?: string | number;
  limit?: string | number;
  price?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  pincode?: string;
}

export interface ShopCatalogServerResult {
  products: ShopItemType[];
  rawProducts: any[];
  totalCount: number;
  filteredCount: number;
  page: number;
  totalPages: number;
  error?: string | null;
}

/**
 * 📦 Server-side product catalog fetcher for /shop and /shop/[type]
 * Features:
 * - Query parameter parsing & normalization
 * - Next.js ISR revalidation caching
 * - Suspended nursery elimination (zero leaks)
 * - Returns both UI-ready ShopItemType[] and raw products for Redux hydration
 */
export async function getShopProductsServer(
  params: ShopServerQueryParams = {}
): Promise<ShopCatalogServerResult> {
  const query = new URLSearchParams();

  // 1. Resolve category filter from either type or category param
  const rawType = params.type || "All";
  const mappedCategory = URL_TYPE_TO_CATEGORY[rawType] || URL_TYPE_TO_CATEGORY[params.category || ""] || params.category;
  if (mappedCategory && mappedCategory !== "all" && mappedCategory !== "All") {
    query.set("category", mappedCategory);
  }

  // 2. Search keyword
  const keyword = params.search?.trim() || params.keyword?.trim();
  if (keyword) {
    query.set("keyword", keyword);
  }

  // 3. Subcategory
  if (params.subCategory && params.subCategory !== "All") {
    query.set("subCategory", params.subCategory);
  }

  // 4. Pagination
  const pageNum = Math.max(1, Number(params.page) || 1);
  const limitNum = params.limit ? Number(params.limit) : rawType === "All" ? 48 : 12;
  query.set("page", String(pageNum));
  query.set("limit", String(limitNum));

  // 5. Price filtering
  if (params.minPrice !== undefined && params.minPrice !== "") {
    query.set("minPrice", String(params.minPrice));
  }
  if (params.maxPrice !== undefined && params.maxPrice !== "") {
    query.set("maxPrice", String(params.maxPrice));
  }

  // 6. Sorting
  if (params.sort) {
    query.set("sort", params.sort);
  }

  // 7. Pincode
  if (params.pincode) {
    query.set("pincode", params.pincode);
  }

  const endpoint = `/products?${query.toString()}`;
  const res = await fetchWithRetry<any>(endpoint, {
    revalidate: 60,
    tags: ["shop-catalog"],
    timeoutMs: 12000,
  });

  if (!res.ok || !res.data) {
    return {
      products: [],
      rawProducts: [],
      totalCount: 0,
      filteredCount: 0,
      page: pageNum,
      totalPages: 1,
      error: res.error || "Failed to fetch catalog products from server.",
    };
  }

  const payload = res.data;
  const rawList: any[] = Array.isArray(payload.products)
    ? payload.products
    : Array.isArray(payload.data?.products)
      ? payload.data.products
      : Array.isArray(payload.data)
        ? payload.data
        : [];

  // Defense-in-depth: exclude inactive/suspended nurseries
  const liveRawList = rawList.filter(
    (p) => p.isNurseryActive !== false && p.isPublished !== false && p.isActive !== false
  );

  const mappedProducts = liveRawList.map(mapRawProductToShopItem);
  const totalCount = payload.totalCount ?? liveRawList.length;
  const filteredCount = payload.filteredCount ?? liveRawList.length;
  const totalPages = Math.ceil(filteredCount / limitNum) || 1;

  return {
    products: mappedProducts,
    rawProducts: liveRawList,
    totalCount,
    filteredCount,
    page: pageNum,
    totalPages,
  };
}

/**
 * 🌿 Single Product Server Resolver for PDP
 * Deduplicated via React.cache() so metadata and page component share 1 request.
 */
export const getProductDetailServer = cache(async function getProductDetailServer(
  shopType: ShopUrlType,
  slug: string
): Promise<{ product: ServerProductData | null; notFound: boolean }> {
  if (!slug || !shopType || !VALID_SHOP_TYPES.includes(shopType)) {
    return { product: null, notFound: true };
  }

  const endpoint = `/products/${encodeURIComponent(slug)}`;
  const res = await fetchWithRetry<any>(endpoint, {
    revalidate: 60,
    tags: [`product-${shopType}-${slug}`],
    timeoutMs: 10000,
  });

  if (res.status === 404) {
    return { product: null, notFound: true };
  }

  if (!res.ok || !res.data) {
    return { product: null, notFound: false };
  }

  const raw = res.data.product || (res.data._id || res.data.name ? res.data : null);
  if (!raw) {
    return { product: null, notFound: true };
  }

  // Active nursery verification
  if (raw.isNurseryActive === false || raw.isPublished === false || raw.isActive === false) {
    return { product: null, notFound: true };
  }

  const attrs = raw.attributes || {};
  const nurseryObj = typeof raw.nursery === "object" ? raw.nursery : null;
  const vendorObj = typeof raw.vendor === "object" ? raw.vendor : null;

  const nurseryName =
    nurseryObj?.businessName ||
    nurseryObj?.name ||
    vendorObj?.businessName ||
    vendorObj?.name ||
    raw.businessName ||
    (typeof raw.vendor === "string" ? raw.vendor : null) ||
    "Certified Nursery";

  const nurseryLoc =
    nurseryObj?.businessAddress?.city ||
    nurseryObj?.location ||
    vendorObj?.location ||
    raw.city ||
    "Indore";

  const vendorId =
    raw.vendorId ||
    nurseryObj?._id ||
    vendorObj?._id ||
    (typeof raw.nursery === "string" ? raw.nursery : undefined);

  const vendorSlug =
    raw.vendorSlug ||
    nurseryObj?.slug ||
    vendorObj?.slug ||
    nurseryName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

  const nurseryUserId =
    raw.nurseryId ||
    nurseryObj?.nurseryId ||
    vendorObj?.nurseryId ||
    (typeof raw.nursery === "string" ? raw.nursery : undefined);

  const formTypeMatch = raw.description?.match(/Form:\s*([^|\n]+)/i)?.[1]?.trim();
  const isOrganicDerived =
    raw.isOrganic !== undefined
      ? raw.isOrganic
      : raw.description?.includes("Organic") || raw.name?.toLowerCase().includes("organic")
        ? true
        : undefined;
  const maxLoadMatch = raw.description?.match(/Max weight capacity:\s*([^\n]+)/i)?.[1]?.trim();

  const productData: ServerProductData = {
    id: raw._id || raw.id || slug,
    slug: raw.slug || slug,
    type: TYPE_LABELS[shopType],
    shopType,
    category: raw.category || "Standard Tier",
    name: raw.name || "Botanical Unit",
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
    careInstructions: toStringArray(raw.careInstructions || attrs.careInstructions || raw.howToUse || attrs.howToUse),
    benefits: toStringArray(raw.benefits || attrs.benefits || raw.features || attrs.features),
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

    // Specification attributes
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
    howToUse: toStringArray(raw.howToUse || attrs.howToUse),
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

  return { product: productData, notFound: false };
});

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

/**
 * 🔄 Related Products Server Fetcher for PDP
 */
export async function getRelatedProductsServer(
  shopType: string,
  currentIdOrSlug: string,
  limit = 4
): Promise<any[]> {
  try {
    const category = URL_TYPE_TO_CATEGORY[shopType] || shopType;
    const res = await fetchWithRetry<any>(`/products?category=${category}&limit=${limit + 2}`, {
      revalidate: 120,
      tags: [`related-${shopType}`],
      timeoutMs: 8000,
    });

    if (!res.ok || !res.data) return [];

    const products = Array.isArray(res.data.products)
      ? res.data.products
      : Array.isArray(res.data.data)
        ? res.data.data
        : [];

    return products
      .filter(
        (p: any) =>
          p.isNurseryActive !== false &&
          p.isPublished !== false &&
          (p._id !== currentIdOrSlug && p.slug !== currentIdOrSlug && p.id !== currentIdOrSlug)
      )
      .slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * 🛒 Cross-Sell Products Server Fetcher for PDP
 */
export async function getCrossSellProductsServer(
  currentIdOrSlug: string,
  limit = 3
): Promise<any[]> {
  try {
    const res = await fetchWithRetry<any>(`/products?limit=${limit + 2}`, {
      revalidate: 120,
      tags: ["cross-sell-products"],
      timeoutMs: 8000,
    });

    if (!res.ok || !res.data) return [];

    const products = Array.isArray(res.data.products)
      ? res.data.products
      : Array.isArray(res.data.data)
        ? res.data.data
        : [];

    return products
      .filter(
        (p: any) =>
          p.isNurseryActive !== false &&
          p.isPublished !== false &&
          (p._id !== currentIdOrSlug && p.slug !== currentIdOrSlug && p.id !== currentIdOrSlug)
      )
      .slice(0, limit);
  } catch {
    return [];
  }
}
