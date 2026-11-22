/**
 * 🗺️ Urban Nursery Technical SEO Sitemap Utilities
 * Implements strict XML escaping according to the sitemaps.org protocol,
 * ISO date formatting, slug sanitization, and cold-start resilient fetch.
 */

import { SITE_URL } from "@/config/site";

export { SITE_URL };

/**
 * Strictly escapes XML special characters to guarantee valid XML sitemap syntax.
 * Unescaped '&', '<', '>', '"', or '\'' in URLs breaks XML parsing and causes
 * Google Search Console "Couldn't fetch" errors.
 */
export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Returns a W3C Datetime string (YYYY-MM-DD) compliant with sitemaps.org schema.
 * Tolerates null, undefined, invalid date strings without throwing RangeError.
 */
export function formatLastmod(dateInput?: string | Date | null): string {
  const fallback = new Date().toISOString().split("T")[0];
  if (!dateInput) return fallback;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return fallback;
    return d.toISOString().split("T")[0];
  } catch {
    return fallback;
  }
}

/**
 * Normalizes a URL slug by stripping invalid characters and trimming hyphens.
 */
export function sanitizeSlug(slug?: string, fallback?: string): string {
  const val = (slug || fallback || "").toLowerCase().trim();
  return val
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolves backend API Base URL with production fallbacks.
 */
export function getApiBaseUrl(): string {
  const resolved =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "https://nursery-backend-2rg3.onrender.com/api/v1";
  return resolved.replace(/\/+$/, "");
}

/**
 * Standard fetch headers for sitemap crawler requests
 */
export const SITEMAP_FETCH_HEADERS: HeadersInit = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "UrbanNursery-SitemapGenerator/2.0 (NextJS-AppRouter)",
};

/**
 * Resilient fetch with generous timeout and automatic retry logic for backend cold starts.
 * Total execution time is strictly budgeted across retries to prevent Vercel 504 timeouts.
 */
export async function fetchWithResilience<T>(
  url: string,
  totalTimeoutMs: number = 15000,
  maxRetries: number = 2
): Promise<T | null> {
  const deadline = Date.now() + totalTimeoutMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const remainingTime = deadline - Date.now();
    if (remainingTime < 1000) break;

    // Allocate up to 8s per attempt, within remaining budget
    const attemptTimeout = Math.min(8000, remainingTime);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), attemptTimeout);

    try {
      if (attempt > 0) {
        // Backoff between retries (e.g., 400ms)
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      const res = await fetch(url, {
        headers: SITEMAP_FETCH_HEADERS,
        next: { revalidate: 3600 },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        return data as T;
      }

      // Retry on 502/503/504 (gateway / cold-start wakeups)
      if ([502, 503, 504].includes(res.status) && attempt < maxRetries) {
        continue;
      }

      // 404 or other 4xx is non-retryable
      return null;
    } catch {
      clearTimeout(timer);
      if (attempt < maxRetries && Date.now() < deadline - 1000) {
        continue;
      }
    }
  }

  return null;
}
