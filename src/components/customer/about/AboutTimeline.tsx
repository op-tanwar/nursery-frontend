"use client";

import { useState } from "react";
import { Sprout, Layers, ShieldCheck, Rocket } from "lucide-react";

const TIMELINE = [
  {
    year: "Q1 2026",
    tag: "The Spark",
    title: "The Idea Sprouts",
    desc: "Founders frustrated by receiving damaged Monstera from traditional platforms visited 40+ local nurseries across Pune and Bangalore. Discovered incredible stock struggling with zero digital reach.",
    icon: Sprout,
    metrics: "40+ Local Nurseries Audited",
  },
  {
    year: "Q2 2026",
    tag: "Pilot Phase",
    title: "First 50 Merchant Partners",
    desc: "Urban Nursery onboarded its founding nursery cohort. Co-engineered zero-damage bio-packaging protocols with Pune botanists and successfully completed first 500 test deliveries.",
    icon: Layers,
    metrics: "0% Transit Damage Standard",
  },
  {
    year: "Q3 2026",
    tag: "Official Launch",
    title: "Urban Nursery Guard™ & Marketplace Live",
    desc: "Escrow-backed payment security went live alongside automated logistics dispatch. Expanded to 340+ verified sellers across 12 major metro hubs.",
    icon: ShieldCheck,
    metrics: "340+ Onboarded Vendors",
  },
  {
    year: "Q4 2026 & Beyond",
    tag: "Pan-India Expansion",
    title: "Scaling Green Infrastructure",
    desc: "Launching Urban Nursery Care post-delivery horticultural support and expanding operations to 150+ Tier-2 cities with a target of 1M healthy plants delivered.",
    icon: Rocket,
    metrics: "Target 150+ Active Cities",
  },
] as const;

export default function AboutTimeline() {
  const [activeYear, setActiveYear] = useState<string>("Q3 2026");

  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden">
      <div className="w-full max-w-[1100px] mx-auto relative z-10">

        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-brand-primary">
            Roadmap 2026
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-black m-0 mt-2 tracking-tight text-foreground">
            From Broken Supply to Living Platform
          </h2>
          <p className="mt-3 text-[15px] text-muted-text max-w-[540px] mx-auto font-sans">
            How we are transforming fragmented local nurseries into India&apos;s most reliable direct-to-consumer plant network.
          </p>
        </div>

        {/* Timeline Interactive Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Navigation: Milestone Selector */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {TIMELINE.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeYear === item.year;

              return (
                <button
                  key={item.year}
                  onClick={() => setActiveYear(item.year)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 cursor-pointer relative overflow-hidden ${isActive
                    ? "bg-white border-brand-primary shadow-[0_8px_30px_rgba(21,128,61,0.12)]"
                    : "bg-white border-line hover:bg-brand-light/20 hover:border-brand-primary/30 opacity-80 hover:opacity-100"
                    }`}
                >
                  {/* Left Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-primary" />
                  )}

                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${isActive
                      ? "bg-brand-primary text-white"
                      : "bg-brand-light/60 text-brand-primary"
                      }`}
                  >
                    <IconComponent size={20} strokeWidth={2} />
                  </div>

                  <div className="flex-1 min-w-0 font-sans">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[12px] font-bold uppercase tracking-wider text-brand-primary">
                        {item.year}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-light text-brand-primary">
                        {item.tag}
                      </span>
                    </div>
                    <div className="text-[15px] font-bold text-foreground truncate">
                      {item.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detailed Card Preview */}
          <div className="lg:col-span-7">
            {TIMELINE.filter((t) => t.year === activeYear).map((t) => {
              const IconComponent = t.icon;

              return (
                <div
                  key={t.year}
                  className="bg-white border border-line rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                >
                  {/* Background Watermark Icon */}
                  <div className="absolute right-[-25px] bottom-[-25px] text-brand-primary/[0.04] pointer-events-none">
                    <IconComponent size={220} strokeWidth={1} />
                  </div>

                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-light text-brand-primary text-[12px] font-bold uppercase tracking-wider mb-6 font-sans">
                      <IconComponent size={14} />
                      {t.year} Phase
                    </div>

                    <h3 className="text-[clamp(24px,3vw,32px)] font-black text-foreground tracking-tight mb-4 m-0">
                      {t.title}
                    </h3>

                    <p className="text-[15px] sm:text-[16px] text-muted-text leading-[1.75] font-sans mb-8 m-0">
                      {t.desc}
                    </p>

                    {/* Milestone Highlight Footer */}
                    <div className="pt-6 border-t border-line flex items-center justify-between font-sans">
                      <span className="text-[12px] uppercase tracking-wider text-muted-text font-semibold">
                        Core Milestone
                      </span>
                      <span className="text-[13px] font-bold text-brand-primary bg-brand-light/50 px-3.5 py-1.5 rounded-xl border border-brand-primary/10">
                        ⚡ {t.metrics}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}