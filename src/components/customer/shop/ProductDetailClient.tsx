"use client";

import { useState, useEffect, useMemo, useCallback, Suspense, lazy } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// ⚡ PERF: Critical above-the-fold components imported statically
import LoadingSkeleton from "@/components/customer/shop/LoadingSkeleton";
import ErrorFallback from "@/components/customer/shop/ErrorFallback";
import ProductImageSection from "@/components/customer/shop/ProductImageSection";
import ProductInfoSection from "@/components/customer/shop/ProductInfoSection";
import { determineProductTag } from "@/utils/productBadge";

// ⚡ PERF: Below-the-fold components loaded lazily — they don't block initial paint
const SuggestionsSection = lazy(() => import("@/components/customer/shop/SuggestionsSection"));
const ProductTabsSection = lazy(() => import("@/components/customer/shop/ProductTabsSection"));
const RelatedProductsSection = lazy(() => import("@/components/customer/shop/RelatedProductsSection"));

import { plantService } from "@/services/PlantsService";
import { potService } from "@/services/potService";
import { accessoryService } from "@/services/accessoryService";
import { gardeningToolService } from "@/services/gardeningToolsService";
import { plantCareService } from "@/services/plantCareService";
import { seedsBulbsService } from "@/services/seedsBulbsService";
import { plantStandsShelvesService } from "@/services/plantStandsShelvesService";
import { artificialDriedPlantService } from "@/services/artificialDriedPlantService";

