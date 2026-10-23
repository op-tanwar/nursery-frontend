import { SITE_URL } from "@/config/site";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1 hour cache

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://planto-backend-mpdo.onrender.com/api/v1";

interface ProductItem {
  slug: string;
  shopType: string;
  updatedAt?: string;
  isActive?: boolean;
}

const CATALOG_ENDPOINTS = [
  { endpoint: "plants/all", key: "plants", shopType: "plants" },
  { endpoint: "pots/all", key: "pots", shopType: "pots" },
  { endpoint: "accessories/all", key: "accessories", shopType: "accessories" },
  { endpoint: "gardening-tools/all", key: "gardeningTools", shopType: "gardening-tools" },
  { endpoint: "plant-care/all", key: "plantCareList", shopType: "plant-care" },
  { endpoint: "seeds-bulbs/all", key: "seedsBulbsList", shopType: "seeds-bulbs" },
  { endpoint: "plant-stands-shelves/all", key: "plantStandsShelvesList", shopType: "plant-stands-shelves" },
  { endpoint: "artificial-dried-plants/all", key: "artificials", shopType: "artificial-dried-plants" },
];

// Fallback seed catalog for zero-failure guarantee if backend cold-starts
const FALLBACK_PRODUCTS: ProductItem[] = [
  { slug: "monstera-deliciosa", shopType: "plants" },
  { slug: "sansevieria-snake-plant", shopType: "plants" },
  { slug: "ficus-lyrata-fiddle-leaf", shopType: "plants" },
  { slug: "zz-plant-zamioculcas", shopType: "plants" },
  { slug: "peace-lily-spathiphyllum", shopType: "plants" },
  { slug: "areca-palm", shopType: "plants" },
  { slug: "golden-pothos-money-plant", shopType: "plants" },
  { slug: "ceramic-fluted-planter-white", shopType: "pots" },
  { slug: "terracotta-round-pot-8inch", shopType: "pots" },
  { slug: "extendable-coir-moss-pole", shopType: "accessories" },
  { slug: "stainless-steel-bypass-pruner", shopType: "gardening-tools" },
  { slug: "cold-pressed-organic-neem-oil", shopType: "plant-care" },
];

async function fetchCatalogProducts(): Promise<ProductItem[]> {
  const products: ProductItem[] = [];

  for (const item of CATALOG_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${API_BASE_URL}/${item.endpoint}?limit=100`, {
        next: { revalidate: 3600 },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const list = data[item.key] || data.products || (Array.isArray(data) ? data : []);
        if (Array.isArray(list)) {
          for (const p of list) {
            // Strictly exclude inactive or discontinued items
            if (p.isActive !== false && p.slug) {
              products.push({
                slug: p.slug,
                shopType: item.shopType,
                updatedAt: p.updatedAt || p.createdAt,
              });
            }
          }
        }
      }
    } catch {
      // Non-blocking graceful fallback
    }
  }

  return products.length > 0 ? products : FALLBACK_PRODUCTS;
}

export async function GET() {
  const products = await fetchCatalogProducts();
  const fallbackDate = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${products
  .map((p) => {
    const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : fallbackDate;
    return `  <url>
    <loc>${SITE_URL}/shop/${p.shopType}/${p.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=1800",
    },
  });
}
