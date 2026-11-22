import { SITE_URL } from "@/config/site";
import {
  escapeXml,
  formatLastmod,
  sanitizeSlug,
  getApiBaseUrl,
  fetchWithResilience,
} from "@/utils/sitemap";

export const revalidate = 3600; // 1 hour edge cache

interface GuideSitemapItem {
  slug: string;
  updatedAt?: string;
}

// Fallback seed catalog for zero-failure guarantee if backend cold-starts or blog collection is empty
const FALLBACK_GUIDES: GuideSitemapItem[] = [
  { slug: "how-to-care-for-indoor-snake-plants" },
  { slug: "monstera-deliciosa-watering-light-guide" },
  { slug: "best-fertilizers-for-tropical-foliage" },
  { slug: "preventing-root-rot-in-ceramic-pots" },
  { slug: "top-10-air-purifying-plants-for-indian-homes" },
  { slug: "seasonal-balcony-gardening-calendar-india" },
];

async function fetchCareGuides(): Promise<GuideSitemapItem[]> {
  const baseUrl = getApiBaseUrl();
  const guides: GuideSitemapItem[] = [];
  const seenSlugs = new Set<string>();

  // Candidates endpoints for blog / care guides retrieval
  const candidateEndpoints = [
    `${baseUrl}/blogs?limit=100`,
    `${baseUrl}/marketing/blogs?limit=100`,
  ];

  for (const endpoint of candidateEndpoints) {
    try {
      // 15000ms generous server timeout with retry logic
      const data = await fetchWithResilience<any>(endpoint, 15000, 2);
      const list = data?.blogs || (Array.isArray(data) ? data : data?.data || []);

      if (Array.isArray(list) && list.length > 0) {
        for (const b of list) {
          // Strictly exclude unpublished articles if flag is present
          if (b.isPublished === false) continue;

          const rawSlug = b.slug || b.title;
          const slug = sanitizeSlug(rawSlug);
          if (!slug || seenSlugs.has(slug)) continue;
          seenSlugs.add(slug);

          guides.push({
            slug,
            updatedAt: b.updatedAt || b.createdAt,
          });
        }

        // If guides were resolved successfully, avoid redundant candidate querying
        if (guides.length > 0) {
          break;
        }
      }
    } catch (err) {
      console.warn(`[sitemap-care-guides] Non-blocking notice for ${endpoint}:`, err);
    }
  }

  return guides.length > 0 ? guides : FALLBACK_GUIDES;
}

export async function GET() {
  try {
    const guides = await fetchCareGuides();
    const fallbackDate = new Date().toISOString().split("T")[0];

    // Always include authoritative blogs root index
    const blogsIndexLoc = `${SITE_URL}/blogs`;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(blogsIndexLoc)}</loc>
    <lastmod>${fallbackDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
${guides
  .map((g) => {
    const loc = `${SITE_URL}/blogs/${g.slug}`;
    const lastmod = formatLastmod(g.updatedAt || fallbackDate);
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
    console.error("[sitemap-care-guides] Critical route recovery handler:", err);
    const currentDate = new Date().toISOString().split("T")[0];
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(`${SITE_URL}/blogs`)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
${FALLBACK_GUIDES.map(
  (g) => `  <url>
    <loc>${escapeXml(`${SITE_URL}/blogs/${g.slug}`)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
