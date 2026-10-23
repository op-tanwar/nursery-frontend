"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Calendar, Clock, Eye, Share2, Check, Sparkles, Mail,
  List, ArrowRight, UserCheck, Loader2, CheckCircle2, ChevronDown,
  ChevronUp, ArrowUp, ShieldCheck, Bookmark, Heart, ExternalLink,
  MessageCircle, Copy, Sprout, Tag,
} from "lucide-react";

const TwitterIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);
import toast from "react-hot-toast";
import { newsletterService } from "@/services/newsletterService";
import type { IBlog } from "@/types/blog.types";
import DOMPurify from "dompurify";

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "span", "strong", "b", "em", "i", "u", "s", "strike",
    "ul", "ol", "li", "blockquote", "pre", "code",
    "a", "img", "hr", "br",
    "table", "thead", "tbody", "tr", "th", "td",
    "figure", "figcaption", "div",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "id", "class", "target", "rel", "width", "height"],
};

interface TocItem {
  id: string;
  text: string;
  level: number;
}

// ─── Pure Utility Functions ────────────────────────────────────────────────
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

function computeExcerpt(content?: string, maxLen = 160): string {
  if (!content) return "";
  const text = content.replace(/<[^>]*>/g, "").trim();
  return text.length > maxLen ? text.substring(0, maxLen).trim() + "..." : text;
}

function computeReadTime(content?: string): string {
  if (!content) return "5 min read";
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
  return "Plant Care";
}

// ─── Component Props ───────────────────────────────────────────────────────
interface BlogDetailClientProps {
  blog: IBlog;
  relatedPosts: IBlog[];
}

