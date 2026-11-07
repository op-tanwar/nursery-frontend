import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://urbannursery-neon.vercel.app"
).replace(/\/+$/, "");

const parsedSiteUrl = new URL(SITE_URL.startsWith("http") ? SITE_URL : `https://${SITE_URL}`);
const PRODUCTION_HOST = parsedSiteUrl.host;
const PRODUCTION_ORIGIN = parsedSiteUrl.origin;
const ENABLE_CUSTOM_DOMAIN_REDIRECT = process.env.ENABLE_CUSTOM_DOMAIN_REDIRECT === "true";

/**
 * Production-grade cookie removal helper.
 * Deletes authentication cookies and explicitly overwrites them with Max-Age=0
 * across all environment permutations (HTTP dev and HTTPS production).
 */
function clearAuthCookies(response: NextResponse): NextResponse {
  const isProd = process.env.NODE_ENV === "production";
  const cookieOptions = {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax" as const,
    secure: isProd,
  };

  // Delete primary and fallback cookie keys
  response.cookies.delete("token");
  response.cookies.delete("role");
  response.cookies.delete("planto_token");
  response.cookies.delete("planto_role");

  // Force overwrite with expired header
  response.cookies.set("token", "", cookieOptions);
  response.cookies.set("role", "", cookieOptions);
  response.cookies.set("planto_token", "", cookieOptions);
  response.cookies.set("planto_role", "", cookieOptions);

  return response;
}

interface DecodedTokenPayload {
  role?: string;
  id?: string;
  exp?: number;
}

/**
 * Safe, lightweight JWT payload extractor for Next.js Edge Runtime.
 * Decodes header.payload.signature using standard atob without node dependencies.
 * Automatically validates expiry timestamp (exp).
 */
