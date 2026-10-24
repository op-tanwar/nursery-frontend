/**
 * Server-side blog data resolvers.
 * Uses native fetch() with Next.js ISR caching and resilient multi-endpoint fallback.
 */

import type { IBlog, AllBlogsResponse } from "@/types/blog.types";
export type { IBlog };

const getApiBaseUrl = (): string => {
  const resolved =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "https://nursery-backend-2rg3.onrender.com/api/v1";
  return resolved.replace(/\/+$/, "");
};

const FETCH_HEADERS: HeadersInit = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "UrbanNursery-NextJS-RSC/1.0",
};

// ─── Fetch paginated blog list ────────────────────────────────────────────
export async function getBlogsServer(params?: {
  page?: number;
  limit?: number;
  keyword?: string;
  category?: string;
}): Promise<{ blogs: IBlog[]; totalBlogs: number; totalPages: number; currentPage: number } | null> {
  const baseUrl = getApiBaseUrl();
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  qs.set("limit", String(params?.limit ?? 6));
  if (params?.keyword?.trim()) qs.set("keyword", params.keyword.trim());
  if (params?.category && params.category !== "All") qs.set("category", params.category);

  const endpoints = [
    `${baseUrl}/marketing/blogs?${qs.toString()}`,
    `${baseUrl}/blogs?${qs.toString()}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(endpoint, {
        headers: FETCH_HEADERS,
        next: { revalidate: 60, tags: ["blogs-list"] },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        const data: AllBlogsResponse = await res.json();
        return {
          blogs: data.blogs || data.data || [],
          totalBlogs: data.totalBlogs || data.count || 0,
          totalPages: data.totalPages || 1,
          currentPage: data.currentPage || 1,
        };
      }
    } catch (err) {
      console.warn(`[getBlogsServer] Failed at endpoint ${endpoint}:`, err);
    }
  }

  return null;
}

// ─── Fetch single blog by slug ────────────────────────────────────────────
export async function getBlogBySlugServer(slug: string): Promise<IBlog | null> {
  if (!slug) return null;
  const cleanSlug = decodeURIComponent(slug).trim();
  const encodedSlug = encodeURIComponent(cleanSlug);
  const baseUrl = getApiBaseUrl();

  const endpoints = [
    `${baseUrl}/marketing/blog/${encodedSlug}`,
    `${baseUrl}/blogs/slug/${encodedSlug}`,
    `${baseUrl}/blogs/${encodedSlug}`,
    `${baseUrl}/blog/${encodedSlug}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(endpoint, {
        headers: FETCH_HEADERS,
        next: { revalidate: 60, tags: [`blog-${cleanSlug}`] },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const blog = data?.blog || data?.data;
        if (blog && typeof blog === "object") {
          return blog;
        }
      }
    } catch (err) {
      console.warn(`[getBlogBySlugServer] Failed at endpoint ${endpoint}:`, err);
    }
  }

  return null;
}