export default function BlogDetailClient({ blog, relatedPosts }: BlogDetailClientProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeTocId, setActiveTocId] = useState<string>("");
  const [processedContent, setProcessedContent] = useState<string>("");
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);

  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState<string>("");
  const [isNewsletterLoading, setIsNewsletterLoading] = useState<boolean>(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(false);

  // Scroll Progress Indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Process HTML, generate heading IDs, sanitize, extract TOC items
  useEffect(() => {
    if (!blog.content) {
      setProcessedContent("");
      setTocItems([]);
      return;
    }

    try {
      const sanitizedRaw = DOMPurify.sanitize(blog.content, SANITIZE_CONFIG);
      const parser = new DOMParser();
      const doc = parser.parseFromString(sanitizedRaw, "text/html");
      const headings = doc.querySelectorAll("h2, h3");
      const items: TocItem[] = [];

      headings.forEach((heading, index) => {
        const text = heading.textContent?.trim() || "";
        if (!text) return;
        const id = heading.id || `section-${index}-${text.toLowerCase().replace(/[^\w]+/g, "-")}`;
        heading.setAttribute("id", id);
        items.push({
          id,
          text,
          level: heading.tagName.toLowerCase() === "h2" ? 2 : 3,
        });
      });

      const sanitizedFinal = DOMPurify.sanitize(doc.body.innerHTML, SANITIZE_CONFIG);
      setTocItems(items);
      setProcessedContent(sanitizedFinal);
    } catch {
      setProcessedContent(DOMPurify.sanitize(blog.content, SANITIZE_CONFIG));
    }
  }, [blog.content]);

  // Scrollspy for active TOC item
  useEffect(() => {
    if (tocItems.length === 0) return;

    const handleSpy = () => {
      const scrollPosition = window.scrollY + 160;
      for (let i = tocItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(tocItems[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveTocId(tocItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleSpy, { passive: true });
    handleSpy();
    return () => window.removeEventListener("scroll", handleSpy);
  }, [tocItems]);

  // Check initial bookmark state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("urban_nursery_bookmarked_blogs");
      if (saved) {
        const set: string[] = JSON.parse(saved);
        if (set.includes(blog.slug)) setIsBookmarked(true);
      }
    } catch {
      // ignore
    }
  }, [blog.slug]);

  const toggleBookmark = () => {
    setIsBookmarked((prev) => {
      const next = !prev;
      try {
        const saved = localStorage.getItem("urban_nursery_bookmarked_blogs");
        let list: string[] = saved ? JSON.parse(saved) : [];
        if (next) {
          if (!list.includes(blog.slug)) list.push(blog.slug);
          toast.success("Saved to your reading list!");
        } else {
          list = list.filter((s) => s !== blog.slug);
          toast("Removed from your reading list", { icon: "🔖" });
        }
        localStorage.setItem("urban_nursery_bookmarked_blogs", JSON.stringify(list));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const getFullUrl = () => {
    if (typeof window !== "undefined") return window.location.href;
    return `https://urbannursery.in/blogs/${blog.slug}`;
  };

  const handleCopyLink = () => {
    const url = getFullUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const url = getFullUrl();
    const text = encodeURIComponent(`Read this botanical guide: "${blog.title}" on Urban Nursery\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleTwitterShare = () => {
    const url = getFullUrl();
    const text = encodeURIComponent(`"${blog.title}" via @UrbanNurseryIndia`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
  };

  const handleLinkedInShare = () => {
    const url = getFullUrl();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    const url = getFullUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: computeExcerpt(blog.content, 120),
          url: url,
        });
      } catch {
        // user cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newsletterEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error("Please enter a valid email address");
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

  const categoryName = getCategoryName(blog);
  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Published";

  const updatedDate = blog.updatedAt
    ? new Date(blog.updatedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : formattedDate;

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────────
          1. SCROLL-PROGRESS INDICATOR (Fixed at Viewport Top)
          ───────────────────────────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-600 z-50 transition-all duration-150 origin-left"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      <article className="w-full min-h-screen bg-stone-50/30 text-stone-900 pt-20 sm:pt-24 pb-20">
        {/* ───────────────────────────────────────────────────────────────────
            2. ARTICLE HEADER & BOTANICAL META (Centered Focused Container)
            ─────────────────────────────────────────────────────────────────── */}
        <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-10 text-center">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-stone-500">
            <Link href="/" className="hover:text-emerald-800 transition-colors">
              Home
            </Link>
            <span className="text-stone-300">/</span>
            <Link href="/blogs" className="hover:text-emerald-800 transition-colors">
              Botanical Journal
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-emerald-800 font-semibold">{categoryName}</span>
            <span className="text-stone-300">/</span>
            <span className="text-stone-700 truncate max-w-[200px] sm:max-w-[320px]">
              {blog.title}
            </span>
          </nav>

          {/* Category Badge & Reading Time */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-6 shadow-2xs">
            <span>{categoryName}</span>
            <span className="text-emerald-400">•</span>
            <span className="inline-flex items-center gap-1 font-semibold normal-case text-emerald-800">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              {computeReadTime(blog.content)}
            </span>
          </div>

          {/* High-Impact Editorial Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-stone-900 tracking-tight leading-[1.14] font-bold mb-6 max-w-3xl mx-auto">
            {blog.title}
          </h1>

          {/* Excerpt / Lead Paragraph */}
          <p className="text-lg sm:text-xl text-stone-600 font-light leading-relaxed max-w-2xl mx-auto mb-8">
            {computeExcerpt(blog.content, 220)}
          </p>

          {/* Author Bio Bar & Actions */}
          <div className="pt-6 border-t border-stone-200/80 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 text-left">
            {/* Author details */}
            <div className="flex items-center gap-3.5">
              {getAuthorAvatar(blog.author).startsWith("http") ? (
                <Image
                  src={getAuthorAvatar(blog.author)}
                  alt="Author"
                  width={46}
                  height={46}
                  className="w-11.5 h-11.5 rounded-full object-cover ring-2 ring-emerald-600/40 shrink-0"
                />
              ) : (
                <div className="w-11.5 h-11.5 rounded-full bg-emerald-100 ring-2 ring-emerald-600/40 flex items-center justify-center text-lg font-bold text-emerald-800 shrink-0">
                  🌿
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-stone-900">
                    {getAuthorName(blog.author)}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    Verified Desk
                  </span>
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5 font-light">
                  <span>Published {formattedDate}</span>
                  {updatedDate !== formattedDate && (
                    <>
                      <span className="text-stone-300">•</span>
                      <span>Updated {updatedDate}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Share Trigger Bar */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-emerald-700 hover:border-emerald-300 transition-colors shadow-2xs cursor-pointer"
                title="Share via WhatsApp"
                aria-label="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-emerald-700 hover:border-emerald-300 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                title="Copy Story Link"
                aria-label="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                type="button"
                onClick={handleNativeShare}
                className="p-2 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs cursor-pointer"
                title="Share Story"
                aria-label="Share story"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ───────────────────────────────────────────────────────────────────
            3. HERO IMAGE PRESENTATION (Framed with Caption)
            ─────────────────────────────────────────────────────────────────── */}
        {blog.coverImage && (
          <figure className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
            <div className="relative aspect-[21/10] max-h-[520px] rounded-3xl overflow-hidden shadow-xl border border-stone-200/90 bg-stone-100">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="object-cover"
              />
            </div>
            <figcaption className="text-xs text-stone-500 text-center mt-3.5 italic font-serif">
              An authoritative guide curated by Urban Nursery Plant Science &amp; Horticultural Desk.
            </figcaption>
          </figure>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            4. SPLIT-SCREEN READING LAYOUT
            (Left Sidebar TOC 3-cols | Center Article Body 7-cols | Right Dock 2-cols)
            ─────────────────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Table of Contents Accordion Drawer (<1024px) */}
          {tocItems.length > 0 && (
            <div className="lg:hidden mb-8 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setMobileTocOpen(!mobileTocOpen)}
                className="w-full flex items-center justify-between p-4 text-left font-serif font-bold text-stone-900 text-sm cursor-pointer select-none bg-stone-50/70"
              >
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-emerald-700" />
                  <span>On This Page ({tocItems.length} Key Sections)</span>
                </div>
                {mobileTocOpen ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
              </button>
              {mobileTocOpen && (
                <nav className="p-4 pt-2 border-t border-stone-100 space-y-2 text-sm bg-white">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setMobileTocOpen(false)}
                      className={`block py-1 text-xs sm:text-sm transition-colors ${
                        item.level === 3 ? "pl-4 text-stone-500" : "font-medium text-stone-800"
                      } hover:text-emerald-700`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start mb-16 relative">
            {/* ── LEFT SIDEBAR: STICKY TOC (3 Columns) ────────────────────────── */}
            <aside className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[82vh] overflow-y-auto scrollbar-none pr-3">
              <div className="bg-white/80 backdrop-blur-md border border-stone-200/90 rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center gap-2 font-serif font-bold text-sm text-stone-900 mb-4 pb-3 border-b border-stone-100">
                  <List className="w-4 h-4 text-emerald-700" />
                  <span>Table of Contents</span>
                </div>

                {tocItems.length > 0 ? (
                  <nav className="space-y-1.5 text-xs">
                    {tocItems.map((item) => {
                      const isActive = activeTocId === item.id;
                      return (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={`block py-1.5 px-2.5 rounded-lg transition-all duration-150 leading-snug break-words ${
                            item.level === 3 ? "ml-3 text-stone-500 text-[11px]" : "font-semibold"
                          } ${
                            isActive
                              ? "bg-emerald-50 text-emerald-800 font-bold border-l-2 border-emerald-600"
                              : "text-stone-600 hover:text-emerald-800 hover:bg-stone-50"
                          }`}
                        >
                          {item.text}
                        </a>
                      );
                    })}
                  </nav>
                ) : (
                  <p className="text-xs text-stone-400 italic">Continuous editorial story</p>
                )}

                {/* Botanical Shop Cross-Sell Widget below TOC */}
                <div className="mt-6 pt-5 border-t border-stone-100">
                  <div className="bg-gradient-to-br from-emerald-50 to-stone-50 border border-emerald-200/60 rounded-xl p-3.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                      Featured in this Guide
                    </span>
                    <p className="text-xs font-bold text-stone-900 leading-snug mb-2">
                      Urban Nursery Organic Aerated Potting Mix
                    </p>
                    <p className="text-[11px] text-stone-500 leading-normal mb-3">
                      Enriched with bio-enzymes &amp; perlite for root health.
                    </p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                    >
                      Shop Botanical Essentials <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── CENTER ARTICLE BODY (7 Columns — Focused Long-form) ───────── */}
            <main className="lg:col-span-7 w-full min-w-0">
              <div
                dangerouslySetInnerHTML={{ __html: processedContent || blog.content || "" }}
                className="prose-botanical w-full break-words max-w-full overflow-hidden"
              />

              {/* ─────────────────────────────────────────────────────────────
                  5. ARTICLE FOOTER & PLANT PARENT UTILITIES
                  ───────────────────────────────────────────────────────────── */}
              {/* TAGS CLOUD */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-12 pt-6 border-t border-stone-200 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Filed Under:
                  </span>
                  {blog.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blogs?keyword=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:border-emerald-400 hover:text-emerald-800 px-3 py-1.5 rounded-full transition-all shadow-2xs hover:shadow-xs"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* AUTHOR AUTHORITY CARD (E-E-A-T Booster) */}
              <div className="mt-12 bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  {getAuthorAvatar(blog.author).startsWith("http") ? (
                    <Image
                      src={getAuthorAvatar(blog.author)}
                      alt="Author profile"
                      width={72}
                      height={72}
                      className="w-18 h-18 rounded-full object-cover ring-4 ring-emerald-100 shrink-0"
                    />
                  ) : (
                    <div className="w-18 h-18 rounded-full bg-emerald-100 ring-4 ring-emerald-100 flex items-center justify-center text-3xl font-bold text-emerald-800 shrink-0">
                      🌿
                    </div>
                  )}
                  <div className="text-center sm:text-left min-w-0">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-0.5 rounded-full mb-2">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Certified Botanical Contributor</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 mb-1">
                      Written by {getAuthorName(blog.author)}
                    </h3>
                    <p className="text-xs text-emerald-700 font-semibold mb-3">
                      {getAuthorRole(blog.author)} • Head of Plant Science, Urban Nursery
                    </p>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                      Specializing in sub-tropical plant acclimation, soil microbial health, and urban indoor landscaping. With over 15 years in horticultural research, Dr. Sharma oversees Urban Nursery’s botanical quality audits and grower education programs across 150+ nursery partners.
                    </p>
                  </div>
                </div>
              </div>

              {/* 24-HOUR BOTANICAL GUARANTEE WIDGET */}
              <div className="mt-8 bg-gradient-to-br from-emerald-50 via-stone-50 to-emerald-50/50 border border-emerald-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-stone-900 mb-1">
                      Urban Nursery 24-Hour Transit &amp; Health Guarantee
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                      Every plant featured in our guides is sourced directly from certified nursery partners and shipped in customized climate-tested ventilated packaging. Backed by our 100% alive-on-arrival transit guarantee with 7-day botanical acclimation support.
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-emerald-800">
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Transit Safe</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Eco Packaging</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Free Plant Replacement</span>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* ── RIGHT COLUMN: FLOATING SHARE DOCK (2 Columns) ─────────────── */}
            <aside className="hidden lg:flex lg:col-span-2 flex-col items-center sticky top-28 self-start space-y-4">
              <div className="bg-white border border-stone-200/90 rounded-2xl p-2.5 shadow-2xs flex flex-col items-center gap-3 w-14">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="w-10 h-10 rounded-xl bg-stone-50 hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 transition flex items-center justify-center cursor-pointer"
                  title="Share on WhatsApp"
                  aria-label="Share on WhatsApp"
                >
                  <MessageCircle className="w-4.5 h-4.5" />
                </button>

                <button
                  type="button"
                  onClick={handleTwitterShare}
                  className="w-10 h-10 rounded-xl bg-stone-50 hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 transition flex items-center justify-center cursor-pointer"
                  title="Share on X (Twitter)"
                  aria-label="Share on Twitter"
                >
                  <TwitterIcon />
                </button>

                <button
                  type="button"
                  onClick={handleLinkedInShare}
                  className="w-10 h-10 rounded-xl bg-stone-50 hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 transition flex items-center justify-center cursor-pointer"
                  title="Share on LinkedIn"
                  aria-label="Share on LinkedIn"
                >
                  <LinkedInIcon />
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-10 h-10 rounded-xl bg-stone-50 hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 transition flex items-center justify-center cursor-pointer"
                  title="Copy link"
                  aria-label="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={toggleBookmark}
                  className={`w-10 h-10 rounded-xl transition flex items-center justify-center cursor-pointer ${
                    isBookmarked
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-50 hover:bg-emerald-50 text-stone-600 hover:text-emerald-700"
                  }`}
                  title={isBookmarked ? "Bookmarked" : "Save for later"}
                  aria-label="Bookmark story"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-emerald-800" : ""}`} />
                </button>

                <div className="w-6 h-px bg-stone-200 my-1" />

                <button
                  type="button"
                  onClick={scrollToTop}
                  className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition flex items-center justify-center cursor-pointer"
                  title="Back to top"
                  aria-label="Back to top"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>

              {/* Feedback Pill */}
              <button
                type="button"
                onClick={() => {
                  setLiked(!liked);
                  toast.success(liked ? "Feedback updated" : "Thanks for your feedback!");
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                  liked
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-white text-stone-600 border border-stone-200 hover:text-emerald-800"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? "fill-emerald-700 text-emerald-700" : ""}`} />
                <span>{liked ? "Helpful" : "Helpful?"}</span>
              </button>
            </aside>
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              "KEEP READING" RELATED STORIES CAROUSEL / GRID
              ───────────────────────────────────────────────────────────────── */}
          {relatedPosts.length > 0 && (
            <section className="pt-14 border-t border-stone-200 mb-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                    Related Botanical Wisdom
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                    Keep Reading &amp; Growing
                  </h2>
                </div>
                <Link
                  href="/blogs"
                  className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 group"
                >
                  View All Journal Stories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {relatedPosts.map((post) => {
                  const postCategory = getCategoryName(post);
                  return (
                    <article
                      key={post._id}
                      className="group bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-emerald-300/80 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <Link href={`/blogs/${post.slug}`} className="block relative aspect-[16/10] bg-stone-100 overflow-hidden">
                          {post.coverImage && post.coverImage.startsWith("http") ? (
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl bg-stone-100">🌿</div>
                          )}
                          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-emerald-950 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-2xs">
                            {postCategory}
                          </span>
                          <span className="absolute bottom-3 right-3 text-[10px] font-semibold text-white bg-stone-900/80 backdrop-blur-md px-2 py-0.5 rounded-md">
                            {computeReadTime(post.content || "")}
                          </span>
                        </Link>

                        <div className="p-5">
                          <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug mb-2">
                            <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                          </h3>
                          <p className="text-stone-600 text-xs leading-relaxed line-clamp-2 font-light">
                            {computeExcerpt(post.content || "", 110)}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[11px] text-stone-500 font-medium">
                          By {getAuthorName(post.author)}
                        </span>
                        <Link
                          href={`/blogs/${post.slug}`}
                          className="text-xs font-bold text-emerald-800 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
                        >
                          Read Story <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* NEWSLETTER ENROLLMENT CALLOUT */}
          <section className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-800/40 relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider bg-emerald-800/50 border border-emerald-700/50 px-3.5 py-1 rounded-full mb-3">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>The Weekly Botanical Digest</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2 leading-tight">
                  Enjoyed this botanical deep-dive?
                </h3>
                <p className="text-stone-300 text-sm font-light leading-relaxed max-w-xl">
                  Subscribe to receive seasonal repotting charts, pest alerts, and exclusive nursery discounts straight to your inbox every Friday morning.
                </p>
              </div>

              <div className="lg:col-span-5">
                {newsletterSubscribed ? (
                  <div className="flex items-center gap-2.5 text-emerald-200 bg-emerald-800/40 border border-emerald-600/40 rounded-2xl p-4 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>You&apos;re in! Look out for our upcoming seasonal guide.</span>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Your email address"
                      disabled={isNewsletterLoading}
                      className="flex-1 bg-white/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-stone-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 backdrop-blur-md shadow-xs transition disabled:opacity-50"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isNewsletterLoading}
                      className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
                    >
                      {isNewsletterLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Subscribing...</span>
                        </>
                      ) : (
                        <span>Subscribe</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
