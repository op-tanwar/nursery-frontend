import { SITE_URL } from "@/config/site";
import { escapeXml, formatLastmod, getApiBaseUrl } from "@/utils/sitemap";

export const revalidate = 7200; // 2 hours

const API_BASE_URL = getApiBaseUrl();

interface VendorItem {
  slug: string;
  updatedAt?: string;
}

const FALLBACK_VENDORS: VendorItem[] = [
  { slug: "green-roots-nursery" },
  { slug: "urban-flora-hub" },
  { slug: "botanical-haven" },
  { slug: "indore-greenhouse-co" },
  { slug: "evergreen-plant-oasis" },
];

async function fetchVerifiedVendors(): Promise<VendorItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${API_BASE_URL}/nursery-profile/all?status=approved`, {
      next: { revalidate: 7200 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const list = data.nurseries || data.vendors || (Array.isArray(data) ? data : []);
      if (Array.isArray(list) && list.length > 0) {
        return list
          .filter((v) => v.slug || v.businessName || v.name)
          .map((v) => ({
            slug:
              v.slug ||
              (v.businessName || v.name || "nursery")
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-"),
            updatedAt: v.updatedAt || v.createdAt,
          }));
      }
    }
  } catch {
    // Non-blocking graceful fallback
  }

  return FALLBACK_VENDORS;
}

export async function GET() {
  const vendors = await fetchVerifiedVendors();
  const fallbackDate = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${vendors
      .map((v) => {
        const loc = `${SITE_URL}/vendor/${v.slug}`;
        const lastmod = formatLastmod(v.updatedAt || fallbackDate);
        return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=7200, stale-while-revalidate=3600",
    },
  });
}
