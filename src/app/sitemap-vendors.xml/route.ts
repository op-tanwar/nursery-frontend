import { SITE_URL } from "@/config/site";

export const dynamic = "force-dynamic";
export const revalidate = 7200; // 2 hours

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://planto-backend-mpdo.onrender.com/api/v1";

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
    const timeoutId = setTimeout(() => controller.abort(), 6000);

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
    const lastmod = v.updatedAt ? new Date(v.updatedAt).toISOString().split("T")[0] : fallbackDate;
    return `  <url>
    <loc>${SITE_URL}/vendor/${v.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=7200, stale-while-revalidate=3600",
    },
  });
}
