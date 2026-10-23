import { ShopItemType } from "@/components/customer/common/ShopItemCard";
import { determineProductTag } from "@/utils/productBadge";

// ─── URL Resolution ────────────────────────────────────────────────────────
// NEXT_PUBLIC_API_URL is set in .env.local and in Vercel project env settings.
// Log the resolved base URL on every cold-start so it appears in Vercel
// function logs under: Vercel Dashboard → Project → Deployments → Functions.
const API_BASE_URL = (() => {
  const resolved =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "https://planto-backend-mpdo.onrender.com/api/v1";
  // Trim trailing slash so URL concat never produces double slashes
  const clean = resolved.replace(/\/+$/, "");
  console.log("[catalogServerService] Resolved API_BASE_URL:", clean);
  return clean;
})();

// ─── Standard request headers ─────────────────────────────────────────────
// Some hosting providers (including Render) reject requests without a
// recognisable User-Agent or Accept header from server-to-server callers.
const FETCH_HEADERS: HeadersInit = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "UrbanNursery-NextJS-RSC/1.0",
};

// ─── Timeout helper ────────────────────────────────────────────────────────
// Races at the Promise level — Next.js's internal fetch signal is untouched.
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// ─── Robust array extraction ───────────────────────────────────────────────
function extractArray(data: any, primaryKey: string): any[] {
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data[primaryKey]) && data[primaryKey].length > 0)
    return data[primaryKey];
  if (data.data) {
    if (Array.isArray(data.data[primaryKey]) && data.data[primaryKey].length > 0)
      return data.data[primaryKey];
    if (Array.isArray(data.data) && data.data.length > 0) return data.data;
  }
  for (const key of ["products", "items", "results", "docs"]) {
    if (Array.isArray(data[key]) && data[key].length > 0) return data[key];
  }
  return data[primaryKey] ?? [];
}

// ─── Core fetch helper ─────────────────────────────────────────────────────
// cache: "no-store" ensures every server render makes a FRESH request to the
// backend. This is correct for the homepage featured section because:
//   • ISR (revalidate: N) bakes whatever data existed at BUILD time — on
//     Vercel builds, the Render free-tier backend is cold and returns [] which
//     gets permanently cached until the next deploy.
//   • "no-store" shifts the freshness responsibility to Vercel's Edge Network /
//     CDN layer (handled by the surrounding Suspense + loading.tsx skeleton)
//     rather than Next.js's internal Data Cache.
//
// For routes where data staleness is acceptable (blog list, vendor profiles),
// callers can pass revalidate > 0 to override this to ISR behaviour.
async function fetchJson(
  url: string,
  cacheMode: RequestCache | null,
  revalidate?: number
): Promise<any> {
  const fetchOptions: RequestInit = {
    headers: FETCH_HEADERS,
    ...(revalidate !== undefined
      ? { next: { revalidate } }
      : { cache: cacheMode ?? "no-store" }),
  };

  console.log(`[catalogServerService] → GET ${url} (cache: ${revalidate !== undefined ? `revalidate:${revalidate}` : cacheMode})`);

  const res = await fetch(url, fetchOptions);

  console.log(`[catalogServerService] ← ${res.status} ${res.statusText} from ${url}`);

  if (!res.ok) {
    const body = await res.text().catch(() => "(unreadable)");
    console.error(
      `[catalogServerService] HTTP ${res.status} error from ${url}\nResponse body: ${body.slice(0, 600)}`
    );
    return null;
  }

  const data = await res.json();
  // Log top-level keys so any structure mismatch is immediately visible
  const keys = data && typeof data === "object" ? Object.keys(data) : typeof data;
  console.log(`[catalogServerService] Response keys from ${url}:`, keys);
  return data;
}

/**
 * Maps raw backend plant object into standardized ShopItemType
 */
