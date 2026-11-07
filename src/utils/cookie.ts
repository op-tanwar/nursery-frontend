/**
 * ======================================================================
 * 🍪 SECURE AUTHENTICATION COOKIE UTILITIES
 * ======================================================================
 * Manages client-side browser cookies for Next.js 15/16 Edge Middleware
 * and Server Components compatibility.
 *
 * Guarantees:
 * - Proper Path=/ attribute
 * - SameSite=Lax
 * - Secure flag enabled automatically on HTTPS (production/Vercel)
 * - 7-day TTL alignment with backend JWT expiration
 * - Multi-key support (standard 'token' & 'planto_token')
 * ======================================================================
 */

export const AUTH_COOKIE_NAME = "token";
export const ROLE_COOKIE_NAME = "role";
export const FALLBACK_AUTH_COOKIE_NAME = "planto_token";
export const FALLBACK_ROLE_COOKIE_NAME = "planto_role";

export const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days (604800s)

/**
 * Persists JWT and user role into browser cookies with production-grade security attributes.
 * This enables Next.js Edge Middleware to inspect authentication state on server requests.
 */
export function setAuthCookies(token: string, role?: string): void {
  if (typeof document === "undefined" || !token) return;

  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isHttps ? "; Secure" : "";
  const cookieBase = `path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secureFlag}`;

  // 1. Write primary auth token
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieBase}`;
  // 2. Write compatibility fallback token
  document.cookie = `${FALLBACK_AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieBase}`;

  if (role) {
    const normalizedRole = role.toLowerCase().trim();
    // 3. Write primary role cookie
    document.cookie = `${ROLE_COOKIE_NAME}=${encodeURIComponent(normalizedRole)}; ${cookieBase}`;
    // 4. Write compatibility fallback role cookie
    document.cookie = `${FALLBACK_ROLE_COOKIE_NAME}=${encodeURIComponent(normalizedRole)}; ${cookieBase}`;
  }
}

/**
 * Idempotently purges all authentication and authorization cookies from the browser.
 */
export function clearClientAuthCookies(): void {
  if (typeof document === "undefined") return;

  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isHttps ? "; Secure" : "";
  const expiredBase = `; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;

  document.cookie = `${AUTH_COOKIE_NAME}=${expiredBase}`;
  document.cookie = `${FALLBACK_AUTH_COOKIE_NAME}=${expiredBase}`;
  document.cookie = `${ROLE_COOKIE_NAME}=${expiredBase}`;
  document.cookie = `${FALLBACK_ROLE_COOKIE_NAME}=${expiredBase}`;
}

/**
 * Safe accessor to read a specific cookie value by key in client runtime.
 */
export function getClientCookie(name: string): string | null {
  if (typeof document === "undefined" || !document.cookie) return null;

  const cookies = document.cookie.split(";");
  for (const rawCookie of cookies) {
    const trimmed = rawCookie.trim();
    const separatorIdx = trimmed.indexOf("=");
    if (separatorIdx === -1) continue;

    const key = trimmed.slice(0, separatorIdx).trim();
    if (key === name) {
      const val = trimmed.slice(separatorIdx + 1);
      try {
        return decodeURIComponent(val);
      } catch {
        return val;
      }
    }
  }

  return null;
}