import type { ServerProductData, ShopUrlType } from "@/services/server/productServerService";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface ReviewType {
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

interface MarketItemType extends ServerProductData {}

type TabId = "description" | "care" | "benefits" | "gallery" | "reviews";

const VALID_SHOP_TYPES: ShopUrlType[] = [
  "plants", "pots", "accessories", "gardening-tools",
  "plant-care", "seeds-bulbs", "plant-stands-shelves", "artificial-dried-plants",
];

const TYPE_LABELS: Record<ShopUrlType, string> = {
  plants: "Plants", pots: "Pots", accessories: "Accessories",
  "gardening-tools": "Gardening Tools", "plant-care": "Plant Care",
  "seeds-bulbs": "Seeds & Bulbs", "plant-stands-shelves": "Plant Stands",
  "artificial-dried-plants": "Artificial & Dried Plants",
};

const FALLBACK_EMOJI: Record<ShopUrlType, string> = {
  plants: "🌿", pots: "🏺", accessories: "🛠️", "gardening-tools": "🔧",
  "plant-care": "🧪", "seeds-bulbs": "🌱", "plant-stands-shelves": "🪜",
  "artificial-dried-plants": "🥀",
};

// ─────────────────────────────────────────────
// Helpers (browser-safe — only used in useEffect callbacks)
// ─────────────────────────────────────────────

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function extractCareInstructions(raw: any): string[] {
  const candidates = [
    raw.careInstructions, raw.howToUse, raw.dosageInstructions,
    raw.tips, raw.sowingSteps, raw.assemblyInstructions, raw.features,
  ];
  for (const c of candidates) {
    const arr = toStringArray(c);
    if (arr.length) return arr;
  }
  if (raw.shortDescription) return [String(raw.shortDescription)];
  if (raw.description) return [String(raw.description).slice(0, 240)];
  return ["See product description for usage details."];
}

function extractBenefits(raw: any): string[] {
  const candidates = [raw.benefits, raw.features, raw.ingredients];
  for (const c of candidates) {
    const arr = toStringArray(c);
    if (arr.length) return arr;
  }
  const bits: string[] = [];
  if (raw.sowingSeason) bits.push(`Sowing season: ${raw.sowingSeason}`);
  if (raw.material) bits.push(`Material: ${raw.material}`);
  if (raw.composition) bits.push(`Composition: ${raw.composition}`);
  if (raw.formType) bits.push(`Form: ${raw.formType}`);
  if (raw.netQuantity) bits.push(`Net quantity: ${raw.netQuantity}`);
  if (bits.length) return bits;
  return ["Premium quality marketplace selection."];
}

function extractRawProduct(res: any, targetType: ShopUrlType): any {
  if (!res) return null;
  const keyMap: Record<ShopUrlType, string[]> = {
    plants: ["plant"], pots: ["pot"], accessories: ["accessory"],
    "gardening-tools": ["gardeningTool"], "plant-care": ["plantCare"],
    "seeds-bulbs": ["seedsBulbs"], "plant-stands-shelves": ["plantStandsShelves"],
    "artificial-dried-plants": ["artificialDriedPlant", "artificial", "artificialDriedPlants"],
  };
  for (const key of keyMap[targetType]) {
    if (res[key]) return res[key];
  }
  return res.data || (res && typeof res === "object" && !res.status && (res._id || res.name) ? res : null);
}

/**
 * Client-side fallback resolver (Strategies 2 & 3)
 * Called only when server could not resolve (SSR miss / cold start / 404).
 * Uses sessionStorage cache and axios-based services (browser-only APIs).
 */
async function resolveProductClientFallback(
  shopType: ShopUrlType,
  urlSlug: string
): Promise<{ rawProduct: any; discoveredId: string } | null> {
  // Strategy 1: Try slug endpoint via axios (for cases server missed)
  try {
    let slugRes: any = null;
    if (shopType === "plants") slugRes = await plantService.getPlantBySlug(urlSlug);
    else if (shopType === "pots") slugRes = await potService.getPotBySlug(urlSlug);
    else if (shopType === "accessories") slugRes = await accessoryService.getAccessoryBySlug(urlSlug);
    else if (shopType === "gardening-tools") slugRes = await gardeningToolService.getGardeningToolBySlug(urlSlug);
    else if (shopType === "plant-care") slugRes = await plantCareService.getPlantCareBySlug(urlSlug);
    else if (shopType === "seeds-bulbs") slugRes = await seedsBulbsService.getSeedsBulbsBySlug(urlSlug);
    else if (shopType === "plant-stands-shelves") slugRes = await plantStandsShelvesService.getPlantStandsShelvesBySlug(urlSlug);
    else if (shopType === "artificial-dried-plants") slugRes = await artificialDriedPlantService.getArtificialBySlug(urlSlug);

    if (slugRes) {
      const rawProduct = extractRawProduct(slugRes, shopType);
      if (rawProduct) return { rawProduct, discoveredId: rawProduct._id || rawProduct.id || urlSlug };
    }
  } catch { /* fall through */ }

  // Strategy 2: Direct ObjectId lookup
  if (urlSlug.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      let res: any = null;
      if (shopType === "plants") res = await plantService.getPlantDetails(urlSlug);
      else if (shopType === "pots") res = await potService.getPotDetails(urlSlug);
      else if (shopType === "accessories") res = await accessoryService.getAccessoryDetails(urlSlug);
      else if (shopType === "gardening-tools") res = await gardeningToolService.getGardeningToolDetails(urlSlug);
      else if (shopType === "plant-care") res = await plantCareService.getPlantCareDetails(urlSlug);
      else if (shopType === "seeds-bulbs") res = await seedsBulbsService.getSeedsBulbsDetails(urlSlug);
      else if (shopType === "plant-stands-shelves") res = await plantStandsShelvesService.getPlantStandsShelvesDetails(urlSlug);
      else if (shopType === "artificial-dried-plants") res = await artificialDriedPlantService.getArtificialDetails(urlSlug);
      const rawProduct = extractRawProduct(res, shopType);
      if (rawProduct) return { rawProduct, discoveredId: urlSlug };
    } catch { /* fall through */ }
  }

  // Strategy 3: sessionStorage cache → catalog scan
  const cacheKey = `shop_item_id_${urlSlug}`;
  const cachedId = sessionStorage.getItem(cacheKey);

  if (cachedId) {
    try {
      let res: any = null;
      if (shopType === "plants") res = await plantService.getPlantDetails(cachedId);
      else if (shopType === "pots") res = await potService.getPotDetails(cachedId);
      else if (shopType === "accessories") res = await accessoryService.getAccessoryDetails(cachedId);
      else if (shopType === "gardening-tools") res = await gardeningToolService.getGardeningToolDetails(cachedId);
      else if (shopType === "plant-care") res = await plantCareService.getPlantCareDetails(cachedId);
      else if (shopType === "seeds-bulbs") res = await seedsBulbsService.getSeedsBulbsDetails(cachedId);
      else if (shopType === "plant-stands-shelves") res = await plantStandsShelvesService.getPlantStandsShelvesDetails(cachedId);
      else if (shopType === "artificial-dried-plants") res = await artificialDriedPlantService.getArtificialDetails(cachedId);
      const rawProduct = extractRawProduct(res, shopType);
      if (rawProduct) return { rawProduct, discoveredId: cachedId };
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
  }

  return null;
}

async function fetchRelatedAndCrossSell(
  shopType: ShopUrlType,
  currentItemId: string
): Promise<{ relatedList: any[]; crossList: any[] }> {
  let relatedPromise: Promise<any>;
  let crossPromise: Promise<any>;

  if (shopType === "plants") {
    relatedPromise = plantService.getAllPlants("limit=5");
    crossPromise = potService.getAllPots("limit=3");
  } else if (shopType === "pots") {
    relatedPromise = potService.getAllPots("limit=5");
    crossPromise = plantService.getAllPlants("limit=3");
  } else if (shopType === "accessories") {
    relatedPromise = typeof accessoryService.getAllAccessories === "function"
      ? accessoryService.getAllAccessories("limit=5")
      : Promise.resolve(null);
    crossPromise = plantService.getAllPlants("limit=3");
  } else if (shopType === "gardening-tools") {
    relatedPromise = gardeningToolService.getAllGardeningTools("limit=5");
    crossPromise = plantService.getAllPlants("limit=3");
  } else if (shopType === "plant-care") {
    relatedPromise = plantCareService.getAllPlantCare("limit=5");
    crossPromise = plantService.getAllPlants("limit=3");
  } else if (shopType === "seeds-bulbs") {
    relatedPromise = seedsBulbsService.getAllSeedsBulbs("limit=5");
    crossPromise = plantService.getAllPlants("limit=3");
  } else if (shopType === "plant-stands-shelves") {
    relatedPromise = plantStandsShelvesService.getAllPlantStandsShelves("limit=5");
    crossPromise = plantService.getAllPlants("limit=3");
  } else {
    relatedPromise = artificialDriedPlantService.getAllArtificials("limit=5");
    crossPromise = plantService.getAllPlants("limit=3");
  }

  const [relatedRes, crossRes] = await Promise.all([relatedPromise, crossPromise]);

  let relatedList: any[] = [];
  let crossList: any[] = [];

  if (shopType === "plants") { relatedList = (relatedRes as any)?.plants || []; crossList = (crossRes as any)?.pots || []; }
  else if (shopType === "pots") { relatedList = (relatedRes as any)?.pots || []; crossList = (crossRes as any)?.plants || []; }
  else if (shopType === "accessories") { relatedList = (relatedRes as any)?.accessories || (Array.isArray(relatedRes) ? relatedRes : []); crossList = (crossRes as any)?.plants || []; }
  else if (shopType === "gardening-tools") { relatedList = (relatedRes as any)?.gardeningTools || []; crossList = (crossRes as any)?.plants || []; }
  else if (shopType === "plant-care") { relatedList = (relatedRes as any)?.plantCare || []; crossList = (crossRes as any)?.plants || []; }
  else if (shopType === "seeds-bulbs") { relatedList = (relatedRes as any)?.seedsBulbs || []; crossList = (crossRes as any)?.plants || []; }
  else if (shopType === "plant-stands-shelves") { relatedList = (relatedRes as any)?.plantStandsShelves || []; crossList = (crossRes as any)?.plants || []; }
  else { relatedList = (relatedRes as any)?.artificialDriedPlants || (relatedRes as any)?.artificials || []; crossList = (crossRes as any)?.plants || []; }

  return {
    relatedList: relatedList.filter((p: any) => (p._id || p.id) !== currentItemId).slice(0, 4),
    crossList: crossList.slice(0, 3),
  };
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface ProductDetailClientProps {
  /** Pre-fetched on server — null if server fetch failed (e.g. cold start / 404) */
  initialProduct: ServerProductData | null;
  shopType: ShopUrlType;
  urlSlug: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function ProductDetailClient({
  initialProduct,
  shopType,
  urlSlug,
}: ProductDetailClientProps) {
  const router = useRouter();
  const params = useParams();

  const [item, setItem] = useState<MarketItemType | null>(
    initialProduct as MarketItemType | null
  );
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const [crossSellItems, setCrossSellItems] = useState<any[]>([]);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);

  // Client-side fallback: only runs when server fetch failed
  const resolveClientSide = useCallback(async () => {
    if (
      !urlSlug || !shopType ||
      !VALID_SHOP_TYPES.includes(shopType) ||
      VALID_SHOP_TYPES.includes(urlSlug as ShopUrlType)
    ) {
      setLoading(false);
      setError("Routing parameters are mismatching or could not be verified.");
      return;
    }

    let isMounted = true;
    try {
      setLoading(true);
      setError(null);

      const resolved = await resolveProductClientFallback(shopType, urlSlug);
      if (!resolved) throw new Error(`Could not resolve product matching identifier '${urlSlug}'`);
      if (!isMounted) return;

      const { rawProduct, discoveredId } = resolved;
      const nurseryObj = typeof rawProduct.nursery === "object" ? rawProduct.nursery : null;
      const vendorObj = typeof rawProduct.vendor === "object" ? rawProduct.vendor : null;

      const nurseryName =
        nurseryObj?.name || nurseryObj?.businessName || vendorObj?.name || vendorObj?.businessName ||
        rawProduct.businessName || (typeof rawProduct.vendor === "string" ? rawProduct.vendor : null) ||
        "Certified Nursery";
      const nurseryLoc = nurseryObj?.location || nurseryObj?.businessAddress?.city || vendorObj?.location || rawProduct.city || "Indore";
      const vendorId = rawProduct.vendorId || nurseryObj?._id || vendorObj?._id || (typeof rawProduct.nursery === "string" ? rawProduct.nursery : undefined);
      const vendorSlug = rawProduct.vendorSlug || nurseryObj?.slug || vendorObj?.slug || nurseryName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
      const nurseryUserId = rawProduct.nurseryId || nurseryObj?.nurseryId || vendorObj?.nurseryId || (typeof rawProduct.nursery === "string" ? rawProduct.nursery : undefined);

      // Smart fallback extraction for backward-compatible metadata in description
      const formTypeMatch = rawProduct.description?.match(/Form:\s*([^|\n]+)/i)?.[1]?.trim();
      const isOrganicDerived =
        rawProduct.isOrganic !== undefined
          ? rawProduct.isOrganic
          : rawProduct.description?.includes("Organic") || rawProduct.name?.toLowerCase().includes("organic")
          ? true
          : undefined;
      const maxLoadMatch = rawProduct.description?.match(/Max weight capacity:\s*([^\n]+)/i)?.[1]?.trim();

      const transformed: MarketItemType = {
        id: rawProduct._id || rawProduct.id || discoveredId,
        slug: rawProduct.slug || urlSlug,
        type: TYPE_LABELS[shopType],
        shopType,
        category: rawProduct.category || "Standard Tier",
        name: rawProduct.name || "Ecosystem Dynamic Unit",
        vendor: `${nurseryName}, ${nurseryLoc}`,
        vendorId: vendorId ? String(vendorId) : undefined,
        vendorSlug: vendorSlug ? String(vendorSlug) : undefined,
        nurseryId: nurseryUserId ? String(nurseryUserId) : undefined,
        price: rawProduct.discountPrice > 0 && rawProduct.discountPrice < rawProduct.price ? rawProduct.discountPrice : rawProduct.price || 0,
        originalPrice: rawProduct.discountPrice > 0 && rawProduct.discountPrice < rawProduct.price ? rawProduct.price || 0 : null,
        rating: rawProduct.ratings || rawProduct.rating || 4.5,
        reviews: rawProduct.numOfReviews || rawProduct.reviews?.length || 0,
        badge: rawProduct.stock > 0 ? "In Stock" : "Unavailable",
        badgeColor: rawProduct.stock > 0 ? "#15803d" : "#dc2626",
        tag: determineProductTag({
          ...rawProduct,
          ratings: rawProduct.ratings || rawProduct.rating,
          reviewsCount: rawProduct.numOfReviews || rawProduct.reviews?.length,
        }),
        isBestSeller: rawProduct.isBestSeller ?? rawProduct.isBestseller,
        isBestseller: rawProduct.isBestseller ?? rawProduct.isBestSeller,
        isFeatured: rawProduct.isFeatured,
        isNewArrival: rawProduct.isNewArrival,
        totalSales: rawProduct.totalSales ?? rawProduct.salesCount,
        salesCount: rawProduct.salesCount ?? rawProduct.totalSales,
        tags: rawProduct.tags,
        emoji: rawProduct.coverImage?.url || FALLBACK_EMOJI[shopType],
        description: rawProduct.description || "No descriptions attached to this item.",
        descriptionOption: rawProduct.descriptionOption || undefined,
        careInstructions: extractCareInstructions(rawProduct),
        benefits: extractBenefits(rawProduct),
        galleryImages: rawProduct.images?.map((img: any) => (typeof img === "string" ? img : img.url)) || [FALLBACK_EMOJI[shopType]],
        verifiedReviews: rawProduct.reviews?.map((rev: any) => ({ author: rev.name || "Anonymous", rating: rev.rating || 5, date: "Recent", comment: rev.comment || "No comment.", verified: true })) || [],
        metaTitle: rawProduct.metaTitle,
        metaDescription: rawProduct.metaDescription,

        // Specifications pass-through
        stock: rawProduct.stock,
        lightRequirement: rawProduct.lightRequirement,
        wateringSchedule: rawProduct.wateringSchedule,
        maintenanceLevel: rawProduct.maintenanceLevel,
        isPetFriendly: rawProduct.isPetFriendly,
        material: rawProduct.material || rawProduct.specifications?.material,
        color: rawProduct.color || rawProduct.specifications?.color,
        dimensions: rawProduct.dimensions || rawProduct.specifications?.dimensions,
        hasDrainageHole: rawProduct.hasDrainageHole,
        shape: rawProduct.shape,
        isIndoorOutdoor: rawProduct.isIndoorOutdoor,
        includesSaucer: rawProduct.includesSaucer,
        handleMaterial: rawProduct.handleMaterial,
        warrantyMonths: rawProduct.warrantyMonths,
        howToUse: rawProduct.howToUse,
        composition: rawProduct.composition,
        volumeOrWeight: rawProduct.volumeOrWeight,
        formType: rawProduct.formType || formTypeMatch,
        isOrganic: isOrganicDerived,
        sowingSeason: rawProduct.sowingSeason,
        germinationTime: rawProduct.germinationTime,
        quantityPerPack: rawProduct.quantityPerPack,
        tierCount: rawProduct.tierCount,
        maxLoadCapacity: rawProduct.maxLoadCapacity || maxLoadMatch,
        specifications: rawProduct.specifications,
        rawSpecifications: rawProduct,
      };

      setItem(transformed);
      setLoading(false);

      // Phase 2: load related/cross-sell in background after primary renders
      fetchRelatedAndCrossSell(shopType, transformed.id).then(({ relatedList, crossList }) => {
        if (isMounted) {
          setCrossSellItems(crossList);
          setRelatedItems(relatedList);
        }
      });
    } catch (err: any) {
      if (isMounted) {
        setError(err?.response?.data?.message || err?.message || "Failed to load product.");
        setLoading(false);
      }
    }
    return () => { isMounted = false; };
  }, [shopType, urlSlug]);

  // When server pre-fetched successfully, only load related/cross-sell on client
  useEffect(() => {
    if (initialProduct) {
      fetchRelatedAndCrossSell(shopType, initialProduct.id).then(({ relatedList, crossList }) => {
        setCrossSellItems(crossList);
        setRelatedItems(relatedList);
      });
      return;
    }
    // Server fetch failed — run full client-side resolution
    resolveClientSide();
  }, [initialProduct, shopType, resolveClientSide]);

  const handleAddNewReview = (newReview: ReviewType) => {
    if (!item) return;
    const updatedReviews = [newReview, ...item.verifiedReviews];
    const totalRating = updatedReviews.reduce((acc, curr) => acc + curr.rating, 0);
    setItem({
      ...item,
      verifiedReviews: updatedReviews,
      reviews: updatedReviews.length,
      rating: parseFloat((totalRating / updatedReviews.length).toFixed(1)),
    });
  };

  const discountPercentage = useMemo(() => {
    if (!item || !item.originalPrice) return null;
    return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  }, [item]);

  const normalizedSuggestions = useMemo(() => {
    if (!crossSellItems || !Array.isArray(crossSellItems)) return [];
    return crossSellItems.map((cross: any) => ({
      id: cross._id || cross.id,
      slug: cross.slug || cross._id || cross.id,
      type: shopType === "plants" ? "Pots" : "Plants",
      name: cross.name || "Cross Catalog Unit",
      price: cross.price || 0,
      emoji: cross.coverImage?.url || (shopType === "plants" ? "🏺" : "🌿"),
    }));
  }, [crossSellItems, shopType]);

  if (loading) return <LoadingSkeleton />;
  if (error || !item) return <ErrorFallback error={error} onRetry={() => router.push("/shop")} />;

  return (
    <main className="min-h-screen bg-background text-foreground pt-28 pb-20 px-4 sm:px-6 font-sans">
      <div className="w-full max-w-[1100px] mx-auto">
        {/* Semantic Breadcrumbs matching Structured Data */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 flex-wrap">
          <Link href="/" className="hover:text-emerald-700 transition font-medium no-underline">
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/shop" className="hover:text-emerald-700 transition font-medium no-underline">
            Shop
          </Link>
          <span className="text-slate-300">/</span>
          <Link href={`/shop/${shopType}`} className="hover:text-emerald-700 transition font-medium no-underline">
            {TYPE_LABELS[shopType] || item.type}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-emerald-800 font-bold truncate max-w-[240px]" aria-current="page">
            {item.name}
          </span>
        </nav>

        <button
          onClick={() => router.push("/shop")}
          className="flex items-center gap-2 text-xs font-bold text-muted-text hover:text-brand-primary transition-colors cursor-pointer mb-8 bg-transparent border-none outline-none"
        >
          ← Back to Botanical Marketplace
        </button>

        {/* ─── Above-the-fold: statically imported, renders immediately ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start mb-12">
          <ProductImageSection
            tag={item.tag}
            emoji={item.emoji}
            name={item.name}
            galleryImages={item.galleryImages}
          />
          <ProductInfoSection
            id={item.id}
            type={item.type}
            category={item.category}
            name={item.name}
            rating={item.rating}
            reviews={item.reviews}
            vendor={item.vendor}
            vendorId={item.vendorId}
            vendorSlug={item.vendorSlug}
            nurseryId={item.nurseryId}
            price={item.price}
            originalPrice={item.originalPrice}
            discountPercentage={discountPercentage}
            description={item.description}
            descriptionOption={item.descriptionOption}
            quantity={quantity}
            setQuantity={setQuantity}
            item={item}
          />
        </div>

        {/* ─── Below-the-fold: lazily loaded, don't block initial paint ─── */}
        <Suspense fallback={<div className="h-24" />}>
          <SuggestionsSection suggestions={normalizedSuggestions} />
        </Suspense>

        <Suspense fallback={<div className="h-64" />}>
          <ProductTabsSection
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            itemId={item.id}
            itemType={shopType}
            item={item}
            handleAddNewReview={handleAddNewReview}
            descriptionOption={item.descriptionOption}
          />
        </Suspense>

        <Suspense fallback={<div className="h-64" />}>
          <RelatedProductsSection
            relatedItems={relatedItems}
            targetType={shopType}
            itemTypeLabel={item.type}
          />
        </Suspense>
      </div>
    </main>
  );
}
