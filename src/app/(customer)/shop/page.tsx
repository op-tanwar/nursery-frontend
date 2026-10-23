import { Suspense } from "react";
import type { Metadata } from "next";
import ShopCatalogClient from "@/components/customer/shop/ShopCatalogClient";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/config/site";

// ─── Dynamic Metadata for SEO ─────────────────────────────────────────────
// searchParams drives dynamic title for shared catalog links (/shop?type=Plants)
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; category?: string; search?: string; sort?: string; price?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const type = params.type || "All";
  const category = params.category;
  const search = params.search;
  const hasFilterParams = Boolean(search || params.sort || params.price || (category && category !== "All"));

  const titleMap: Record<string, string> = {
    Plants: "Buy Live Plants Online India — Fresh From Certified Nurseries",
    Pots: "Buy Pots & Ceramic Planters Online India",
    Accessories: "Plant Accessories & Decor",
    "Gardening Tools": "Gardening Tools & Equipment Online",
    "Plant Care": "Organic Plant Care & Fertilizers",
    "Seeds & Bulbs": "Seeds & Flower Bulbs Online",
    "Plant Stands": "Plant Stands & Multi-Tier Shelves",
    "Artificial & Dried Plants": "Artificial & Dried Plants",
    All: "Buy Live Plants Online India | Urban Nursery",
  };

  const baseTitle = titleMap[type] || "Buy Live Plants Online India | Urban Nursery";
  const fullTitle = search
    ? `Search: "${search}" | Urban Nursery`
    : category
      ? `${category} — ${baseTitle} | Urban Nursery`
      : `${baseTitle} | Urban Nursery India`;

  const description = search
    ? `Search results for "${search}" on Urban Nursery — India's certified plant marketplace. Safe packaging and 24-hour botanical guarantee.`
    : `Shop ${type === "All" ? "1,200+ botanist-verified live plants, ceramic pots & garden essentials" : type.toLowerCase()} from local nursery growers with pan-India express delivery.`;

  return {
    title: fullTitle,
    description,
    // 🛡️ FACETED NAVIGATION STRATEGY: Disallow indexing of filtered/sorted/searched queries while keeping links crawlable (follow: true)
    robots: hasFilterParams
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url: `${SITE_URL}/shop`,
      siteName: "Urban Nursery",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/shop`,
    },
  };
}

// ─── Shop Page Skeleton (Suspense fallback) ───────────────────────────────
function ShopPageSkeleton() {
  return (
    <main className="min-h-screen bg-background pt-28 pb-16 px-4 sm:px-6 animate-pulse">
      <div className="w-full max-w-[1200px] mx-auto">
        {/* Filter panel shimmer */}
        <div className="bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary rounded-2xl p-6 mb-10 h-[160px]" />
        {/* Grid shimmer */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-[360px] bg-slate-100 rounded-2xl border border-slate-200/60"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Shop Page RSC Shell ──────────────────────────────────────────────────
export default function ShopPage() {
  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    { name: "Shop", url: `${SITE_URL}/shop` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <Suspense fallback={<ShopPageSkeleton />}>
        <ShopCatalogClient />
      </Suspense>
    </>
  );
}
