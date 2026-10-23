import { SITE_URL } from "@/config/site";

export const dynamic = "force-static";
export const revalidate = 86400; // 24 hours

export async function GET() {
  const currentDate = new Date().toISOString().split("T")[0];

  const staticUrls = [
    { loc: `${SITE_URL}/`, priority: "1.0", changefreq: "daily" },
    { loc: `${SITE_URL}/shop`, priority: "0.9", changefreq: "daily" },
    { loc: `${SITE_URL}/shop/plants`, priority: "0.9", changefreq: "daily" },
    { loc: `${SITE_URL}/shop/pots`, priority: "0.8", changefreq: "weekly" },
    { loc: `${SITE_URL}/shop/accessories`, priority: "0.8", changefreq: "weekly" },
    { loc: `${SITE_URL}/shop/gardening-tools`, priority: "0.8", changefreq: "weekly" },
    { loc: `${SITE_URL}/shop/plant-care`, priority: "0.8", changefreq: "weekly" },
    { loc: `${SITE_URL}/shop/seeds-bulbs`, priority: "0.8", changefreq: "weekly" },
    { loc: `${SITE_URL}/shop/plant-stands-shelves`, priority: "0.8", changefreq: "weekly" },
    { loc: `${SITE_URL}/shop/artificial-dried-plants`, priority: "0.8", changefreq: "weekly" },
    { loc: `${SITE_URL}/shop/indoor-plants`, priority: "0.8", changefreq: "weekly" },
    { loc: `${SITE_URL}/shop/air-purifying`, priority: "0.8", changefreq: "weekly" },
    { loc: `${SITE_URL}/bulk-orders`, priority: "0.8", changefreq: "weekly" },
    { loc: `${SITE_URL}/apply`, priority: "0.8", changefreq: "weekly" },
    { loc: `${SITE_URL}/about`, priority: "0.7", changefreq: "monthly" },
    { loc: `${SITE_URL}/blogs`, priority: "0.7", changefreq: "weekly" },
    { loc: `${SITE_URL}/faq`, priority: "0.6", changefreq: "monthly" },
    { loc: `${SITE_URL}/contact`, priority: "0.6", changefreq: "monthly" },
    { loc: `${SITE_URL}/careers`, priority: "0.5", changefreq: "monthly" },
    { loc: `${SITE_URL}/legal/privacy-policy`, priority: "0.3", changefreq: "monthly" },
    { loc: `${SITE_URL}/legal/return-policy`, priority: "0.5", changefreq: "monthly" },
    { loc: `${SITE_URL}/legal/shipping-policy`, priority: "0.5", changefreq: "monthly" },
    { loc: `${SITE_URL}/legal/terms-of-service`, priority: "0.3", changefreq: "monthly" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
    },
  });
}
