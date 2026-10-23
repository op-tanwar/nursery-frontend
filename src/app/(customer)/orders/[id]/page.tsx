// ─── Force Dynamic Rendering (Disable Build-Time Cache) ──────────────────────
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = "force-no-store";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import { PackageX, ArrowLeft, ShoppingBag } from "lucide-react";
import OrderDetailsClient from "./OrderDetailsClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

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
  add("https://planto-backend-mpdo.onrender.com/api/v1");
  add("http://localhost:4000/api/v1");
  add("http://127.0.0.1:4000/api/v1");

  return endpoints;
}

// ─── 1. Metadata Generation with Dynamic Param Resolution ───────────────────
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id || "");
    if (!isValidObjectId) {
      return {
        title: "Order Not Found | Urban Nursery India",
        robots: { index: false, follow: false },
      };
    }

    const shortId = id.slice(-8).toUpperCase();

    return {
      title: `Order #${shortId} | Urban Nursery India`,
      description:
        "View full details, delivery status, and tracking information for your Urban Nursery plant order.",
      robots: { index: false, follow: false },
    };
  } catch {
    return {
      title: "Order Details | Urban Nursery India",
      description: "View full details and tracking information for your plant order.",
      robots: { index: false, follow: false },
    };
  }
}

// ─── 2. RSC Dynamic Data Fetching directly against live MongoDB backend ───────
async function fetchOrderServer(id: string): Promise<{ status: number; order: any | null; isExplicitNotFound: boolean }> {
  const candidates = getCandidateApiUrls();
  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    const cookieStore = await cookies();
    const headersList = await headers();
    const cookieStr = cookieStore.toString();
    if (cookieStr) reqHeaders["Cookie"] = cookieStr;
    const authHeader = headersList.get("authorization");
    if (authHeader) reqHeaders["Authorization"] = authHeader;
  } catch {
    // Safe non-blocking execution if cookies/headers cannot be resolved
  }

  let explicit404Encountered = false;

  for (const baseUrl of candidates) {
    const targetUrl = `${baseUrl}/orders/single/${id}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(targetUrl, {
        headers: reqHeaders,
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const payload = await res.json().catch(() => null);
        if (payload?.success && payload?.order) {
          return { status: 200, order: payload.order, isExplicitNotFound: false };
        }
      } else if (res.status === 404) {
        explicit404Encountered = true;
      }
    } catch {
      // Candidate unreachable or timed out, attempt next endpoint
    }
  }

  return { status: 404, order: null, isExplicitNotFound: explicit404Encountered };
}

// ─── 3. Clean Standard 404 UI ────────────────────────────────────────────────
function FriendlyOrderNotFoundUI({
  id,
  message,
}: {
  id?: string;
  message?: string;
}) {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-20 text-center space-y-6 antialiased">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-14 space-y-5 shadow-xs">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
          <PackageX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Order Not Found
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {message ||
              (id
                ? `Order #${id} could not be located in our records. Please verify the URL or check your active orders.`
                : "The requested order record could not be found.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/orders/me"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs inline-flex items-center gap-2 no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </Link>
          <Link
            href="/shop"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition shadow-xs inline-flex items-center gap-2 no-underline"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── 4. Main Next.js App Router Page Shell ───────────────────────────────────
export default async function OrderDetailPage({ params }: PageProps) {
  try {
    // Next.js 15 Async Route Params properly awaited
    const resolvedParams = await params;
    const rawId = resolvedParams?.id || (resolvedParams as any)?.orderId || "";
    const id = String(rawId).trim();

    // Validate 24-character hexadecimal ObjectId before database querying
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isValidObjectId) {
      // 🛡️ Serve true HTTP 404 via notFound() rather than 200 OK soft 404
      notFound();
    }

    // Dynamic live server-side data fetching directly from MongoDB
    const { order, isExplicitNotFound } = await fetchOrderServer(id);

    // If order is explicitly confirmed missing by the database, serve true HTTP 404
    if (isExplicitNotFound) {
      notFound();
    }

    return (
      <OrderDetailsClient
        id={id}
        orderId={id}
        initialOrder={order}
      />
    );
  } catch (error: any) {
    // 🛡️ Ensure true HTTP 404 isn't swallowed into a soft 200 OK
    if (error?.digest === "NEXT_NOT_FOUND" || error?.message === "NEXT_NOT_FOUND" || error?.digest?.startsWith?.("NEXT_NOT_FOUND")) {
      throw error;
    }
    console.error("[RSC Order Page] Fatal rendering exception caught:", error?.message || error);
    return (
      <FriendlyOrderNotFoundUI message="An unexpected error occurred while loading this order. Please try again later." />
    );
  }
}
