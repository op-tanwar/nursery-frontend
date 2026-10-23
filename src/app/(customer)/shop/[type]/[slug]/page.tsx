import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  resolveProductServer,
  type ShopUrlType,
  TYPE_LABELS,
  FALLBACK_EMOJI,
} from "@/services/server/productServerService";
import ProductDetailClient from "@/components/customer/shop/ProductDetailClient";
import { ProductJsonLd, BreadcrumbJsonLd, FaqPageJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/config/site";

// ─── Valid URL types ──────────────────────────────────────────────────────
const VALID_SHOP_TYPES: ShopUrlType[] = [
  "plants", "pots", "accessories", "gardening-tools",
  "plant-care", "seeds-bulbs", "plant-stands-shelves", "artificial-dried-plants",
];

// ─── ISR Cache Config ─────────────────────────────────────────────────────
export const revalidate = 120;

// ─── Page Params ──────────────────────────────────────────────────────────
interface PageParams {
  type: string;
  slug: string;
}

// ─── Dynamic Metadata ─────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { type, slug } = await params;
  const shopType = type?.toLowerCase() as ShopUrlType;

  if (!VALID_SHOP_TYPES.includes(shopType)) {
    return {
      title: "Product Not Found | Urban Nursery India",
      robots: { index: false, follow: false },
    };
  }

  // Try to fetch product data for rich metadata
  const product = await resolveProductServer(shopType, slug);

  if (!product) {
    const typeLabel = TYPE_LABELS[shopType] || "Product";
    return {
      title: `${typeLabel} | Buy Online | Urban Nursery India`,
      description: `Browse premium ${typeLabel.toLowerCase()} from certified local nurseries across India on Urban Nursery.`,
      alternates: {
        canonical: `${SITE_URL}/shop/${shopType}/${slug}`,
      },
    };
  }

  const title = product.metaTitle || `${product.name} - Buy Fresh Live Plants Online | Urban Nursery India`;
  const description =
    product.metaDescription ||
    `${product.name} grown by ${product.vendor}. Certified nursery health, transit-safe eco packaging, and 24-hour botanical replacement guarantee.`;

  const imageUrl =
    product.emoji?.startsWith("http") ? product.emoji : `${SITE_URL}/images/logo-new.png`;

  const canonicalUrl = `${SITE_URL}/shop/${shopType}/${product.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Urban Nursery",
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    // 🛡️ CANONICAL ENGINE: Self-references the clean primary parent URL without variant query parameters
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

// ─── PDP Loading Skeleton ─────────────────────────────────────────────────
function PDPSkeleton() {
  return (
    <main className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-6 animate-pulse">
      <div className="w-full max-w-[1100px] mx-auto">
        <div className="h-4 w-40 bg-slate-200 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="md:col-span-5 aspect-square bg-slate-100 rounded-2xl border border-slate-200/60" />
          <div className="md:col-span-7 space-y-5">
            <div className="h-4 w-20 bg-slate-200 rounded" />
            <div className="h-8 w-2/3 bg-slate-200 rounded" />
            <div className="h-4 w-1/3 bg-slate-100 rounded" />
            <div className="h-10 w-1/4 bg-slate-200 rounded" />
            <div className="h-20 w-full bg-slate-100 rounded" />
            <div className="h-12 w-1/2 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── PDP RSC Shell ────────────────────────────────────────────────────────
export default async function ShopItemDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { type, slug } = await params;
  const shopType = type?.toLowerCase() as ShopUrlType;

  if (!VALID_SHOP_TYPES.includes(shopType)) {
    notFound();
  }

  // Server-fetch the product
  const initialProduct = await resolveProductServer(shopType, slug);

  // Structured Data Preparation
  const categoryLabel = TYPE_LABELS[shopType] || "Plants";
  const canonicalUrl = `${SITE_URL}/shop/${shopType}/${slug}`;

  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    { name: "Shop", url: `${SITE_URL}/shop` },
    { name: categoryLabel, url: `${SITE_URL}/shop/${shopType}` },
    { name: initialProduct?.name || slug, url: canonicalUrl },
  ];

  const pdpFaqs = initialProduct
    ? [
        {
          question: `How is ${initialProduct.name} packaged for courier delivery?`,
          answer:
            "Every plant is potted in nutrient-rich organic soil, fitted with a root moisture retention wrap and corrugated stem brace, and shipped in a rigid ventilated box to eliminate transit shock.",
        },
        {
          question: `What is the return policy for ${initialProduct.name}?`,
          answer:
            "We provide a 24-Hour Botanical Transit Guarantee. If this plant arrives damaged, notify our support team within 24 hours of delivery for a free immediate replacement.",
        },
        {
          question: `Where does ${initialProduct.name} ship from?`,
          answer: `This specimen is freshly dispatched from ${initialProduct.vendor || "certified greenhouse partner nurseries"} with direct Pan-India courier pickup.`,
        },
      ]
    : [];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {initialProduct && (
        <>
          <ProductJsonLd
            id={initialProduct.id}
            name={initialProduct.name}
            description={initialProduct.description}
            images={initialProduct.galleryImages || [initialProduct.emoji]}
            sku={initialProduct.id}
            category={initialProduct.category || categoryLabel}
            price={initialProduct.price}
            originalPrice={initialProduct.originalPrice}
            stock={typeof initialProduct.stock === "number" ? initialProduct.stock : 1}
            vendorName={initialProduct.vendor}
            vendorSlug={initialProduct.vendorSlug}
            url={canonicalUrl}
            rating={initialProduct.rating}
            reviewCount={initialProduct.reviews}
            verifiedReviews={initialProduct.verifiedReviews}
          />
          <FaqPageJsonLd items={pdpFaqs} />
        </>
      )}

      <Suspense fallback={<PDPSkeleton />}>
        <ProductDetailClient
          initialProduct={initialProduct}
          shopType={shopType}
          urlSlug={slug}
        />
      </Suspense>
    </>
  );
}
