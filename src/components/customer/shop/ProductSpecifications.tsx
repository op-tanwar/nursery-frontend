"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import type { ShopUrlType } from "@/services/server/productServerService";
import { buildProductSpecs, SpecItem } from "@/utils/productSpecMapper";

export type { SpecItem };

interface ProductSpecificationsProps {
  product: any;
  shopType: ShopUrlType | string;
}

export default function ProductSpecifications({
  product,
  shopType,
}: ProductSpecificationsProps) {
  if (!product) return null;

  const specs = buildProductSpecs(product, shopType);

  if (specs.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Verified Technical Specifications
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {specs.length} attributes logged
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {specs.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:px-4 sm:py-3 gap-2 transition-colors hover:bg-slate-50/60 ${
                idx % 2 === 1 ? "bg-slate-50/30" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-[200px]">
                <div className="w-7 h-7 rounded-lg bg-slate-100/80 border border-slate-200/50 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2 pl-9 sm:pl-0 sm:justify-end text-right">
                <span className="text-xs text-slate-900 font-semibold leading-relaxed">
                  {item.value}
                </span>
                {item.badge && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight border shrink-0 ${
                      item.badge.variant === "emerald"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : item.badge.variant === "amber"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : item.badge.variant === "blue"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : item.badge.variant === "rose"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {item.badge.text}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
