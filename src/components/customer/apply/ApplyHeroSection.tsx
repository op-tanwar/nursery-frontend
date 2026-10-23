import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Wallet,
  Users,
  Sparkles,
  Sprout,
  CheckCircle2,
  Percent,
} from "lucide-react";

const TRUST_METRICS = [
  {
    icon: Percent,
    title: "0% Onboarding Fee",
    desc: "Free catalog setup",
  },
  {
    icon: Truck,
    title: "PAN-India Logistics",
    desc: "Doorstep seller pickups",
  },
  {
    icon: Wallet,
    title: "Weekly Payouts",
    desc: "Direct bank settlement",
  },
  {
    icon: Users,
    title: "50k+ Happy Gardeners",
    desc: "Active plant buyers",
  },
] as const;

const VENDOR_PERKS = [
  "No upfront or recurring listing fees ever",
  "Pickups scheduled right from your nursery",
  "Protected packaging supplies delivered to you",
  "Automated weekly direct deposit settlements",
] as const;

export default function ApplyHeroSection() {
  return (
    <section
      className="relative flex items-center overflow-hidden py-20"
      style={{
        background:
          "linear-gradient(160deg, #f0fdf4 0%, #dcfce7 35%, #fcfdfc 70%)",
      }}
    >
      {/* ── Concentric Geometry Rings (Matches AboutHero) ── */}
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
            border: "1px solid rgba(21, 128, 61, 0.08)",
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
          backgroundImage:
            "radial-gradient(rgba(21, 128, 61, 0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      {/* ── Ambient Glow Blobs ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[5%] left-[-8%] w-[400px] h-[400px] rounded-full bg-brand-dark/5 blur-3xl"
      />

      {/* ── Main Responsive Grid ── */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center">

        {/* ══════════ LEFT COLUMN: Story Copy & CTAs ══════════ */}
        <div className="flex flex-col">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 self-start rounded-full px-[14px] py-[6px] mb-6 bg-brand-primary/10 border border-brand-primary/20">
            <span className="w-2 h-2 rounded-full shrink-0 animate-urban-nursery-pulse bg-brand-primary" />
            <span className="text-[13px] font-bold tracking-wide uppercase text-brand-dark">
              🌱 Partner With Urban Nursery
            </span>
          </div>

          {/* Core Vendor Headline — Strictly 2 Lines */}
          <h1 className="text-[clamp(28px,3.2vw,44px)] font-black leading-[1.15] tracking-[-0.03em] m-0 mb-6 text-foreground">
            <span>Grow Your Nursery into a</span>
            <br />
            <span className="bg-gradient-to-r from-brand-primary via-emerald-600 to-teal-700 bg-clip-text text-transparent">
              Pan-India Plant Brand.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-[clamp(15px,2vw,17px)] leading-[1.75] m-0 mb-8 max-w-[500px] text-muted-text font-normal">
            List your plants online with zero setup fees. We handle nationwide doorstep pickup logistics, sustainable transit packaging, and automated weekly direct settlements so you can focus on growing premium greenery.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <a
              href="#apply-form"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-[14px] font-bold text-white rounded-[13px] bg-brand-primary hover:bg-brand-dark shadow-[0_4px_14px_rgba(21,128,61,0.25)] transition-all duration-200 cursor-pointer active:scale-[0.98] no-underline"
            >
              <span>Apply as a Vendor</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#how-it-works"
              className="px-7 py-3.5 text-[14px] font-bold text-foreground bg-panel border border-line rounded-[13px] hover:bg-brand-light hover:border-brand-primary/30 transition-all duration-200 no-underline inline-block shadow-2xs"
            >
              How It Works ↓
            </a>
          </div>

          {/* Micro Trust Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 pt-4 border-t border-line/60">
            {TRUST_METRICS.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.title} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-brand-primary font-bold text-[13px]">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{metric.title}</span>
                  </div>
                  <span className="text-[12px] text-muted-text font-medium">
                    {metric.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════ RIGHT COLUMN: High-Fidelity Interactive Visual ══════════ */}
        <div className="hidden lg:flex justify-center items-center relative select-none z-10">
          {/* Main Showcase Container */}
          <div className="w-full max-w-[440px] rounded-[24px] p-6 bg-panel border border-line shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_24px_50px_rgba(21,128,61,0.06)] relative">

            {/* Visual Header Badge */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
              <div className="flex items-center gap-2 text-[12px] font-extrabold text-brand-primary tracking-wider uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Seller Onboarding</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-primary/10 text-brand-dark">
                FREE LISTING
              </span>
            </div>

            {/* Product Feature Image Frame */}
            <div className="h-[180px] rounded-[16px] flex items-center justify-center mb-5 relative bg-gradient-to-br from-brand-light to-emerald-100 shadow-inner overflow-hidden group">
              <span className="transition-transform duration-500 inline-block">
                <Image
                  src="/images/logo-new.png"
                  alt="Urban Nursery Seller Network"
                  width={250}
                  height={120}
                  className="object-contain w-auto h-auto transition-all duration-300 mix-blend-multiply drop-shadow-md hover:scale-105"
                  priority
                />
              </span>
              <span className="absolute top-3 left-3 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full flex items-center gap-1 bg-brand-primary shadow-xs">
                <ShieldCheck className="w-3 h-3" />
                <span>Escrow Safe Payouts</span>
              </span>
            </div>

            {/* Core Value Points inside Card */}
            <div className="space-y-2.5 mb-5">
              {VENDOR_PERKS.map((point, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[13px] font-medium text-foreground/90">
                  <span className="text-brand-primary font-bold text-[14px] shrink-0 select-none">
                    <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                  </span>
                  <span className={i === 0 ? "font-bold text-foreground" : "text-muted-text"}>
                    {point}
                  </span>
                </div>
              ))}
            </div>

            {/* Card Action Link */}
            <div className="pt-3 border-t border-line flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-text uppercase m-0">Setup Time</p>
                <p className="text-[14px] font-black text-brand-dark m-0">Under 2 Mins</p>
              </div>
              <a
                href="#apply-form"
                className="flex items-center gap-1.5 text-white text-[13px] font-bold px-4 py-2 rounded-[10px] bg-brand-primary hover:bg-brand-dark transition-all active:scale-[0.97] no-underline"
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </a>
            </div>
          </div>

          {/* Dynamic Badge — Top Right */}
          <div className="absolute -top-4 right-[-10px] rounded-[16px] p-3.5 animate-urban-nursery-float bg-panel border border-line shadow-[0_12px_24px_rgba(0,0,0,0.04)] transform rotate-2">
            <p className="text-[11px] font-bold tracking-wider uppercase m-0 mb-0.5 text-muted-text/80">
              Verified Partners
            </p>
            <p className="text-[16px] font-black m-0 text-brand-primary tracking-tight">
              340+ Nurseries 🌱
            </p>
            <p className="text-[11px] font-semibold m-0 text-muted-text/80">
              Pan-India logistics
            </p>
          </div>

          {/* Floating Rating Badge — Bottom Left */}
          <div className="absolute bottom-2 -left-6 rounded-[16px] p-3.5 animate-urban-nursery-float-delay bg-panel border border-line shadow-[0_12px_24px_rgba(0,0,0,0.04)] transform -rotate-1">
            <p className="text-[15px] font-black m-0 flex items-center gap-1 text-foreground">
              <span className="text-amber-400">★</span>
              <span className="tracking-tight">4.9/5 Rating</span>
            </p>
            <p className="text-[11px] font-semibold m-0 mt-0.5 text-muted-text/80 whitespace-nowrap">
              Vendor satisfaction rate
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}