// ─── Force Dynamic Rendering (Disable Build-Time Cache) ──────────────────────
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveVendorServer } from "@/services/server/vendorServerService";
import VendorHeroSection from "@/components/customer/vendor/VendorHeroSection";
import VendorCatalogClient from "@/components/customer/vendor/VendorCatalogClient";
import { LocalBusinessJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/config/site";

// ─── Page Params ──────────────────────────────────────────────────────────
interface PageParams {
  slug: string;
}

// ─── Dynamic Metadata ─────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();
  const vendor = await resolveVendorServer(decodedSlug);

  if (!vendor) {
    return {
      title: "Nursery Profile Not Found | Urban Nursery India",
      robots: { index: false, follow: false },
    };
  }

  const rawVendor = vendor as any;
  const name = vendor?.name || vendor?.businessName || "Certified Nursery";
  const bio = vendor?.description || vendor?.bio || "";
  const location = rawVendor?.businessAddress?.city || rawVendor?.city || vendor?.location || "Indore, Madhya Pradesh";
  const title = `${name} | Certified Nursery Partner — Urban Nursery India`;
  const description = bio
    ? `${bio.slice(0, 140)}... Fresh live plants from ${name} in ${location}. Pan-India courier delivery with 24-hour guarantee.`
    : `Shop live indoor plants, ceramic pots & garden supplies from ${name} in ${location}. Certified greenhouse partner on Urban Nursery India.`;

  const imageUrl = vendor?.avatar?.startsWith("http") ? vendor.avatar : `${SITE_URL}/images/logo-new.png`;
  const canonicalUrl = `${SITE_URL}/vendor/${vendor?.slug || decodedSlug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Urban Nursery",
      type: "profile",
      images: [{ url: imageUrl, width: 400, height: 400, alt: name }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

// ─── Vendor Page Skeleton ─────────────────────────────────────────────────
function VendorPageSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50/60 pb-16 font-sans animate-pulse">
      {/* Hero shimmer */}
      <div className="h-64 bg-gradient-to-r from-emerald-50 to-emerald-100/60 border-b border-emerald-100/60" />
      {/* Stats grid shimmer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 border border-slate-200/60" />
          ))}
        </div>
      </div>
      {/* Catalog grid shimmer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="h-16 bg-slate-100 rounded-2xl mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-72 bg-slate-100 rounded-2xl border border-slate-200/60" />
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Vendor Page RSC Shell ────────────────────────────────────────────────
export default async function VendorPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();

  const vendor = await resolveVendorServer(decodedSlug);

  // 🛡️ Serve true HTTP 404 via notFound() rather than 200 OK soft 404
  if (!vendor) {
    notFound();
  }

  const vendorName = vendor?.name || vendor?.businessName || "Certified Nursery";
  const canonicalUrl = `${SITE_URL}/vendor/${vendor?.slug || decodedSlug}`;

  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    { name: "Shop", url: `${SITE_URL}/shop` },
    { name: vendorName, url: canonicalUrl },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <LocalBusinessJsonLd
        name={vendorName}
        description={vendor?.description || vendor?.bio}
        slug={vendor?.slug || decodedSlug}
        city={(vendor as any)?.businessAddress?.city || (vendor as any)?.city || (vendor?.location?.includes(",") ? vendor.location.split(",")[0].trim() : vendor?.location) || "Indore"}
        state={(vendor as any)?.businessAddress?.state || (vendor as any)?.state || (vendor?.location?.includes(",") ? vendor.location.split(",")[1].trim() : "Madhya Pradesh")}
        postalCode={(vendor as any)?.businessAddress?.pincode || (vendor as any)?.pincode || "452001"}
        avatar={vendor?.avatar}
      />
      <Suspense fallback={<VendorPageSkeleton />}>
        <main className="min-h-screen bg-slate-50/60 pb-16 font-sans">
          {/* ─── Static RSC: Hero + Stats + Guarantee — zero client JS ─── */}
          <VendorHeroSection vendor={vendor} />

          {/* ─── Interactive RSC→Client boundary: Filter/Search/Sort/Grid ─── */}
          <VendorCatalogClient
            vendorName={vendorName}
            vendorSlug={vendor?.slug || decodedSlug}
            products={vendor?.products || []}
          />
        </main>
      </Suspense>
    </>
  );
}