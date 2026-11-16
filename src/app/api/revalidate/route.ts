import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

const REVALIDATION_SECRET =
  process.env.REVALIDATION_SECRET_TOKEN ||
  process.env.REVALIDATE_SECRET ||
  "planto_secure_revalidate_token_2026";

function isAuthorized(request: NextRequest): boolean {
  const secretHeader = request.headers.get("x-revalidate-token");
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  const searchParamSecret = request.nextUrl.searchParams.get("secret");

  const providedSecret = secretHeader || bearerToken || searchParamSecret;
  return providedSecret === REVALIDATION_SECRET;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Invalid revalidation secret token." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const tags: string[] = Array.isArray(body.tags) ? body.tags : body.tag ? [body.tag] : [];
    const paths: string[] = Array.isArray(body.paths) ? body.paths : body.path ? [body.path] : [];

    const revalidatedTags: string[] = [];
    const revalidatedPaths: string[] = [];

    // Revalidate tags
    for (const tag of tags) {
      if (typeof tag === "string" && tag.trim()) {
        try {
          // Next.js 16 supports revalidateTag(tag, profile) or legacy revalidateTag(tag)
          (revalidateTag as any)(tag.trim(), "default");
          revalidatedTags.push(tag.trim());
        } catch (err: any) {
          console.warn(`[Revalidate API] Failed to revalidate tag "${tag}":`, err?.message || err);
        }
      }
    }

    // Revalidate paths
    for (const path of paths) {
      if (typeof path === "string" && path.trim()) {
        try {
          revalidatePath(path.trim());
          revalidatedPaths.push(path.trim());
        } catch (err: any) {
          console.warn(`[Revalidate API] Failed to revalidate path "${path}":`, err?.message || err);
        }
      }
    }

    // Default purge if no specific path/tag provided
    if (revalidatedTags.length === 0 && revalidatedPaths.length === 0) {
      try {
        (revalidateTag as any)("shop-catalog", "default");
        revalidatePath("/shop");
        revalidatePath("/");
        revalidatedTags.push("shop-catalog");
        revalidatedPaths.push("/shop", "/");
      } catch (err) {}
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      tags: revalidatedTags,
      paths: revalidatedPaths,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Revalidation failed", error: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
