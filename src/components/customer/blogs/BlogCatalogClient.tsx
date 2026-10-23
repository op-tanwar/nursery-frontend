"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search, BookOpen, Clock, ArrowRight, RotateCcw, AlertCircle,
  Mail, Sparkles, ChevronLeft, ChevronRight, Loader2, CheckCircle2,
  Bookmark, Share2, X, Sprout, Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { newsletterService } from "@/services/newsletterService";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { blogService } from "@/services/blogService";
import { setAllBlogsData, setBlogLoading, setBlogError } from "@/redux/slices/blogSlice";
import type { IBlog } from "@/types/blog.types";

const CATEGORIES = [
  "All Stories",
  "Indoor Gardening",
  "Plant Care",
  "Decor Tips",
  "Monsoon Care",
  "Urban Farming",
] as const;

type CategoryTab = (typeof CATEGORIES)[number];

// ─── Pure Utility Helpers ──────────────────────────────────────────────────
function getAuthorName(author: any): string {
  if (typeof author === "object" && author !== null && author.name) return author.name;
  return "Dr. R. K. Sharma";
}

function getAuthorRole(author: any): string {
  if (typeof author === "object" && author !== null && author.role) return author.role;
  return "Senior Horticulturalist";
}

function getAuthorAvatar(author: any): string {
  if (typeof author === "object" && author !== null && author.avatar) {
    if (typeof author.avatar === "string") return author.avatar;
    if (author.avatar.url) return author.avatar.url;
  }
  return "";
}

function computeExcerpt(content: string, maxLen = 130): string {
  if (!content) return "";
  const text = content.replace(/<[^>]*>/g, "").trim();
  return text.length > maxLen ? text.substring(0, maxLen).trim() + "..." : text;
}

