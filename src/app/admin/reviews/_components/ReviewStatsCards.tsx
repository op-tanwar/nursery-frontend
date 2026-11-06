"use client";

import React from "react";
import { MessageSquare, Clock, AlertTriangle, Star, CheckCircle, ShieldAlert } from "lucide-react";
import { IAdminReviewStats } from "@/types/review.types";

interface ReviewStatsCardsProps {
  stats: IAdminReviewStats;
  isLoading: boolean;
}

export default function ReviewStatsCards({ stats, isLoading }: ReviewStatsCardsProps) {
  const cards = [
    {
      title: "Total Reviews",
      value: stats.totalReviews,
      subtitle: "Across entire platform catalog",
      icon: MessageSquare,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      accent: "text-blue-700",
    },
    {
      title: "Pending Moderation",
      value: stats.pendingReviews,
      subtitle: "Awaiting administrator review",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      accent: "text-amber-700",
      badge: stats.pendingReviews > 0 ? "Requires Action" : undefined,
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      title: "Flagged / Reported",
      value: stats.flaggedReviews,
      subtitle: "Flagged for content violation",
      icon: ShieldAlert,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      accent: "text-rose-700",
      badge: stats.flaggedReviews > 0 ? "Priority Alert" : undefined,
      badgeColor: "bg-rose-100 text-rose-800",
    },
    {
      title: "Platform Average Rating",
      value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ★` : "0.0 ★",
      subtitle: `${stats.approvedReviews} approved reviews active`,
      icon: Star,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      accent: "text-emerald-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {card.value}
                    </span>
                  )}
                  {card.badge && !isLoading && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
              </div>

              <div
                className={`p-3 rounded-xl border ${card.color} flex items-center justify-center shrink-0 ml-3`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
