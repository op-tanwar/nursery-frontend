"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PackageCheck,
  Droplets,
  ShieldAlert,
  Sparkles,
  Check,
  X
} from "lucide-react";

export default function PackagingGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs my-8">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
        <Link
          href="/nursery/dashboard"
          className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
            Plant Packaging & Quality Guidelines
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 m-0">
            Standard operating procedure (SOP) to ensure zero soil spill and zero foliage damage during local transit.
          </p>
        </div>
      </div>

      {/* 4-STEP PACKAGING SOP */}
      <div className="space-y-6 mb-10">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider m-0">
          4-Step Safe Packaging Protocol
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-xs text-slate-900 m-0">Hydration & Health Check</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed m-0 pl-8">
              Water the plant 1–2 hours prior to rider pickup. Ensure the soil is damp but not overflowing with excess standing water.
            </p>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-xs text-slate-900 m-0">Soil-Lock Pot Wrapping</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed m-0 pl-8">
              Cover the top soil layer with eco-friendly paper or jute wrap around the base stem to prevent soil displacement while riding over bumps.
            </p>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-xs text-slate-900 m-0">Foliage Protective Sleeve</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed m-0 pl-8">
              Slide a breathable paper sleeve over delicate leaves and stems to protect delicate foliage from wind gusts during motorbike transit.
            </p>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="font-bold text-xs text-slate-900 m-0">Sturdy Carry Outer Box</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed m-0 pl-8">
              Place the potted plant inside an Urban Nursery branded ventilated corrugated box or tote handle bag to ensure easy rider handling.
            </p>
          </div>
        </div>
      </div>

      {/* DO's & DONT's */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* DO'S */}
        <div className="p-5 border border-emerald-200 bg-emerald-50/40 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Recommended Practices (DOs)</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-2 pl-2 m-0 list-none">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span> Use sturdy plastic or terracotta pots with proper drainage holes.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span> Attach the printed order invoice clearly on the outer package box.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span> Trim yellowed or dead leaves before placing the plant in the package.
            </li>
          </ul>
        </div>

        {/* DONT'S */}
        <div className="p-5 border border-rose-200 bg-rose-50/40 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wide">
            <X className="w-4 h-4 text-rose-600" />
            <span>Strictly Prohibited (DONTs)</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-2 pl-2 m-0 list-none">
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">•</span> Never pack dry or wilted plants suffering from pest infestations.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">•</span> Do not seal plastic bags airtight over living leaves (causes suffocation).
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">•</span> Never include off-platform promotional flyers or direct phone numbers.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}