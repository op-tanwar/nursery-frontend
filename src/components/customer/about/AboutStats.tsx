"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, Users, ShieldCheck, MapPin } from "lucide-react";

const STATS = [
  {
    value: "340+",
    label: "Vendor Nurseries",
    sub: "verified local partners",
    icon: Users,
  },
  {
    value: "48K+",
    label: "Plants Delivered",
    sub: "with 0% damage rate",
    icon: TrendingUp,
  },
  {
    value: "150+",
    label: "Cities Covered",
    sub: "pan-India delivery reach",
    icon: MapPin,
  },
  {
    value: "4.9★",
    label: "Customer Rating",
    sub: "from 12,400+ reviews",
    icon: ShieldCheck,
  },
] as const;

export default function AboutStats() {
  const [visibleStats, setVisibleStats] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleStats(true);
      },
      { threshold: 0.1 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={statsRef}
      className="w-full bg-brand-dark py-[80px] px-6 box-border relative overflow-hidden"
    >
      {/* ── Background Subtle Radial Glow ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-full pointer-events-none bg-[radial-gradient(circle_at_top,rgba(21,128,61,0.18),transparent_55%)]" />

      {/* ── Background Micro Grid Pattern ── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="w-full max-w-[1100px] mx-auto relative z-10">

        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] mb-3">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-[12px] font-bold tracking-widest uppercase text-brand-light">
              By the Numbers
            </span>
          </div>
          <h2 className="text-[clamp(28px,4vw,44px)] font-black m-0 tracking-tight text-white">
            Proven Impact Across India
          </h2>
        </div>

        {/* 4-Column Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((s, i) => {
            const IconComponent = s.icon;

            return (
              <div
                key={s.label}
                className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md transition-all duration-300 hover:bg-white/[0.07] hover:border-brand-primary/40 hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px_rgba(21,128,61,0.3)] overflow-hidden"
                style={{
                  transform: visibleStats ? "translateY(0)" : "translateY(24px)",
                  opacity: visibleStats ? 1 : 0,
                  transitionDelay: `${i * 90}ms`,
                }}
              >
                {/* Background Leaf Deco on Hover */}
                <div className="absolute right-[-25px] bottom-[-25px] opacity-[0.03] text-white pointer-events-none transition-transform duration-500 group-hover:scale-125 group-hover:opacity-[0.08] group-hover:-rotate-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-32 h-32"
                  >
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-13.9.2" />
                    <path d="M9 22v-4h4" />
                  </svg>
                </div>

                {/* Top Icon Bar */}
                <div className="w-11 h-11 mb-5 bg-white/[0.06] border border-white/[0.1] rounded-xl flex items-center justify-center text-brand-light transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary">
                  <IconComponent size={20} strokeWidth={2} />
                </div>

                {/* Values & Labels */}
                <div className="relative z-10">
                  <div className="text-[clamp(28px,3vw,38px)] font-black leading-none mb-2 tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    {s.value}
                  </div>
                  <div className="text-[14px] font-bold text-white/90 mb-1 leading-snug">
                    {s.label}
                  </div>
                  <div className="text-[12px] text-white/55 font-normal leading-normal">
                    {s.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}