export function mapRawPlantToShopItem(product: any): ShopItemType {
  const nurseryName =
    product.vendorName ||
    (typeof product.vendor === "string"
      ? product.vendor
      : product.vendor?.name || product.vendor?.businessName) ||
    product.businessName ||
    (typeof product.nursery === "string"
      ? product.nursery
      : product.nursery?.name || product.nursery?.businessName) ||
    "Urban Nursery";

  const nurseryLoc =
    (typeof product.vendor === "object"
      ? product.vendor?.location || product.vendor?.city
      : null) ||
    (typeof product.nursery === "object"
      ? product.nursery?.location || product.nursery?.city
      : null) ||
    product.city ||
    "Indore";

  const vendorId =
    product.vendorId ||
    (typeof product.vendor === "object"
      ? product.vendor?._id || product.vendor?.id
      : null) ||
    (typeof product.nursery === "object"
      ? product.nursery?._id || product.nursery?.id
      : null) ||
    (typeof product.nursery === "string" ? product.nursery : null);

  const vendorSlug =
    product.vendorSlug ||
    (typeof product.vendor === "object" ? product.vendor?.slug : null) ||
    (typeof product.nursery === "object" ? product.nursery?.slug : null) ||
    nurseryName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const nurseryUserId =
    product.nurseryId ||
    (typeof product.vendor === "object" ? product.vendor?.nurseryId : null) ||
    (typeof product.nursery === "object" ? product.nursery?.nurseryId : null) ||
    (typeof product.nursery === "string" ? product.nursery : undefined);

  const calculatedStock = product.stock ?? 0;
  const generatedSlug =
    product.slug ||
    product.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  return {
    id: product._id,
    slug: generatedSlug,
    type: "plants",
    category: product.category || "General",
    name: product.name,
    vendor: `${nurseryName}, ${nurseryLoc || "Indore"}`,
    vendorName: nurseryName,
    vendorId: vendorId ? String(vendorId) : undefined,
    vendorSlug: vendorSlug ? String(vendorSlug) : undefined,
    nurseryId: nurseryUserId ? String(nurseryUserId) : undefined,
    price:
      product.discountPrice > 0 && product.discountPrice < product.price
        ? product.discountPrice
        : product.price || 0,
    originalPrice:
      product.discountPrice > 0 && product.discountPrice < product.price
        ? product.price || 0
        : null,
    rating: product.ratings || 4.5,
    reviews: product.numOfReviews || 0,
    badge: product.category || "Fresh Stock",
    badgeColor: "#15803d",
    tag: determineProductTag({
      ...product,
      stock: calculatedStock,
      ratings: product.ratings,
      reviewsCount: product.numOfReviews,
    }),
    emoji: product.coverImage?.url || "🌿",
    isBestSeller: product.isBestSeller ?? product.isBestseller,
    isBestseller: product.isBestseller ?? product.isBestSeller,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    totalSales: product.totalSales ?? product.salesCount,
    salesCount: product.salesCount ?? product.totalSales,
    tags: product.tags,
    stock: calculatedStock,
    ratings: product.ratings,
    reviewsCount: product.numOfReviews,
    discountPrice: product.discountPrice,
    createdAt: product.createdAt,
  };
}

/**
 * Maps raw backend pot object into standardized ShopItemType
 */
export function mapRawPotToShopItem(product: any): ShopItemType {
  const nurseryName =
    product.vendorName ||
    (typeof product.vendor === "string"
      ? product.vendor
      : product.vendor?.name || product.vendor?.businessName) ||
    product.businessName ||
    (typeof product.nursery === "string"
      ? product.nursery
      : product.nursery?.name || product.nursery?.businessName) ||
    "Urban Nursery";

  const nurseryLoc =
    (typeof product.vendor === "object"
      ? product.vendor?.location || product.vendor?.city
      : null) ||
    (typeof product.nursery === "object"
      ? product.nursery?.location || product.nursery?.city
      : null) ||
    product.city ||
    "Indore";

  const vendorId =
    product.vendorId ||
    (typeof product.vendor === "object"
      ? product.vendor?._id || product.vendor?.id
      : null) ||
    (typeof product.nursery === "object"
      ? product.nursery?._id || product.nursery?.id
      : null) ||
    (typeof product.nursery === "string" ? product.nursery : null);

  const vendorSlug =
    product.vendorSlug ||
    (typeof product.vendor === "object" ? product.vendor?.slug : null) ||
    (typeof product.nursery === "object" ? product.nursery?.slug : null) ||
    nurseryName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const nurseryUserId =
    product.nurseryId ||
    (typeof product.vendor === "object" ? product.vendor?.nurseryId : null) ||
    (typeof product.nursery === "object" ? product.nursery?.nurseryId : null) ||
    (typeof product.nursery === "string" ? product.nursery : undefined);

  const calculatedStock = product.stock ?? 0;
  const generatedSlug =
    product.slug ||
    product.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  return {
    id: product._id,
    slug: generatedSlug,
    type: "pots",
    category: product.category || "General",
    name: product.name,
    vendor: `${nurseryName}, ${nurseryLoc || "Indore"}`,
    vendorName: nurseryName,
    vendorId: vendorId ? String(vendorId) : undefined,
    vendorSlug: vendorSlug ? String(vendorSlug) : undefined,
    nurseryId: nurseryUserId ? String(nurseryUserId) : undefined,
    price:
      product.discountPrice > 0 && product.discountPrice < product.price
        ? product.discountPrice
        : product.price || 0,
    originalPrice:
      product.discountPrice > 0 && product.discountPrice < product.price
        ? product.price || 0
        : null,
    rating: product.ratings || 4.5,
    reviews: product.numOfReviews || 0,
    badge: product.category || "Handmade",
    badgeColor: "#0369a1",
    tag: determineProductTag({
      ...product,
      stock: calculatedStock,
      ratings: product.ratings,
      reviewsCount: product.numOfReviews,
    }),
    emoji: product.coverImage?.url || "🏺",
    isBestSeller: product.isBestSeller ?? product.isBestseller,
    isBestseller: product.isBestseller ?? product.isBestSeller,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    totalSales: product.totalSales ?? product.salesCount,
    salesCount: product.salesCount ?? product.totalSales,
    tags: product.tags,
    stock: calculatedStock,
    ratings: product.ratings,
    reviewsCount: product.numOfReviews,
    discountPrice: product.discountPrice,
    createdAt: product.createdAt,
  };
}