function extractUserFromJwt(jwt: string): DecodedTokenPayload | null {
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);

    // Validate expiration
    if (payload.exp && typeof payload.exp === "number") {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (nowInSeconds >= payload.exp) {
        return null; // Expired token
      }
    }

    const role = payload.role || payload.user?.role;
    const id = payload.id || payload._id || payload.user?.id || payload.user?._id;

    return {
      role: typeof role === "string" ? role.toLowerCase() : undefined,
      id: typeof id === "string" ? id : undefined,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const host = request.headers.get("host") || request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.startsWith("192.168.");

  // ─────────────────────────────────────────────────────────────
  // 1. Host & Protocol Normalization (301 Permanent Redirects)
  // ─────────────────────────────────────────────────────────────
  if (ENABLE_CUSTOM_DOMAIN_REDIRECT && !isLocal && (request.method === "GET" || request.method === "HEAD")) {
    const isVercelPreview = host.endsWith(".vercel.app");
    const isHyphenDomain = host.includes("urban-nursery.in");
    const isNonCanonicalHost = host !== PRODUCTION_HOST && (isVercelPreview || isHyphenDomain);
    const isHttp = proto === "http";

    if (isNonCanonicalHost || (isHttp && host === PRODUCTION_HOST)) {
      const destinationUrl = `${PRODUCTION_ORIGIN}${pathname}${search}`;
      return NextResponse.redirect(destinationUrl, { status: 301 });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. URL Path Normalization (Lowercase, Trailing-Slash, Redundancy)
  // ─────────────────────────────────────────────────────────────
  const isInternalOrStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".");

  if (!isInternalOrStatic) {
    // A. Eliminate URL redundancy (/index.html or /index)
    if (pathname.endsWith("/index.html") || pathname === "/index") {
      const cleanPath = pathname.replace(/\/index(\.html)?$/, "") || "/";
      return NextResponse.redirect(new URL(`${cleanPath}${search}`, request.url), { status: 301 });
    }

    // B. Enforce trailing-slash uniformity (remove trailing slash except root)
    if (pathname !== "/" && pathname.endsWith("/")) {
      const cleanPath = pathname.slice(0, -1);
      return NextResponse.redirect(new URL(`${cleanPath}${search}`, request.url), { status: 301 });
    }

    // C. Enforce strict lowercase paths
    const lowerPath = pathname.toLowerCase();
    if (pathname !== lowerPath) {
      return NextResponse.redirect(new URL(`${lowerPath}${search}`, request.url), { status: 301 });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Environment & Query Header Shielding
  // ─────────────────────────────────────────────────────────────
  // A. Internal API routes: strictly shield from indexing (excluding public merchant feeds)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/feeds/")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  // ─────────────────────────────────────────────────────────────
  // 4. Authentication & Authorization Security Guards
  // ─────────────────────────────────────────────────────────────
  // Standardized cookie extraction: supports primary and fallback cookie keys
  const rawToken =
    request.cookies.get("token")?.value?.trim() ||
    request.cookies.get("planto_token")?.value?.trim() ||
    null;

  const rawRole =
    request.cookies.get("role")?.value?.trim()?.toLowerCase() ||
    request.cookies.get("planto_role")?.value?.trim()?.toLowerCase() ||
    null;

  // Extract JWT claims and verify signature structure + expiration
  const jwtPayload = rawToken ? extractUserFromJwt(rawToken) : null;
  const isTokenValid = Boolean(rawToken && jwtPayload);
  const token = isTokenValid ? rawToken : null;
  const userRole = jwtPayload?.role || rawRole || null;

  const isAuthPage = pathname === "/login" || pathname === "/register";

  // ─────────────────────────────────────────────────────────────
  // A. Guard Auth Pages (/login, /register)
  // ─────────────────────────────────────────────────────────────
  if (isAuthPage) {
    const hasExpiredParam = searchParams.has("expired");
    const errorParam = searchParams.get("error");
    const isUnauthorizedError = errorParam === "unauthorized" || errorParam === "session_expired";

    // Expired or unauthorized: clean any stale cookies
    if (hasExpiredParam || isUnauthorizedError) {
      const response = NextResponse.next();
      return clearAuthCookies(response);
    }

    // If authenticated user visits login/register, intelligently redirect them
    if (token && userRole) {
      const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect");
      if (
        callbackUrl &&
        callbackUrl.startsWith("/") &&
        !callbackUrl.startsWith("//") &&
        !callbackUrl.toLowerCase().includes("javascript:")
      ) {
        // Enforce role compatibility on callbackUrl
        const isCallbackAdmin = callbackUrl.startsWith("/admin");
        const isCallbackNursery = callbackUrl.startsWith("/nursery");

        if (isCallbackAdmin && userRole === "admin") {
          return NextResponse.redirect(new URL(callbackUrl, request.url));
        }
        if (isCallbackNursery && userRole === "nursery") {
          return NextResponse.redirect(new URL(callbackUrl, request.url));
        }
        if (!isCallbackAdmin && !isCallbackNursery) {
          return NextResponse.redirect(new URL(callbackUrl, request.url));
        }
      }

      // Default role portal redirect
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (userRole === "nursery") {
        return NextResponse.redirect(new URL("/nursery", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If token exists in cookies but failed JWT validation (expired/corrupted)
    if (rawToken && !isTokenValid) {
      const response = NextResponse.next();
      return clearAuthCookies(response);
    }

    return NextResponse.next();
  }

  // ─────────────────────────────────────────────────────────────
  // B. Protected Super Admin Routes (/admin & /admin/*)
  // ─────────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      const response = NextResponse.redirect(loginUrl);
      return clearAuthCookies(response);
    }

    // Role verification
    if (userRole !== "admin") {
      // Graceful fallback: Nursery vendors get redirected to their portal
      if (userRole === "nursery") {
        return NextResponse.redirect(new URL("/nursery", request.url));
      }
      // Non-admin / non-nursery users redirected to login with forbidden error
      const forbiddenUrl = new URL("/login", request.url);
      forbiddenUrl.searchParams.set("error", "forbidden");
      forbiddenUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(forbiddenUrl);
    }

    return NextResponse.next();
  }

  // ─────────────────────────────────────────────────────────────
  // C. Protected Nursery Merchant Routes (/nursery & /nursery/*)
  // ─────────────────────────────────────────────────────────────
  if (pathname.startsWith("/nursery")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      const response = NextResponse.redirect(loginUrl);
      return clearAuthCookies(response);
    }

    // Role verification
    if (userRole !== "nursery") {
      // Graceful fallback: Admins visiting nursery routes get redirected to admin portal
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      // Non-nursery customers get redirected to login with forbidden error
      const forbiddenUrl = new URL("/login", request.url);
      forbiddenUrl.searchParams.set("error", "forbidden");
      forbiddenUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(forbiddenUrl);
    }

    return NextResponse.next();
  }

  // ─────────────────────────────────────────────────────────────
  // 5. Header Injection for Crawl Hygiene & Staging Shields
  // ─────────────────────────────────────────────────────────────
  const response = NextResponse.next();

  // Preview / Staging Environment Shield
  const isPreviewEnv =
    process.env.VERCEL_ENV === "preview" ||
    process.env.APP_ENV === "staging" ||
    process.env.NEXT_PUBLIC_APP_ENV === "staging" ||
    host.includes("preview") ||
    host.includes("staging");

  if (isPreviewEnv) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }

  // Faceted navigation & Query parameter shield: allow follow, disallow indexing
  const hasFilterParams =
    searchParams.has("sort") ||
    searchParams.has("price") ||
    searchParams.has("search") ||
    searchParams.has("q") ||
    searchParams.has("sunlight") ||
    searchParams.has("water");

  if (hasFilterParams) {
    response.headers.set("X-Robots-Tag", "noindex, follow");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - fonts (public fonts)
     *
     * Guards /admin/:path*, /nursery/:path*, /login, /register, and root-level routes.
     * Note: (customer) is a route group, which produces root-anchored paths (e.g. /cart, /checkout).
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|fonts/).*)",
  ],
};
