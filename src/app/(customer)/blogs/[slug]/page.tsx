import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { getBlogBySlugServer, getBlogsServer } from "@/services/server/blogServerService";
import BlogDetailClient from "@/components/customer/blogs/BlogDetailClient";
import type { IBlog } from "@/types/blog.types";
import { SITE_URL } from "@/config/site";

interface PageParams {
  slug: string;
}

// ─── ISR Cache Config ─────────────────────────────────────────────────────
export const revalidate = 120;

// ─── Dynamic Metadata ─────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug;
  const slug = rawSlug ? decodeURIComponent(rawSlug).trim() : "";

  if (!slug) {
    return {
      title: "Blog Post Not Found | Urban Nursery",
      description: "The article you are looking for might have been moved or removed.",
    };
  }

  const blog = await getBlogBySlugServer(slug);

  if (!blog) {
    return {
      title: "Blog Post Not Found | Urban Nursery",
      description: "The article you are looking for might have been moved or removed.",
    };
  }

  const excerpt = blog.content
    ? blog.content.replace(/<[^>]*>/g, "").trim().slice(0, 155) + "..."
    : `Read ${blog.title} on Urban Nursery's Green Journal.`;

  const imageUrl = blog.coverImage?.startsWith("http") ? blog.coverImage : "/images/logo-new.png";
  const authorName =
    typeof blog.author === "object" && blog.author !== null && blog.author.name
      ? blog.author.name
      : "Dr. R. K. Sharma";

  return {
    title: `${blog.title} | Urban Nursery Green Journal`,
    description: excerpt,
    authors: [{ name: authorName }],
    openGraph: {
      title: blog.title,
      description: excerpt,
      url: `${SITE_URL}/blogs/${blog.slug}`,
      siteName: "Urban Nursery",
      type: "article",
      publishedTime: blog.createdAt,
      authors: [authorName],
      tags: blog.tags,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: blog.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: excerpt,
      images: [imageUrl],
    },
    alternates: { canonical: `${SITE_URL}/blogs/${blog.slug}` },
  };
}

// ─── Editorial Blog Detail Skeleton ───────────────────────────────────────
function BlogDetailSkeleton() {
  return (
    <div className="w-full min-h-screen bg-stone-50/30 px-4 pt-28 pb-16 sm:px-6 lg:px-8 max-w-5xl mx-auto overflow-hidden animate-pulse">
      <div className="space-y-6 max-w-4xl mx-auto text-center">
        <div className="h-6 w-36 bg-stone-200 rounded-full mx-auto" />
        <div className="h-12 w-full bg-stone-200 rounded-2xl" />
        <div className="h-5 w-3/4 bg-stone-200 rounded-xl mx-auto" />
      </div>
      <div className="h-96 w-full bg-stone-200 rounded-3xl mt-8 mb-12" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
        <div className="lg:col-span-3 hidden lg:block h-64 bg-stone-200 rounded-2xl" />
        <div className="lg:col-span-7 space-y-4">
          <div className="h-4 bg-stone-200 rounded w-full" />
          <div className="h-4 bg-stone-200 rounded w-5/6" />
          <div className="h-4 bg-stone-200 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}

// ─── Blog Detail RSC Shell ────────────────────────────────────────────────
export default async function BlogDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug;
  const slug = rawSlug ? decodeURIComponent(rawSlug).trim() : "";

  if (!slug) {
    notFound();
  }

  // Fetch blog + related posts in parallel on the server
  const [blog, allBlogsData] = await Promise.all([
    getBlogBySlugServer(slug),
    getBlogsServer({ page: 1, limit: 10 }),
  ]);

  if (!blog) {
    notFound();
  }

  // Compute related posts server-side: match category/tag or fallback, exclude current, max 3
  const currentCategory = blog.category;
  const currentTag = blog.tags?.[0];
  const allOther = (allBlogsData?.blogs || []).filter(
    (p) => p._id !== blog._id && p.slug !== blog.slug
  );

  let relatedPosts: IBlog[] = allOther.filter(
    (p) =>
      (currentCategory && p.category && p.category.toLowerCase() === currentCategory.toLowerCase()) ||
      (currentTag && p.tags?.some((t) => t.toLowerCase() === currentTag.toLowerCase()))
  );

  if (relatedPosts.length < 3) {
    const additional = allOther.filter((p) => !relatedPosts.some((r) => r._id === p._id));
    relatedPosts = [...relatedPosts, ...additional].slice(0, 3);
  } else {
    relatedPosts = relatedPosts.slice(0, 3);
  }

  return (
    <div className="w-full min-h-screen bg-stone-50/30 text-stone-900 box-border overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <Suspense fallback={<BlogDetailSkeleton />}>
        <BlogDetailClient blog={blog} relatedPosts={relatedPosts} />
      </Suspense>
    </div>
  );
}
