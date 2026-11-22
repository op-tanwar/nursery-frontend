import { SITE_URL } from "@/config/site";
import { getShopCategorySegment } from "@/utils/productUrl";
import {
  escapeXml,
  formatLastmod,
  sanitizeSlug,
  getApiBaseUrl,
  fetchWithResilience,
} from "@/utils/sitemap";

export const revalidate = 3600; // 1 hour edge cache

interface ProductSitemapItem {
  slug: string;
  category: string;
  updatedAt?: string;
}

// Fallback seed catalog for zero-failure guarantee if backend cold-starts or is offline
const FALLBACK_PRODUCTS: ProductSitemapItem[] = [
  { slug: "monstera-deliciosa", category: "plants" },
  { slug: "sansevieria-snake-plant", category: "plants" },
  { slug: "ficus-lyrata-fiddle-leaf", category: "plants" },
  { slug: "zz-plant-zamioculcas", category: "plants" },
  { slug: "peace-lily-spathiphyllum", category: "plants" },
  { slug: "areca-palm", category: "plants" },
  { slug: "golden-pothos-money-plant", category: "plants" },
  { slug: "ceramic-fluted-planter-white", category: "pots" },
  { slug: "terracotta-round-pot-8inch", category: "pots" },
  { slug: "extendable-coir-moss-pole", category: "accessories" },
  { slug: "stainless-steel-bypass-pruner", category: "gardening-tools" },
  { slug: "cold-pressed-organic-neem-oil", category: "plant-care" },
];

async function fetchActiveProducts(): Promise<ProductSitemapItem[]> {
  const baseUrl = getApiBaseUrl();
  const products: ProductSitemapItem[] = [];
  const seenLocs = new Set<string>();

  try {
    // 15000ms generous server timeout with retry logic for backend cold starts
    // Strictly whitelists active products: isPublished=true, isActive=true, isNurseryActive=true
    const data = await fetchWithResilience<any>(
      `${baseUrl}/products?limit=100&isPublished=true&isActive=true&isNurseryActive=true`,
      15000,
      2
    );

    const list = data?.products || (Array.isArray(data) ? data : data?.data || []);

    if (Array.isArray(list)) {
      for (const p of list) {
        // Strictly exclude inactive, unpublished, or blocked nursery products
        if (p.isPublished === false || p.isActive === false || p.isNurseryActive === false) {
          continue;
        }

        const rawSlug = p.slug || p.name;
        const slug = sanitizeSlug(rawSlug);
        if (!slug) continue;

        const rawCat = p.category || p.itemModel || p.type || p.shopType;
        const category = getShopCategorySegment(rawCat);

        const locKey = `${category}/${slug}`;
        if (seenLocs.has(locKey)) continue;
        seenLocs.add(locKey);

        products.push({
          slug,
          category,
          updatedAt: p.updatedAt || p.createdAt,
        });
      }
    }
  } catch (err) {
    console.warn("[sitemap-products] Non-blocking graceful fallback triggered:", err);
  }

  return products.length > 0 ? products : FALLBACK_PRODUCTS;
}

export async function GET() {
  try {
    const products = await fetchActiveProducts();
    const fallbackDate = new Date().toISOString().split("T")[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${products
  .map((p) => {
    const loc = `${SITE_URL}/shop/${p.category}/${p.slug}`;
    const lastmod = formatLastmod(p.updatedAt || fallbackDate);
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=1800",
      },
    });
  } catch (err) {
    // Zero-failure fallback response: always returns 200 OK with valid XML urlset
    console.error("[sitemap-products] Critical route recovery handler:", err);
    const currentDate = new Date().toISOString().split("T")[0];
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${FALLBACK_PRODUCTS.map(
  (p) => `  <url>
    <loc>${escapeXml(`${SITE_URL}/shop/${p.category}/${p.slug}`)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
).join("\n")}
</urlset>`;

    return new Response(fallbackXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=1800",
      },
    });
  }
}
