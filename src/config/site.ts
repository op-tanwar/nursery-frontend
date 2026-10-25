/**
 * Site configuration and base URL resolution.
 * Centrally manages the authoritative domain for canonicals, sitemaps, OpenGraph, JSON-LD, and robots.
 */

export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://urbannursery-neon.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "Urban Nursery";

/**
 * Toggle flag to enable/disable 301 redirection from *.vercel.app to custom production domain.
 * Defaults to false until custom domain DNS & SSL are active.
 */
export const ENABLE_CUSTOM_DOMAIN_REDIRECT: boolean =
  process.env.ENABLE_CUSTOM_DOMAIN_REDIRECT === "true";

/**
 * Helper to construct an absolute URL on the authoritative domain.
 * @param path - relative path starting with or without a leading slash (e.g. "/shop", "about")
 */
export function absoluteUrl(path: string = ""): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}
