"use client";

import React from "react";
import { Ticket, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { CouponStats } from "../types";

interface CouponStatsCardsProps {
  stats: CouponStats;
  isLoading?: boolean;
}

export default function CouponStatsCards({ stats, isLoading }: CouponStatsCardsProps) {
  const cards = [
    {
      title: "Total Coupons",
      value: stats.totalCoupons,
      description: "All-time promotional vouchers",
      icon: Ticket,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-100",
    },
    {
      title: "Active Campaigns",
      value: stats.activeCoupons,
      description: "Live & redeemable at checkout",
      icon: CheckCircle2,
      bgColor: "bg-teal-50",
      textColor: "text-teal-700",
      borderColor: "border-teal-100",
    },
    {
      title: "Total Redemptions",
      value: stats.totalRedemptions,
      description: "Successful customer checkouts",
      icon: TrendingUp,
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      borderColor: "border-indigo-100",
    },
    {
      title: "Expired / Depleted",
      value: stats.expiredCoupons,
      description: "Exceeded date or limits",
      icon: AlertTriangle,
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`p-5 rounded-2xl bg-white border ${card.borderColor} shadow-xs transition-all hover:shadow-md flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.textColor}`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            <div className="mt-4">
              {isLoading ? (
                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg" />
              ) : (
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {card.value.toLocaleString("en-IN")}
                </div>
              )}
              <p className="text-[11px] text-slate-400 mt-1 font-medium">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
