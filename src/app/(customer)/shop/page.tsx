import { Suspense } from "react";
import type { Metadata } from "next";
import ShopCatalogClient from "@/components/customer/shop/ShopCatalogClient";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/config/site";
import { ProductCardSkeleton } from "@/components/customer/shop/ProductCardSkeleton";
import { getShopProductsServer } from "@/lib/server-api";

// ⚡ PERF: Incremental Static Regeneration (ISR) with 60s background revalidation
export const revalidate = 60;

interface ShopPageProps {
  searchParams: Promise<{
    type?: string;
    category?: string;
    subCategory?: string;
    search?: string;
    keyword?: string;
    sort?: string;
    page?: string;
    price?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

// ─── Dynamic Metadata for SEO ─────────────────────────────────────────────
// searchParams drives dynamic title for shared catalog links (/shop?type=Plants)
export async function generateMetadata({
  searchParams,
}: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const type = params.type || "All";
  const category = params.category;
  const search = params.search || params.keyword;
  const hasFilterParams = Boolean(
    search || params.sort || params.price || params.minPrice || params.maxPrice || (category && category !== "All")
  );

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

// ─── Shop Page Skeleton (Suspense fallback matching exact layout) ──────────
function ShopPageSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-6">
      {/* Hero Header Shimmer */}
      <div className="w-full h-44 sm:h-52 bg-gradient-to-br from-emerald-950/80 to-emerald-900/60 rounded-3xl" />

      {/* Category Pills Shimmer */}
      <div className="flex gap-2.5 overflow-hidden py-1">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-9 w-28 bg-slate-200/80 rounded-full shrink-0" />
        ))}
      </div>

      {/* Main Area: Sidebar + Grid */}
      <div className="flex items-start gap-6 lg:gap-8">
        {/* Sidebar Shimmer */}
        <div className="hidden lg:block w-64 xl:w-72 h-[600px] bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shrink-0">
          <div className="h-5 w-20 bg-slate-200 rounded-md" />
          <div className="h-px w-full bg-slate-100" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-7 w-full bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product Grid Area Shimmer */}
        <div className="flex-1 space-y-4">
          <div className="h-14 w-full bg-white rounded-2xl border border-slate-200/80" />
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3.5 sm:gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shop Page RSC Shell ──────────────────────────────────────────────────
export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;

  // 🚀 Fetch initial catalog on server (Fast, SEO-indexed, Cold-start tolerant)
  const catalogData = await getShopProductsServer({
    type: resolvedParams.type,
    category: resolvedParams.category,
    subCategory: resolvedParams.subCategory,
    search: resolvedParams.search || resolvedParams.keyword,
    sort: resolvedParams.sort,
    page: resolvedParams.page,
    minPrice: resolvedParams.minPrice,
    maxPrice: resolvedParams.maxPrice,
  });

  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    { name: "Shop", url: `${SITE_URL}/shop` },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <BreadcrumbJsonLd items={breadcrumbItems} />
        <Suspense fallback={<ShopPageSkeleton />}>
          <ShopCatalogClient
            initialType={resolvedParams.type}
            initialCategory={resolvedParams.category}
            initialSearch={resolvedParams.search || resolvedParams.keyword}
            initialProducts={catalogData.products}
            initialRawProducts={catalogData.rawProducts}
            initialTotalCount={catalogData.totalCount}
            initialFilteredCount={catalogData.filteredCount}
            initialPage={catalogData.page}
          />
        </Suspense>
      </div>
    </main>
  );
}
