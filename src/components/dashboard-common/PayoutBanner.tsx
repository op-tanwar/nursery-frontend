"use client";

import React from "react";
import { CalendarClock, Info } from "lucide-react";
import { IPayoutInfo, formatINR } from "@/types/dashboard.types";

export interface PayoutBannerProps {
  payouts: IPayoutInfo;
  /** nursery | admin label tone */
  variant?: "nursery" | "admin";
  title?: string;
  description?: string;
}

export default function PayoutBanner({
  payouts,
  variant = "nursery",
  title,
  description,
}: PayoutBannerProps) {
  const isAdmin = variant === "admin";
  const resolvedTitle =
    title ||
    (isAdmin ? "Weekly Vendor Settlement Engine" : "Weekly Settlement Engine");
  const resolvedDescription =
    description ||
    (isAdmin
      ? "Every Monday, pending nursery payouts are settled. Current-week totals keep accruing until the week closes."
      : "Every Monday your pending settlement is paid out. Current-week earnings keep accruing until the week closes.");

  const statusLabel = payouts.status || "Processing";
  const nextLabel =
    payouts.nextSettlementLabel ||
    (payouts.nextSettlementDate
      ? `Next payout on ${payouts.nextSettlementDate}`
      : "Next payout date pending");

  const weeklyPayable = payouts.weeklyPayable ?? 0;
  const pendingAmount = payouts.pendingPayout ?? payouts.pendingPayouts ?? 0;
  const paidAmount = payouts.paidAmount ?? payouts.totalPaidOut ?? 0;

  return (
    <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              {resolvedTitle}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {statusLabel}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-emerald-400 shrink-0" />
            {nextLabel}
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">{resolvedDescription}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            Current Week Payable
            <span
              className="cursor-help"
              title={
                isAdmin
                  ? "Net amount nurseries earned this week (still accruing; settles after week closes)."
                  : "Your net earnings this week (still accruing; settles after this week closes)."
              }
            >
              <Info className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mt-2">
            {formatINR(weeklyPayable)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Accruing · not yet due</p>
        </div>

        <div className="rounded-2xl bg-slate-800/80 border border-amber-700/40 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300/90">
            Pending Settlement
            <span
              className="cursor-help"
              title="Last week's closed cycle — scheduled for the upcoming Monday payout."
            >
              <Info className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-2">
            {formatINR(pendingAmount)}
          </p>
          <p className="text-[11px] text-amber-500/80 mt-1">
            Pays out on next Monday
          </p>
        </div>

        <div className="rounded-2xl bg-slate-800/80 border border-emerald-700/40 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300/90">
            Total Lifetime Settled
            <span
              className="cursor-help"
              title="All previously settled net payouts (excludes current week + pending week)."
            >
              <Info className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-2">
            {formatINR(paidAmount)}
          </p>
          <p className="text-[11px] text-emerald-500/80 mt-1">
            Already transferred historically
          </p>
        </div>
      </div>
    </div>
  );
}
