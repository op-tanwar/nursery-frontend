import { SITE_URL } from "@/config/site";

export const dynamic = "force-dynamic";
export const revalidate = 7200; // 2 hours

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://planto-backend-mpdo.onrender.com/api/v1";

interface GuideItem {
  slug: string;
  updatedAt?: string;
}

const FALLBACK_GUIDES: GuideItem[] = [
  { slug: "how-to-care-for-indoor-snake-plants" },
  { slug: "monstera-deliciosa-watering-light-guide" },
  { slug: "best-fertilizers-for-tropical-foliage" },
  { slug: "preventing-root-rot-in-ceramic-pots" },
  { slug: "top-10-air-purifying-plants-for-indian-homes" },
  { slug: "seasonal-balcony-gardening-calendar-india" },
];

async function fetchCareGuides(): Promise<GuideItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${API_BASE_URL}/blogs?limit=50`, {
      next: { revalidate: 7200 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const list = data.blogs || (Array.isArray(data) ? data : []);
      if (Array.isArray(list) && list.length > 0) {
        return list
          .filter((b) => b.slug || b.title)
          .map((b) => ({
            slug:
              b.slug ||
              b.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-"),
            updatedAt: b.updatedAt || b.createdAt,
          }));
      }
    }
  } catch {
    // Non-blocking graceful fallback
  }

  return FALLBACK_GUIDES;
}

export async function GET() {
  const guides = await fetchCareGuides();
  const fallbackDate = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${guides
  .map((g) => {
    const lastmod = g.updatedAt ? new Date(g.updatedAt).toISOString().split("T")[0] : fallbackDate;
    return `  <url>
    <loc>${SITE_URL}/blogs/${g.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
