import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://urbannursery.vercel.app"
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
  response.cookies.delete("token");
  response.cookies.delete("role");

  const isProd = process.env.NODE_ENV === "production";
  const cookieOptions = {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax" as const,
    secure: isProd,
    httpOnly: false,
  };

  response.cookies.set("token", "", cookieOptions);
  response.cookies.set("role", "", cookieOptions);

  return response;
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
  const token = request.cookies.get("token")?.value?.trim() || null;
  const userRole = request.cookies.get("role")?.value?.trim() || null;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Guard Auth Pages (/login, /register)
  if (isAuthPage) {
    const hasExpiredParam = searchParams.has("expired");
    const hasErrorParam = searchParams.has("error");

    if (hasExpiredParam || hasErrorParam) {
      const response = NextResponse.next();
      return clearAuthCookies(response);
    }

    if (token && userRole) {
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (userRole === "nursery") {
        return NextResponse.redirect(new URL("/nursery", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (token || userRole) {
      const response = NextResponse.next();
      return clearAuthCookies(response);
    }

    return NextResponse.next();
  }

  // Protected Super Admin Routes (/admin)
  if (pathname.startsWith("/admin")) {
    if (!token || !userRole) {
      const redirectUrl = new URL("/login?error=unauthorized", request.url);
      const response = NextResponse.redirect(redirectUrl);
      return clearAuthCookies(response);
    }

    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // Protected Nursery Routes (/nursery)
  if (pathname.startsWith("/nursery")) {
    if (!token || !userRole) {
      const redirectUrl = new URL("/login?error=unauthorized", request.url);
      const response = NextResponse.redirect(redirectUrl);
      return clearAuthCookies(response);
    }

    if (userRole !== "nursery") {
      return NextResponse.redirect(new URL("/", request.url));
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
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|fonts/).*)",
  ],
};