/**
 * Fetch featured plants for the Homepage RSC.
 *
 * Uses cache:"no-store" so the Vercel function always fetches fresh data at
 * request time — this prevents the build-time SSG baking an empty [] into
 * the static HTML when the Render free-tier backend is cold during `vercel build`.
 *
 * The surrounding <Suspense> + FeaturedGridSkeleton in page.tsx means users
 * see the skeleton instantly (TTFB is immediate) while this fresh fetch resolves.
 *
 * Wrapped in a 20-second Promise.race to handle Render cold-start latency.
 */
export async function getFeaturedPlantsServer(limit = 4): Promise<ShopItemType[]> {
  const fetch$ = (async () => {
    try {
      // ⚡ PERF: Ask API for only `limit` rows instead of fetch-all-then-slice
      const url = `${API_BASE_URL}/plants/allPlants?limit=${limit}`;
      // ⚡ PERF: 60s ISR caching with background revalidation
      const data = await fetchJson(url, null, 60);

      if (data === null) return [];

      const plants = extractArray(data, "plants");

      if (plants.length === 0) {
        console.warn(
          "[getFeaturedPlantsServer] Extracted 0 plants from payload.\n" +
          "Top-level keys: " + (data ? Object.keys(data).join(", ") : "null") + "\n" +
          "Payload preview: " + JSON.stringify(data).slice(0, 400)
        );
        return [];
      }

      console.log(`[getFeaturedPlantsServer] ✓ ${plants.length} plants fetched, returning ${Math.min(plants.length, limit)}`);
      return plants.slice(0, limit).map(mapRawPlantToShopItem);
    } catch (error: any) {
      console.error(
        "[getFeaturedPlantsServer] Unexpected fetch error:",
        error?.message || String(error)
      );
      return [];
    }
  })();

  // 20 s budget — Render free-tier cold start can take 15–30 s
  // The Suspense skeleton covers the wait time for users
  return withTimeout(fetch$, 20_000, []);
}

/**
 * Fetch featured pots for the Homepage RSC.
 * Same strategy as getFeaturedPlantsServer — see above for rationale.
 */
export async function getFeaturedPotsServer(limit = 4): Promise<ShopItemType[]> {
  const fetch$ = (async () => {
    try {
      // ⚡ PERF: Ask API for only `limit` rows instead of fetch-all-then-slice
      const url = `${API_BASE_URL}/pots/allPots?limit=${limit}`;
      // ⚡ PERF: 60s ISR caching with background revalidation
      const data = await fetchJson(url, null, 60);

      if (data === null) return [];

      const pots = extractArray(data, "pots");

      if (pots.length === 0) {
        console.warn(
          "[getFeaturedPotsServer] Extracted 0 pots from payload.\n" +
          "Top-level keys: " + (data ? Object.keys(data).join(", ") : "null") + "\n" +
          "Payload preview: " + JSON.stringify(data).slice(0, 400)
        );
        return [];
      }

      console.log(`[getFeaturedPotsServer] ✓ ${pots.length} pots fetched, returning ${Math.min(pots.length, limit)}`);
      return pots.slice(0, limit).map(mapRawPotToShopItem);
    } catch (error: any) {
      console.error(
        "[getFeaturedPotsServer] Unexpected fetch error:",
        error?.message || String(error)
      );
      return [];
    }
  })();

  return withTimeout(fetch$, 20_000, []);
}
