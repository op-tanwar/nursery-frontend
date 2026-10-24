import { SITE_URL } from "@/config/site";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1 hour

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://nursery-backend-2rg3.onrender.com/api/v1";

interface FeedProduct {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  availability: "in_stock" | "out_of_stock";
  price: number;
  brand: string;
  category: string;
  googleProductCategory: string;
}

function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const FALLBACK_FEED_ITEMS: FeedProduct[] = [
  {
    id: "plant-monstera-001",
    title: "Monstera Deliciosa Indoor Plant",
    description: "Botanist-verified Monstera Deliciosa in nursery pot with 24-hour delivery guarantee.",
    link: `${SITE_URL}/shop/plants/monstera-deliciosa`,
    imageLink: `${SITE_URL}/images/logo-new.png`,
    availability: "in_stock",
    price: 899,
    brand: "Urban Nursery",
    category: "Indoor Plants",
    googleProductCategory: "Home & Garden > Plants > Live Plants",
  },
  {
    id: "plant-snake-002",
    title: "Sansevieria Trifasciata Snake Plant",
    description: "Low-light air-purifying Snake Plant proven to produce oxygen and clean indoor toxins.",
    link: `${SITE_URL}/shop/plants/sansevieria-snake-plant`,
    imageLink: `${SITE_URL}/images/logo-new.png`,
    availability: "in_stock",
    price: 499,
    brand: "Urban Nursery",
    category: "Air Purifying Plants",
    googleProductCategory: "Home & Garden > Plants > Live Plants",
  },
  {
    id: "pot-ceramic-003",
    title: "Fluted Ceramic Planter with Drainage Saucer",
    description: "Handcrafted white glazed ceramic planter with pre-drilled aeration drainage hole.",
    link: `${SITE_URL}/shop/pots/ceramic-fluted-planter-white`,
    imageLink: `${SITE_URL}/images/logo-new.png`,
    availability: "in_stock",
    price: 649,
    brand: "Urban Nursery",
    category: "Pots & Planters",
    googleProductCategory: "Home & Garden > Lawn & Garden > Gardening > Pots & Planters",
  },
];

async function fetchProductsForMerchantFeed(): Promise<FeedProduct[]> {
  const items: FeedProduct[] = [];

  const endpoints = [
    { endpoint: "plants/all", shopType: "plants", googleCategory: "Home & Garden > Plants > Live Plants" },
    { endpoint: "pots/all", shopType: "pots", googleCategory: "Home & Garden > Lawn & Garden > Gardening > Pots & Planters" },
  ];

  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${API_BASE_URL}/${ep.endpoint}?limit=50`, {
        next: { revalidate: 3600 },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const list = data[ep.shopType] || data.products || (Array.isArray(data) ? data : []);
        if (Array.isArray(list)) {
          for (const raw of list) {
            if (raw.slug && raw.isActive !== false) {
              const stock = typeof raw.stock === "number" ? raw.stock : 1;
              const price = raw.discountPrice > 0 ? raw.discountPrice : raw.price || 299;
              const img = raw.coverImage?.url || raw.emoji || `${SITE_URL}/images/logo-new.png`;

              items.push({
                id: String(raw._id || raw.id || raw.slug),
                title: raw.name || "Live Botanical Plant",
                description: raw.description?.slice(0, 250) || "Certified healthy live plant from Urban Nursery India.",
                link: `${SITE_URL}/shop/${ep.shopType}/${raw.slug}`,
                imageLink: img.startsWith("http") ? img : `${SITE_URL}/images/logo-new.png`,
                availability: stock > 0 ? "in_stock" : "out_of_stock",
                price,
                brand: raw.vendor || "Urban Nursery",
                category: raw.category || "Live Plants",
                googleProductCategory: ep.googleCategory,
              });
            }
          }
        }
      }
    } catch {
      // Non-blocking fallback
    }
  }

  return items.length > 0 ? items : FALLBACK_FEED_ITEMS;
}

export async function GET() {
  const items = await fetchProductsForMerchantFeed();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Urban Nursery India - Certified Live Plants &amp; Planters Feed</title>
    <link>${SITE_URL}</link>
    <description>Automated Google Merchant Center Product Feed for Urban Nursery India.</description>
${items
      .map(
        (item) => `    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title>${escapeXml(item.title)}</g:title>
      <g:description>${escapeXml(item.description)}</g:description>
      <g:link>${escapeXml(item.link)}</g:link>
      <g:image_link>${escapeXml(item.imageLink)}</g:image_link>
      <g:availability>${item.availability === "in_stock" ? "in stock" : "out of stock"}</g:availability>
      <g:price>${item.price.toFixed(2)} INR</g:price>
      <g:brand>${escapeXml(item.brand)}</g:brand>
      <g:google_product_category>${escapeXml(item.googleProductCategory)}</g:google_product_category>
      <g:condition>new</g:condition>
    </item>`
      )
      .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
