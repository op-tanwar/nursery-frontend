import { Suspense } from "react";
import type { Metadata } from "next";
import { getBlogsServer } from "@/services/server/blogServerService";
import BlogCatalogClient from "@/components/customer/blogs/BlogCatalogClient";
import { SITE_URL } from "@/config/site";

// ─── ISR Cache Config ─────────────────────────────────────────────────────
export const revalidate = 60;

// ─── Static Metadata ──────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Green Journal — Plant Care Guides & Stories | Urban Nursery",
  description:
    "Expert guides, propagation tips, interior styling ideas, and plant science curated by Urban Nursery horticulturists to help your urban jungle thrive in Indian climates.",
  openGraph: {
    title: "Green Journal | Urban Nursery Botanical Publication",
    description:
      "Expert plant care guides, propagation tips, and indoor gardening stories from India's certified nursery marketplace.",
    url: `${SITE_URL}/blogs`,
    siteName: "Urban Nursery",
    type: "website",
    images: [{ url: "/images/logo-new.png", width: 1200, height: 630, alt: "Urban Nursery Green Journal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Green Journal | Urban Nursery Botanical Publication",
    description: "Expert plant care guides and indoor gardening stories from Urban Nursery.",
    images: ["/images/logo-new.png"],
  },
  alternates: { canonical: `${SITE_URL}/blogs` },
};

// ─── Editorial Blog List Skeleton ─────────────────────────────────────────
function BlogListSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-12">
      {/* Featured skeleton */}
      <div className="bg-stone-100 rounded-3xl p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-96">
        <div className="lg:col-span-7 bg-stone-200 rounded-2xl h-full" />
        <div className="lg:col-span-5 space-y-4 py-4">
          <div className="h-4 bg-stone-200 rounded w-1/4" />
          <div className="h-8 bg-stone-200 rounded w-3/4" />
          <div className="h-4 bg-stone-200 rounded w-full" />
          <div className="h-4 bg-stone-200 rounded w-5/6" />
        </div>
      </div>
      {/* 3-col grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-stone-100 border border-stone-200 rounded-2xl p-4 space-y-4 h-[420px]">
            <div className="aspect-[16/10] bg-stone-200 rounded-xl" />
            <div className="h-4 bg-stone-200 rounded w-1/3" />
            <div className="h-6 bg-stone-200 rounded w-5/6" />
            <div className="h-4 bg-stone-200 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Blog List RSC Shell ──────────────────────────────────────────────────
export default async function BlogListingPage() {
  // Server-fetch first page of blogs (up to 12) for instant SSR
  const initialData = await getBlogsServer({ page: 1, limit: 12 });

  return (
    <div className="w-full min-h-screen bg-stone-50/30 text-stone-900 box-border overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <Suspense fallback={<BlogListSkeleton />}>
        <BlogCatalogClient
          initialBlogs={initialData?.blogs || []}
          initialTotalPages={initialData?.totalPages || 1}
          initialCurrentPage={initialData?.currentPage || 1}
        />
      </Suspense>
    </div>
  );
}
