import Link from "next/link";
import { Star, ShieldCheck, ShoppingCart } from "lucide-react";
import Image from "next/image";
import HeroSearchForm from "./HeroSearchForm";

const TRUST_BADGES = [
  "🚚 Pan-India Delivery",
  "🌿 1,200+ Plants",
  "⭐ 4.9 Rated",
] as const;

const MANIFESTO_LINES = [
  "Every home deserves a living plant.",
  "Every nursery deserves a digital shelf.",
  "Every delivery deserves a botanist's promise.",

] as const;

export default function Hero() {
  return (
    <section
      className="relative flex items-center overflow-hidden py-20"
      style={{
        background: "linear-gradient(160deg, #f0fdf4 0%, #dcfce7 35%, #fcfdfc 70%)",
      }}
    >
      {/* ── Decorative Concentric Geometry Rings (Right Side) ── */}
      {[400, 600, 800].map((size) => (
        <div
          key={size}
          style={{
            position: "absolute",
            top: "50%",
            right: "-10%",
            width: size,
            height: size,
            borderRadius: "50%",
            border: "1px solid rgba(21, 128, 61, 0.12)",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* ── Micro Dot Grid Overlay ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "radial-gradient(rgba(21, 128, 61, 0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      {/* ── Decorative Blur Blobs ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[5%] left-[-8%] w-[400px] h-[400px] rounded-full bg-emerald-800/5 blur-3xl"
      />

      {/* ── Main Content Grid ── */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center">

        {/* ══════════ LEFT COLUMN: Branding & Conversion Copy ══════════ */}
        <div className="flex flex-col">

          {/* Pill Tagline Badge */}
          <div className="inline-flex items-center gap-2 self-start rounded-full px-[14px] py-[6px] mb-6 bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full shrink-0 animate-pulse bg-emerald-600" />
            <span className="text-[13px] font-bold tracking-wide uppercase text-emerald-950">
              India&apos;s First Certified Plant Marketplace
            </span>
          </div>

          {/* Core Value Proposition Headline */}
          <h1 className="text-[clamp(36px,5vw,58px)] font-black leading-[1.15] tracking-[-0.03em] m-0 mb-6 text-slate-900">
            Premium Plants,
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              Delivered Alive.
            </span>
          </h1>

          {/* Sub-copy Descriptions */}
          <p className="text-[clamp(15px,2vw,17px)] leading-[1.7] m-0 mb-8 max-w-[490px] text-slate-600 font-medium">
            Certified local nurseries. Botanist-verified plants. Custom eco-packaging
            engineered to prevent transit shock. The urban home deserves premium green.
          </p>

          {/* Conversion Search Engine Bar & Shop Action */}
          <HeroSearchForm />

          {/* Micro Trust badges */}
          <div className="flex flex-wrap gap-5 pt-1">
            {TRUST_BADGES.map((badge) => (
              <span
                key={badge}
                className="text-[13px] font-semibold flex items-center gap-1.5 text-slate-700 tracking-wide"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* ══════════ RIGHT COLUMN: High-Fidelity Interactive Visual ══════════ */}
        <div className="hidden lg:flex justify-center items-center relative select-none">

          {/* Main Showcase Product Card */}
          <div className="rounded-[24px] p-5 max-w-[310px] w-full bg-white/80 backdrop-blur-md border border-emerald-200/60 shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_24px_50px_rgba(21,128,61,0.08)]">

            {/* Plant Image Dynamic Container Layout */}
            <div className="h-[220px] rounded-[16px] flex items-center justify-center text-[85px] mb-5 relative bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-inner overflow-hidden group">
              {/* <span className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2 inline-block">
                🌿
              </span> */}
              <span className="transition-transform duration-500  inline-block">
                <Image
                  src="/images/logo-new.png"
                  alt="Urban Nursery Logo"
                  width={250}
                  height={120}
                  priority
                  className="object-contain w-auto h-auto transition-all duration-300 opacity-100  mix-blend-multiply drop-shadow-md hover:scale-105"
                />
              </span>
              <span className="absolute top-3 left-3 text-white text-[10px] font-bold tracking-wider uppercase px-[10px] py-1 rounded-full flex items-center gap-1 bg-emerald-700 shadow-xs">
                <ShieldCheck className="w-3 h-3" />
                <span>Botanist Verified</span>
              </span>
            </div>

            {/* Product Meta Specifications */}
            {/* <h3 className="text-[18px] font-extrabold m-0 mb-1 text-slate-900 tracking-tight">
              Monstera Deliciosa
            </h3>
            <p className="text-[12px] m-0 mb-4 text-slate-500 font-semibold tracking-wide">
              Green Roots Nursery, Pune
            </p> */}
            <div id="manifesto" className="space-y-2.5 mb-5">
              {MANIFESTO_LINES.map((line, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[13px] font-medium text-foreground/90">
                  <span className="text-brand-primary font-bold text-[14px] shrink-0 select-none">
                    ✓
                  </span>
                  <span className={i === 0 ? "font-bold text-foreground" : "text-muted-text"}>
                    {line}
                  </span>
                </div>
              ))}
            </div>

            {/* Transactional Pricing CTA */}
            <div className="flex items-center justify-end pt-0.5">
              {/* <span className="text-[22px] font-black text-emerald-950 tracking-tight">
                ₹899
              </span> */}
              <Link
                href="/shop"
                className="w-full flex justify-center items-center gap-1.5 text-white text-[13px] font-bold px-4 py-2.5 rounded-[12px] transition-all duration-200 bg-emerald-700 hover:bg-emerald-800 shadow-xs active:scale-[0.97]"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Shop Now</span>
              </Link>
            </div>
          </div>

          {/* Dynamic Badge — Weekly Volume Metrics */}
          <div className="absolute -top-4 right-[-8px] rounded-[16px] p-3.5 bg-white/90 backdrop-blur-md border border-emerald-200/60 shadow-[0_12px_24px_rgba(0,0,0,0.04)] transform rotate-2">
            <p className="text-[11px] font-bold tracking-wider uppercase m-0 mb-0.5 text-slate-500">
              This week
            </p>
            <p className="text-[16px] font-black m-0 text-emerald-700 tracking-tight">
              2,847 plants 🌱
            </p>
            <p className="text-[11px] font-semibold m-0 text-slate-500">
              delivered fresh
            </p>
          </div>

          {/* Floating Live Badge -- Aggregate Rating Analytics */}
          <div className="absolute bottom-4 -left-2 rounded-[16px] p-3.5 bg-white/90 backdrop-blur-md border border-emerald-200/60 shadow-[0_12px_24px_rgba(0,0,0,0.04)] transform -rotate-1">
            <p className="text-[15px] font-black m-0 flex items-center gap-1 text-slate-900">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 stroke-amber-400" />
              <span className="tracking-tight">4.9 / 5</span>
            </p>
            <p className="text-[11px] font-semibold m-0 mt-1 text-slate-500 whitespace-nowrap">
              12,400+ verified reviews
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}