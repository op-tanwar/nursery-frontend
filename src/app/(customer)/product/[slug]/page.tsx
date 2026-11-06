import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/services/productService";
import { getShopCategorySegment } from "@/utils/productUrl";
import { SITE_URL } from "@/config/site";

interface PageParams {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();

  // Deduplicated single-request fetch via React.cache()
  const product = await getProductBySlug(decodedSlug);
  if (!product) {
    return {
      title: "Product Not Found | Urban Nursery India",
      robots: { index: false, follow: false },
    };
  }

  const shopType = getShopCategorySegment(product.category);
  const canonicalUrl = `${SITE_URL}/shop/${shopType}/${product.slug}`;
  const title =
    product.metaTitle || `${product.name} | Buy Online | Urban Nursery India`;
  const description =
    product.metaDescription ||
    (product.description ? product.description.slice(0, 160) : null) ||
    `Buy ${product.name} online with Pan-India express delivery from certified local nurseries.`;

  const rawImage = product.coverImage?.url || product.images?.[0]?.url;
  const imageUrl =
    rawImage && typeof rawImage === "string" && rawImage.startsWith("http")
      ? rawImage
      : `${SITE_URL}/images/logo-new.png`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Urban Nursery",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function LegacyProductAliasPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();

  // Deduplicated single-request fetch via React.cache() - reuses cached result from generateMetadata
  const product = await getProductBySlug(decodedSlug);

  // If not found in catalog: serve true HTTP 404
  if (!product) {
    notFound();
  }

  // 🔄 Permanent 301 Redirect directly to canonical category product URL (Zero redirect chains)
  const shopType = getShopCategorySegment(product.category);
  permanentRedirect(`/shop/${shopType}/${product.slug}`);
}
