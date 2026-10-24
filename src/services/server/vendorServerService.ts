/**
 * Server-side vendor profile resolver.
 * Dynamically queries nursery public profiles from MongoDB backend via native fetch() with zero static cache.
 */

import type { IVendorDetails } from "@/types/vendor.types";

export type { IVendorDetails };

// ─── Candidate API Base URLs Resolver ─────────────────────────────────────────
function getCandidateApiUrls(): string[] {
  const endpoints: string[] = [];
  const add = (url?: string | null) => {
    if (!url) return;
    let clean = url.trim().replace(/\/+$/, "");
    if (!clean.endsWith("/api/v1") && !clean.endsWith("/api")) {
      clean = `${clean}/api/v1`;
    }
    if (!endpoints.includes(clean)) {
      endpoints.push(clean);
    }
  };

  add(process.env.INTERNAL_API_URL);
  add(process.env.NEXT_PUBLIC_API_URL);
  add("https://nursery-backend-2rg3.onrender.com/api/v1");
  add("http://localhost:4000/api/v1");
  add("http://127.0.0.1:4000/api/v1");

  return endpoints;
}

function sanitizeVendor(vendor: any): IVendorDetails {
  return {
    ...vendor,
    name: vendor.name || vendor.businessName || "Certified Nursery",
    description: vendor.description || vendor.bio || "Certified plant nursery.",
    bio: vendor.bio || vendor.description || "Certified plant nursery.",
    rating: vendor.rating ?? vendor.stats?.lifetimeRating ?? 4.8,
    avatar:
      vendor.avatar && typeof vendor.avatar === "string" && vendor.avatar.startsWith("http")
        ? vendor.avatar
        : "/images/logo-new.png",
    products: Array.isArray(vendor.products) ? vendor.products : [],
  } as IVendorDetails;
}

export async function resolveVendorServer(slug: string): Promise<IVendorDetails | null> {
  if (!slug) return null;

  // 1. Properly decode the incoming slug or MongoDB _id string
  const decodedSlug = decodeURIComponent(slug).trim();
  const candidates = getCandidateApiUrls();

  for (const baseUrl of candidates) {
    const targetUrl = `${baseUrl}/nursery-profile/vendor/${encodeURIComponent(decodedSlug)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(targetUrl, {
        cache: "force-cache" === "force-cache" ? "no-store" : "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.success && data?.vendor) {
          return sanitizeVendor(data.vendor);
        }
      }
    } catch {
      // Endpoint unreachable or timed out, attempt next candidate
    }
  }

  return null;
}
