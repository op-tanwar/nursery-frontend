import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/customer/common/navbar/Navbar";
import Footer from "@/components/customer/common/Footer";
import {
  Home,
  ShoppingBag,
  BookOpen,
  Headphones,
  Flower2,
  Package,
  ArrowRight,
} from "lucide-react";

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Page Not Found | Urban Nursery",
  description:
    "The plant or page you are looking for might have been moved, renamed, or is currently out of stock.",
  robots: { index: false, follow: true },
};

// ─── Inline SVG Illustration — Wilting Potted Plant with Magnifying Glass ────
function PlantIllustration() {
  return (
    <svg
      viewBox="0 0 260 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-full"
    >
      {/* ── Decorative soil shadow ── */}
      <ellipse cx="130" cy="208" rx="52" ry="8" fill="#d1fae5" opacity="0.6" />

      {/* ── Pot body ── */}
      <path
        d="M98 180 L102 208 Q130 218 158 208 L162 180 Z"
        fill="#6ee7b7"
        stroke="#059669"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Pot rim */}
      <rect
        x="93"
        y="174"
        width="74"
        height="10"
        rx="5"
        fill="#34d399"
        stroke="#059669"
        strokeWidth="1.5"
      />
      {/* Pot shine */}
      <path
        d="M104 182 Q108 190 106 200"
        stroke="#a7f3d0"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* ── Soil surface ── */}
      <ellipse cx="130" cy="175" rx="34" ry="5" fill="#6b7280" opacity="0.25" />

      {/* ── Drooping stem ── */}
      <path
        d="M130 174 C130 160, 130 145, 128 128 C126 112, 120 102, 110 94"
        stroke="#059669"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Wilting leaf left (drooping down) ── */}
      <path
        d="M128 128 C118 120, 96 118, 88 108 C84 104, 90 96, 100 100 C110 104, 120 116, 128 128 Z"
        fill="#6ee7b7"
        stroke="#059669"
        strokeWidth="1.5"
        opacity="0.9"
      />
      {/* Left leaf vein */}
      <path
        d="M128 128 C116 118, 100 110, 92 104"
        stroke="#34d399"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* ── Wilting leaf right (drooping) ── */}
      <path
        d="M122 140 C132 132, 152 128, 162 118 C166 114, 160 106, 150 110 C140 114, 128 128, 122 140 Z"
        fill="#6ee7b7"
        stroke="#059669"
        strokeWidth="1.5"
        opacity="0.85"
      />
      {/* Right leaf vein */}
      <path
        d="M122 140 C136 130, 150 120, 158 114"
        stroke="#34d399"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* ── Top drooping head / flower ── */}
      <circle cx="110" cy="94" r="10" fill="#fbbf24" opacity="0.9" />
      <circle cx="110" cy="94" r="5.5" fill="#f59e0b" />
      {/* Droopy petals */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <ellipse
          key={i}
          cx={110 + 13 * Math.cos((angle * Math.PI) / 180)}
          cy={94 + 13 * Math.sin((angle * Math.PI) / 180)}
          rx="5"
          ry="7"
          fill="#fde68a"
          stroke="#fbbf24"
          strokeWidth="0.8"
          transform={`rotate(${angle}, ${110 + 13 * Math.cos((angle * Math.PI) / 180)}, ${94 + 13 * Math.sin((angle * Math.PI) / 180)})`}
          opacity="0.85"
        />
      ))}

      {/* ── Sad face on flower ── */}
      <circle cx="107" cy="93" r="1.4" fill="#78350f" />
      <circle cx="113" cy="93" r="1.4" fill="#78350f" />
      <path
        d="M107.5 97 Q110 95.5 112.5 97"
        stroke="#78350f"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Teardrop ── */}
      <path
        d="M110 100 Q109 105 110 107 Q111 105 110 100 Z"
        fill="#93c5fd"
        opacity="0.8"
      />

      {/* ── Magnifying glass ── */}
      {/* Handle */}
      <line
        x1="164"
        y1="150"
        x2="185"
        y2="172"
        stroke="#374151"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Glass ring */}
      <circle
        cx="152"
        cy="138"
        r="26"
        fill="white"
        fillOpacity="0.55"
        stroke="#374151"
        strokeWidth="4"
      />
      {/* Glass shine */}
      <path
        d="M140 126 Q145 122 152 124"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Question mark inside glass */}
      <text
        x="152"
        y="146"
        textAnchor="middle"
        fontSize="22"
        fontWeight="bold"
        fill="#374151"
        fontFamily="system-ui, sans-serif"
      >
        ?
      </text>

      {/* ── Floating leaves (decorative) ── */}
      <path
        d="M60 70 C55 60, 68 52, 72 62 C74 68, 65 74, 60 70 Z"
        fill="#6ee7b7"
        opacity="0.4"
      />
      <path
        d="M190 80 C185 70, 198 62, 202 72 C204 78, 195 84, 190 80 Z"
        fill="#6ee7b7"
        opacity="0.3"
      />
      <path
        d="M72 130 C68 122, 79 116, 82 124 C83 129, 76 134, 72 130 Z"
        fill="#a7f3d0"
        opacity="0.35"
      />
    </svg>
  );
}

