"use client";

import React from "react";
import {
  ICategoryBreakdown,
  DEFAULT_COMMISSION_RATES,
  formatINR,
  formatCommissionPercent,
  ICommissionRates,
} from "@/types/dashboard.types";

export interface CategoryPerformanceProps {
  categories: ICategoryBreakdown[];
  title?: string;
  subtitle?: string;
  commissionRates?: ICommissionRates;
  variant?: "nursery" | "admin";
}

const CATEGORY_NAMES: Record<string, string> = {
  Plant: "Plants",
  Pot: "Pots & Planters",
  Accessory: "Accessories",
  GardeningTool: "Gardening Tools",
  PlantCare: "Plant Care",
  SeedsBulbs: "Seeds & Bulbs",
  PlantStandsShelves: "Stands & Shelves",
  ArtificialDriedPlant: "Artificial & Dried Plants",
};

export default function CategoryPerformance({
  categories,
  title,
  subtitle,
  commissionRates = DEFAULT_COMMISSION_RATES,
  variant = "nursery",
}: CategoryPerformanceProps) {
  const isAdmin = variant === "admin";
  const resolvedTitle =
    title ||
    (isAdmin
      ? "Category Marketplace Performance"
      : "My Sales by Category");
  const resolvedSubtitle =
    subtitle ||
    (isAdmin
      ? "Itemized GMV, commission collected, and net vendor payout per category"
      : "See exactly how much you earned across all product categories");

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">{resolvedTitle}</h3>
        <p className="text-xs text-slate-400 font-medium">{resolvedSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {categories.length === 0 ? (
          <p className="text-xs text-slate-400 col-span-full">
            No category performance records found for this period.
          </p>
        ) : (
          categories.map((cat) => {
            const displayName = CATEGORY_NAMES[cat.category] || `${cat.category}s`;
            const rate =
              cat.commissionRate ||
              commissionRates[cat.category] ||
              DEFAULT_COMMISSION_RATES[cat.category] ||
              0.2;
            const gross = Number(cat.grossRevenue ?? cat.revenue ?? 0) || 0;
            const commission = Number(cat.commission) || 0;
            const net = Number(cat.netEarnings) || 0;
            const orders = cat.orderCount ?? cat.ordersCount ?? 0;

            return (
              <div
                key={cat.category}
                className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-sm text-slate-800">
                    {displayName}
                  </span>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
                    {formatCommissionPercent(rate)} platform fee
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Gross Sales</span>
                    <span className="font-bold text-slate-800">
                      {formatINR(gross)}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-500 font-medium">
                    <span>
                      {isAdmin ? "Commission Collected" : "Commission Deducted"}
                    </span>
                    <span className="font-bold">− {formatINR(commission)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold pt-2 border-t border-slate-200">
                    <span>
                      {isAdmin ? "Net Nursery Payout" : "My Net Earnings"}
                    </span>
                    <span>{formatINR(net)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium pt-1">
                    {formatINR(gross)} − {formatINR(commission)} = {formatINR(net)}{" "}
                    · {orders} orders
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
