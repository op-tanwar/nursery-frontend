import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import {
  resolveProductServer,
  type ShopUrlType,
} from "@/services/server/productServerService";
import { SITE_URL } from "@/config/site";

interface PageParams {
  slug: string;
}

const CANDIDATE_TYPES: ShopUrlType[] = [
  "plants",
  "pots",
  "accessories",
  "gardening-tools",
  "plant-care",
  "seeds-bulbs",
  "plant-stands-shelves",
  "artificial-dried-plants",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();

  for (const shopType of CANDIDATE_TYPES) {
    const product = await resolveProductServer(shopType, decodedSlug);
    if (product) {
      return {
        title: `${product.name} | Urban Nursery India`,
        alternates: {
          canonical: `${SITE_URL}/shop/${shopType}/${product.slug}`,
        },
      };
    }
  }

  return {
    title: "Product Not Found | Urban Nursery India",
    robots: { index: false, follow: false },
  };
}

export default async function LegacyProductAliasPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();

  // Attempt resolving across catalog models
  for (const shopType of CANDIDATE_TYPES) {
    const product = await resolveProductServer(shopType, decodedSlug);
    if (product) {
      // 🔄 Permanent 301 Redirect directly to canonical product URL (Zero redirect chains)
      permanentRedirect(`/shop/${shopType}/${product.slug}`);
    }
  }

  // Not found in catalog: serve true HTTP 404
  notFound();
}