// ─── Quick links grid data ─────────────────────────────────────────────────────
const QUICK_LINKS = [
  {
    label: "Featured Plants",
    href: "/shop?type=Plants",
    icon: Flower2,
    description: "Explore our botanist-curated plant collection",
    color: "text-emerald-600",
    bg: "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200/70",
  },
  {
    label: "Ceramic Pots",
    href: "/shop?type=Pots&category=Ceramic%20Pots",
    icon: Package,
    description: "Designer pots for every space",
    color: "text-amber-600",
    bg: "bg-amber-50 hover:bg-amber-100/80 border-amber-200/70",
  },
  {
    label: "Plant Care Blogs",
    href: "/blogs",
    icon: BookOpen,
    description: "Expert tips to keep your plants thriving",
    color: "text-sky-600",
    bg: "bg-sky-50 hover:bg-sky-100/80 border-sky-200/70",
  },
  {
    label: "Customer Support",
    href: "/contact",
    icon: Headphones,
    description: "We're here to help, always",
    color: "text-violet-600",
    bg: "bg-violet-50 hover:bg-violet-100/80 border-violet-200/70",
  },
] as const;

// ─── 404 Page ─────────────────────────────────────────────────────────────────
export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background relative">
      {/* Navbar — same as customer layout */}
      <Navbar />

      <main className="flex-grow w-full flex flex-col">
        {/* ── Hero section ────────────────────────────────────── */}
        <section className="relative flex-grow flex items-center justify-center overflow-hidden bg-hero pt-24 lg:pt-28 pb-16  px-4 sm:px-6">
          {/* Ambient background glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-400/10 rounded-full blur-[120px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 bg-teal-400/8 rounded-full blur-[90px]"
          />

          <div className="relative z-10 max-w-[1280px] mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

              {/* ── Left: Text content ── */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                {/* 404 badge */}
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-full px-4 py-1.5 mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold tracking-widest uppercase text-emerald-700 font-mono">
                    Error 404
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-[clamp(32px,5vw,54px)] font-black text-foreground tracking-tight leading-[1.1] mb-5">
                  Oops! This Page{" "}
                  <span className="text-emerald-600">Has Gone Off-Grid</span>
                </h1>

                {/* Subtext */}
                <p className="text-[15px] sm:text-[16px] text-slate-500 leading-[1.75] max-w-[480px] mx-auto lg:mx-0 mb-9">
                  The plant or page you are looking for might have been{" "}
                  <strong className="text-slate-700 font-semibold">moved</strong>,{" "}
                  <strong className="text-slate-700 font-semibold">renamed</strong>, or
                  is currently{" "}
                  <strong className="text-slate-700 font-semibold">
                    out of stock
                  </strong>
                  . Let&apos;s get you back to green pastures.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-10">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[15px] px-6 py-3.5 rounded-xl shadow-[0_4px_18px_rgba(5,150,105,0.28)] hover:shadow-[0_6px_24px_rgba(5,150,105,0.38)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 no-underline"
                  >
                    <Home className="w-[18px] h-[18px]" />
                    <span>Back to Home</span>
                  </Link>

                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-300 hover:border-emerald-500 font-bold text-[15px] px-6 py-3.5 rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200 no-underline shadow-sm"
                  >
                    <ShoppingBag className="w-[18px] h-[18px]" />
                    <span>Explore Shop</span>
                  </Link>
                </div>

                {/* Decorative divider */}
                <div className="flex items-center gap-3 justify-center lg:justify-start mb-7">
                  <div className="h-px flex-1 max-w-[80px] bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                    or jump to
                  </span>
                  <div className="h-px flex-1 max-w-[80px] bg-slate-200" />
                </div>

                {/* Quick Links grid */}
                <div className="grid grid-cols-2 gap-2.5 max-w-[480px] mx-auto lg:mx-0">
                  {QUICK_LINKS.map(({ label, href, icon: Icon, description, color, bg }) => (
                    <Link
                      key={label}
                      href={href}
                      className={`group flex flex-col gap-1.5 p-3.5 rounded-xl border ${bg} transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] no-underline shadow-sm`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                        <span className={`text-[13px] font-bold ${color}`}>
                          {label}
                        </span>
                        <ArrowRight
                          className={`w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity ${color}`}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── Right: Illustration ── */}
              <div className="order-1 lg:order-2 flex items-center justify-center">
                <div className="relative w-full max-w-[340px] mx-auto">
                  {/* Soft glow behind illustration */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-8 bg-emerald-200/40 rounded-full blur-3xl"
                  />

                  {/* Illustration card */}
                  <div className="relative z-10 bg-white/60 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 shadow-[0_12px_40px_rgba(5,150,105,0.08)] animate-urban-nursery-float">
                    <PlantIllustration />

                    {/* Caption badge */}
                    <div className="mt-4 flex justify-center">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-semibold px-3 py-1 rounded-full">
                        <span>🌱</span>
                        <span>Still looking for the right plant?</span>
                      </span>
                    </div>
                  </div>

                  {/* Floating decorative leaves */}
                  <div
                    aria-hidden="true"
                    className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200/60 flex items-center justify-center text-xl shadow-sm animate-urban-nursery-float-delay"
                  >
                    🍃
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-3 -right-3 w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-base shadow-sm animate-urban-nursery-float"
                    style={{ animationDelay: "0.75s" }}
                  >
                    🌿
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer — same as customer layout */}
      <Footer />
    </div>
  );
}