function computeReadTime(content: string): string {
  if (!content) return "4 min read";
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 180))} min read`;
}

function getCategoryName(blog: IBlog): string {
  if (blog.category && blog.category.trim() && blog.category !== "Uncategorized") {
    return blog.category;
  }
  if (blog.tags && blog.tags.length > 0) {
    return blog.tags[0];
  }
  return "Botanical Guide";
}

// ─── Component Props ───────────────────────────────────────────────────────
interface BlogCatalogClientProps {
  initialBlogs: IBlog[];
  initialTotalPages: number;
  initialCurrentPage: number;
}

export default function BlogCatalogClient({
  initialBlogs,
  initialTotalPages,
  initialCurrentPage,
}: BlogCatalogClientProps) {
  const dispatch = useAppDispatch();
  const { blogs, currentPage, totalPages, isLoading, error } = useAppSelector(
    (state) => state.blog
  );

  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("All Stories");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<Set<string>>(new Set());

  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState<string>("");
  const [isNewsletterLoading, setIsNewsletterLoading] = useState<boolean>(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(false);

  // Seed Redux with SSR data on initial mount
  useEffect(() => {
    if (initialBlogs.length > 0 && !blogs.length) {
      dispatch(
        setAllBlogsData({
          blogs: initialBlogs,
          totalBlogs: initialBlogs.length,
          resPerPage: 12,
          currentPage: initialCurrentPage,
          totalPages: initialTotalPages,
        })
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("urban_nursery_bookmarked_blogs");
      if (saved) {
        setBookmarkedSlugs(new Set(JSON.parse(saved)));
      }
    } catch {
      // ignore in SSR or restricted storage
    }
  }, []);

  const toggleBookmark = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedSlugs((prev) => {
      const next = new Set(prev);
      const isBookmarked = next.has(slug);
      if (isBookmarked) {
        next.delete(slug);
        toast("Removed from your reading list", { icon: "🔖" });
      } else {
        next.add(slug);
        toast.success("Saved to your reading list!");
      }
      try {
        localStorage.setItem("urban_nursery_bookmarked_blogs", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const shareArticle = (post: IBlog, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}/blogs/${post.slug}` : `/blogs/${post.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Story link copied to clipboard!");
    } else {
      toast("Story link: " + url, { icon: "🌿" });
    }
  };

  // Backend query handler for pagination or extensive queries
  const fetchBlogs = useCallback(
    async (pageNo: number, category: CategoryTab, search: string) => {
      dispatch(setBlogLoading(true));
      try {
        const params = new URLSearchParams();
        params.append("page", String(pageNo));
        params.append("limit", "12");
        if (search.trim()) params.append("keyword", search.trim());
        if (category !== "All Stories") {
          params.append("category", category);
        }

        const data = await blogService.getAllBlogs(params.toString());
        dispatch(
          setAllBlogsData({
            blogs: data.blogs || data.data || [],
            totalBlogs: data.totalBlogs || data.count || 0,
            resPerPage: data.resPerPage || 12,
            currentPage: data.currentPage || pageNo,
            totalPages: data.totalPages || 1,
          })
        );
      } catch (err: any) {
        dispatch(setBlogError(err?.message || "Failed to load stories"));
      }
    },
    [dispatch]
  );

  // Trigger server fetch when category or page changes
  useEffect(() => {
    if (page === 1 && selectedCategory === "All Stories" && searchQuery === "" && blogs.length > 0) {
      return;
    }
    fetchBlogs(page, selectedCategory, searchQuery);
  }, [page, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryChange = (cat: CategoryTab) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newsletterEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error("Please provide a valid email address");
      return;
    }
    try {
      setIsNewsletterLoading(true);
      const res = await newsletterService.subscribe(cleanEmail);
      if (res.alreadySubscribed) {
        toast(res.message, { icon: "🌱" });
      } else {
        toast.success(res.message || "Welcome to the Urban Nursery Journal circle!");
      }
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to subscribe. Please try again.");
    } finally {
      setIsNewsletterLoading(false);
    }
  };

  const activeBlogs = blogs.length > 0 ? blogs : initialBlogs;

  // Real-time client-side search & tag filtering
  const filteredBlogs = useMemo(() => {
    let result = activeBlogs;

    // Filter by category tab
    if (selectedCategory !== "All Stories") {
      const catKey = selectedCategory.toLowerCase();
      result = result.filter((post) => {
        const cat = (post.category || "").toLowerCase();
        const tags = (post.tags || []).map((t) => t.toLowerCase());
        const title = post.title.toLowerCase();
        return (
          cat.includes(catKey) ||
          tags.some((t) => t.includes(catKey) || catKey.includes(t)) ||
          title.includes(catKey)
        );
      });
    }

    // Real-time search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((post) => {
        const title = post.title.toLowerCase();
        const content = post.content ? post.content.toLowerCase() : "";
        const tags = (post.tags || []).map((t) => t.toLowerCase());
        const author = getAuthorName(post.author).toLowerCase();
        return (
          title.includes(q) ||
          tags.some((t) => t.includes(q)) ||
          content.includes(q) ||
          author.includes(q)
        );
      });
    }

    return result;
  }, [activeBlogs, selectedCategory, searchQuery]);

  // Determine Featured Top Pick (the first post when on page 1 without a restrictive search)
  const isSearchActive = searchQuery.trim().length > 0;
  const showFeaturedHero = !isSearchActive && page === 1 && filteredBlogs.length > 0;
  const featuredBlog = showFeaturedHero ? filteredBlogs[0] : null;
  const editorialGridBlogs = showFeaturedHero ? filteredBlogs.slice(1) : filteredBlogs;

  const displayedTotalPages = totalPages || initialTotalPages;
  const displayedCurrentPage = currentPage || initialCurrentPage;

  return (
    <div className="w-full">
      {/* ─────────────────────────────────────────────────────────────────────
          1. EDITORIAL HERO SECTION
          ───────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-stone-50/60 to-white pt-24 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-stone-200/60">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 text-xs font-semibold tracking-wider uppercase mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Urban Nursery Botanical Journal</span>
          </div>

          {/* Editorial Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-stone-900 tracking-tight leading-[1.12] mb-5 font-bold">
            Horticultural Wisdom, Plant Science &amp; Green Living
          </h1>

          {/* Subtitle */}
          <p className="text-stone-600 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-10">
            Expert guides curated by botanical specialists to help your urban jungle thrive in Indian climates.
          </p>

          {/* Real-time Search Input */}
          <div className="max-w-xl mx-auto relative group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-700 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder="Search plant care guides, species, or pest advice..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-white border border-stone-200 rounded-2xl text-stone-900 text-sm sm:text-base placeholder:text-stone-400 shadow-xs focus:outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          2. STICKY CURATED CATEGORY NAVIGATION
          ───────────────────────────────────────────────────────────────────── */}
      <nav aria-label="Blog Categories" className="sticky top-16 z-30 bg-white/95 backdrop-blur-md py-3.5 border-b border-stone-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto scrollbar-none gap-2 sm:gap-2.5 py-1">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 sm:px-5 py-2 text-xs sm:text-sm rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap select-none shrink-0 ${
                    isActive
                      ? "bg-emerald-800 text-white shadow-xs border border-emerald-800 font-semibold"
                      : "bg-stone-50 text-stone-600 border border-stone-200 hover:border-emerald-300 hover:text-emerald-800 hover:bg-white font-medium"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────────
          MAIN CONTENT AREA
          ───────────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* ERROR STATE */}
        {error && (
          <div className="mb-10 p-5 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-center text-sm shadow-xs flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchBlogs(page, selectedCategory, searchQuery)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-xl text-xs hover:bg-red-700 transition cursor-pointer active:scale-95 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry Fetch
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="space-y-12 animate-pulse">
            <div className="bg-stone-100 rounded-3xl p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-96">
              <div className="lg:col-span-7 bg-stone-200 rounded-2xl h-full" />
              <div className="lg:col-span-5 space-y-4 py-6">
                <div className="h-4 bg-stone-200 rounded w-1/4" />
                <div className="h-8 bg-stone-200 rounded w-4/5" />
                <div className="h-4 bg-stone-200 rounded w-full" />
                <div className="h-4 bg-stone-200 rounded w-2/3" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-stone-100 border border-stone-200 rounded-2xl p-4 space-y-4 h-[420px]">
                  <div className="aspect-[16/10] bg-stone-200 rounded-xl" />
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-6 bg-stone-200 rounded w-5/6" />
                  <div className="h-4 bg-stone-200 rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredBlogs.length > 0 ? (
          <>
            {/* ─────────────────────────────────────────────────────────────────
                3. "FEATURED STORY" HERO BANNER (Top 1 Pick)
                ───────────────────────────────────────────────────────────────── */}
            {featuredBlog && (
              <section className="mb-16">
                <div className="group relative bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Left: Cover Image */}
                    <div className="lg:col-span-7">
                      <Link
                        href={`/blogs/${featuredBlog.slug}`}
                        className="block relative aspect-[16/10] rounded-2xl overflow-hidden bg-stone-100 shadow-sm"
                      >
                        {featuredBlog.coverImage && featuredBlog.coverImage.startsWith("http") ? (
                          <Image
                            src={featuredBlog.coverImage}
                            alt={featuredBlog.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            priority
                            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-stone-100 text-6xl">
                            🌿
                          </div>
                        )}
                        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm">
                          <Sparkles className="w-3 h-3 text-emerald-300" />
                          <span>Featured • {getCategoryName(featuredBlog)}</span>
                        </span>
                      </Link>
                    </div>

                    {/* Right: Editorial Meta & Excerpt */}
                    <div className="lg:col-span-5 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-3">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-700" />
                            {computeReadTime(featuredBlog.content || "")}
                          </span>
                          <span className="text-stone-300">•</span>
                          <span>
                            {featuredBlog.createdAt
                              ? new Date(featuredBlog.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Recently Published"}
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-stone-900 font-bold leading-tight mb-4 group-hover:text-emerald-900 transition-colors">
                          <Link href={`/blogs/${featuredBlog.slug}`} className="hover:underline decoration-emerald-600/40 underline-offset-4">
                            {featuredBlog.title}
                          </Link>
                        </h2>

                        <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light mb-6 line-clamp-3">
                          {computeExcerpt(featuredBlog.content || "", 200)}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-stone-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {getAuthorAvatar(featuredBlog.author).startsWith("http") ? (
                            <Image
                              src={getAuthorAvatar(featuredBlog.author)}
                              alt="Author"
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-600/30 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-100 ring-2 ring-emerald-600/30 flex items-center justify-center text-sm font-bold text-emerald-800 shrink-0">
                              🌱
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-stone-900 truncate">
                              {getAuthorName(featuredBlog.author)}
                            </p>
                            <p className="text-[11px] text-emerald-700 font-medium truncate">
                              {getAuthorRole(featuredBlog.author)} • Botanical Desk
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/blogs/${featuredBlog.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 group-hover:translate-x-1 transition-transform shrink-0"
                        >
                          Read Full Story <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ─────────────────────────────────────────────────────────────────
                4. CURATED EDITORIAL GRID (3-Column Layout)
                ───────────────────────────────────────────────────────────────── */}
            {editorialGridBlogs.length > 0 && (
              <section className="mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {editorialGridBlogs.map((post) => {
                    const categoryName = getCategoryName(post);
                    const formattedDate = post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recent";
                    const isBookmarked = bookmarkedSlugs.has(post.slug);

                    return (
                      <article
                        key={post._id}
                        className="group bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-emerald-300/80 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          {/* Image frame */}
                          <Link href={`/blogs/${post.slug}`} className="block relative aspect-[16/10] bg-stone-100 overflow-hidden">
                            {post.coverImage && post.coverImage.startsWith("http") ? (
                              <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                loading="lazy"
                                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl bg-stone-100">🌿</div>
                            )}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-950 bg-white/95 backdrop-blur-md border border-stone-200/70 px-2.5 py-1 rounded-full shadow-2xs">
                                {categoryName}
                              </span>
                            </div>
                            <span className="absolute bottom-3 right-3 text-[10px] font-semibold text-white bg-stone-900/80 backdrop-blur-md px-2 py-0.5 rounded-md">
                              {computeReadTime(post.content || "")}
                            </span>
                          </Link>

                          {/* Body info */}
                          <div className="p-6">
                            <div className="text-xs font-medium text-stone-400 mb-2.5">
                              {formattedDate}
                            </div>
                            <h3 className="text-lg font-serif font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug mb-3">
                              <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                            </h3>
                            <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed line-clamp-3 mb-6">
                              {computeExcerpt(post.content || "", 140)}
                            </p>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="px-6 pb-6 pt-3 border-t border-stone-100 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            {getAuthorAvatar(post.author).startsWith("http") ? (
                              <Image
                                src={getAuthorAvatar(post.author)}
                                alt="Author"
                                width={26}
                                height={26}
                                className="w-6.5 h-6.5 rounded-full object-cover border border-stone-200 shrink-0"
                              />
                            ) : (
                              <div className="w-6.5 h-6.5 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-800 shrink-0">
                                🌱
                              </div>
                            )}
                            <span className="text-xs font-medium text-stone-700 truncate">
                              {getAuthorName(post.author)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => shareArticle(post, e)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-800 hover:bg-stone-100 transition-colors cursor-pointer"
                              title="Share story"
                              aria-label="Share article"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => toggleBookmark(post.slug, e)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isBookmarked
                                  ? "text-emerald-700 bg-emerald-50"
                                  : "text-stone-400 hover:text-emerald-800 hover:bg-stone-100"
                              }`}
                              title={isBookmarked ? "Remove bookmark" : "Save for later"}
                              aria-label="Bookmark article"
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-emerald-700" : ""}`} />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {/* PAGINATION */}
            {displayedTotalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mb-16">
                <button
                  disabled={displayedCurrentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-emerald-600 hover:text-emerald-800 transition cursor-pointer shadow-2xs active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-xs sm:text-sm font-medium text-stone-500 px-3">
                  Page <strong className="text-stone-900 font-bold">{displayedCurrentPage}</strong> of {displayedTotalPages}
                </span>
                <button
                  disabled={displayedCurrentPage === displayedTotalPages}
                  onClick={() => setPage((p) => Math.min(displayedTotalPages, p + 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-emerald-600 hover:text-emerald-800 transition cursor-pointer shadow-2xs active:scale-95"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* EMPTY STATE */
          <div className="w-full text-center py-20 px-4 bg-white border border-stone-200/80 rounded-3xl shadow-xs mb-16">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-stone-900 font-serif font-bold text-xl sm:text-2xl mb-2">
              No matching botanical stories
            </h3>
            <p className="text-stone-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              We couldn&apos;t find any articles matching your search or category filter. Try clearing filters to see all guides.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Stories");
                setPage(1);
              }}
              className="text-sm bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            5. NEWSLETTER & PLANT DOCTOR CALLOUT
            ───────────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-900 text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-xl border border-emerald-800/40">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider bg-emerald-800/50 border border-emerald-700/50 px-3.5 py-1 rounded-full mb-4">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                <span>Urban Nursery Plant Doctor</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white mb-3 leading-snug">
                Need personalized plant advice?
              </h3>
              <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed max-w-xl">
                Join 25,000+ urban plant parents receiving weekly seasonal watering reminders, soil nutrition guides, and expert diagnosis directly from our horticultural team.
              </p>
            </div>

            <div className="lg:col-span-5">
              {newsletterSubscribed ? (
                <div className="flex items-center gap-2.5 text-emerald-200 bg-emerald-800/40 border border-emerald-600/40 rounded-2xl p-4 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>You&apos;re subscribed! Check your inbox for our seasonal watering chart.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={isNewsletterLoading}
                    className="flex-1 bg-white/10 border border-emerald-500/30 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 backdrop-blur-md shadow-xs transition disabled:opacity-50"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isNewsletterLoading}
                    className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
                  >
                    {isNewsletterLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <span>Join Free</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
