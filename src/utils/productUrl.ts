/**
 * Maps product itemModel or category to public shop routing segment
 */
export const getShopCategorySegment = (rawCategoryOrModel?: string): string => {
  if (!rawCategoryOrModel) return "plants";
  const normalized = rawCategoryOrModel.toLowerCase().trim();

  if (normalized.includes("pot") || normalized === "pots") {
    return "pots";
  }
  if (normalized.includes("accessor") || normalized === "accessories") {
    return "accessories";
  }
  if (
    normalized.includes("gardeningtool") ||
    normalized.includes("gardening-tool") ||
    normalized.includes("gardening_tool") ||
    normalized.includes("tool")
  ) {
    return "gardening-tools";
  }
  if (
    normalized.includes("plantcare") ||
    normalized.includes("plant-care") ||
    normalized.includes("plant_care") ||
    normalized.includes("care") ||
    normalized.includes("fertilizer")
  ) {
    return "plant-care";
  }
  if (
    normalized.includes("seedsbulb") ||
    normalized.includes("seeds-bulb") ||
    normalized.includes("seeds_bulb") ||
    normalized.includes("seed") ||
    normalized.includes("bulb")
  ) {
    return "seeds-bulbs";
  }
  if (
    normalized.includes("plantstand") ||
    normalized.includes("plant-stand") ||
    normalized.includes("plant_stand") ||
    normalized.includes("stand") ||
    normalized.includes("shelve") ||
    normalized.includes("shelf")
  ) {
    return "plant-stands-shelves";
  }
  if (
    normalized.includes("artificialdried") ||
    normalized.includes("artificial-dried") ||
    normalized.includes("artificial_dried") ||
    normalized.includes("artificial") ||
    normalized.includes("dried")
  ) {
    return "artificial-dried-plants";
  }

  return "plants";
};

export interface IShopUrlSource {
  itemModel?: string;
  category?: string;
  slug?: string;
  _id?: string;
  id?: string;
  product?:
    | {
        slug?: string;
        _id?: string;
        id?: string;
        category?: string;
        itemModel?: string;
        name?: string;
      }
    | string
    | null;
  item?:
    | {
        slug?: string;
        _id?: string;
        id?: string;
        category?: string;
        itemModel?: string;
        name?: string;
      }
    | string
    | null;
}

/**
 * Generates public shop URL for an ordered product item:
 * e.g. /shop/plants/snake-plant-9213 or /shop/pots/ceramic-pot-12
 */
export const getProductShopUrl = (item?: IShopUrlSource | any | null): string | null => {
  if (!item) return null;

  const categoryOrModel =
    item.itemModel ||
    item.category ||
    (typeof item.product === "object" && item.product ? (item.product.itemModel || item.product.category) : undefined) ||
    (typeof item.item === "object" && item.item ? (item.item.itemModel || item.item.category) : undefined);

  const segment = getShopCategorySegment(categoryOrModel);

  let slug: string | undefined = item.slug;

  if (!slug && typeof item.product === "object" && item.product) {
    slug = item.product.slug || item.product._id || item.product.id;
  }
  if (!slug && typeof item.product === "string" && item.product) {
    slug = item.product;
  }
  if (!slug && typeof item.item === "object" && item.item) {
    slug = item.item.slug || item.item._id || item.item.id;
  }
  if (!slug && typeof item.item === "string" && item.item) {
    slug = item.item;
  }
  if (!slug && (item._id || item.id)) {
    slug = item._id || item.id;
  }

  if (!slug) return null;

  return `/shop/${segment}/${slug}`;
};

/**
 * Safe guaranteed non-null product URL for Link components and navigation.
 * Resolves to canonical route /shop/[segment]/[slug], or falls back
 * gracefully to /shop/[segment] or /shop.
 */
export const getProductUrl = (item?: IShopUrlSource | any | null, fallback?: string): string => {
  if (!item) return fallback || "/shop";
  const url = getProductShopUrl(item);
  if (url) return url;
  if (fallback) return fallback;

  const categoryOrModel =
    item.itemModel ||
    item.category ||
    (typeof item.product === "object" && item.product ? (item.product.itemModel || item.product.category) : undefined) ||
    (typeof item.item === "object" && item.item ? (item.item.itemModel || item.item.category) : undefined);
  const segment = getShopCategorySegment(categoryOrModel);
  return segment ? `/shop/${segment}` : "/shop";
};

/**
 * Generates public vendor storefront URL:
 * e.g. /vendor/green-paradise-nursery
 */
export const getVendorShopUrl = (vendor?: any): string => {
  if (!vendor) return "/shop";
  if (typeof vendor === "string" && vendor.trim()) {
    const cleaned = vendor.trim();
    if (cleaned.startsWith("/vendor/")) return cleaned;
    return `/vendor/${cleaned}`;
  }
  const slug = vendor.slug || vendor.nurseryId || vendor._id || vendor.id;
  if (slug) return `/vendor/${slug}`;
  return "/shop";
};
