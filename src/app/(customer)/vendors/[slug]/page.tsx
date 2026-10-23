import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { SITE_URL } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    robots: { index: false, follow: true },
    alternates: {
      canonical: `${SITE_URL}/vendor/${slug}`,
    },
  };
}

export default async function VendorsAliasRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/vendor/${slug}`);
}
