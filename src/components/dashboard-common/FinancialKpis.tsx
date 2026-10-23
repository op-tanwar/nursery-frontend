"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Percent,
  Info,
} from "lucide-react";
import {
  DEFAULT_COMMISSION_RATES,
  formatINR,
  formatCommissionPercent,
  ICommissionRates,
  IInventorySummary,
} from "@/types/dashboard.types";

export interface FinancialKpisProps {
  grossRevenue: number;
  commissionDeducted: number;
  netPayablePayout: number;
  lowStockCount: number;
  outOfStockCount?: number;
  healthyStockCount?: number;
  inventorySummary?: Pick<
    IInventorySummary,
    | "plants"
    | "pots"
    | "accessories"
    | "gardeningTools"
    | "plantCare"
    | "seedsBulbs"
    | "plantStands"
    | "artificialDriedPlants"
    | "totalProducts"
  >;
  commissionRates?: ICommissionRates;
  /** nursery = seller view; admin = platform view */
  variant?: "nursery" | "admin";
}

function InfoTip({ text }: { text: string }) {
  return (
    <span
      className="inline-flex text-slate-300 hover:text-slate-500 cursor-help"
      title={text}
      aria-label={text}
    >
      <Info className="w-3.5 h-3.5" />
    </span>
  );
}

export default function FinancialKpis({
  grossRevenue,
  commissionDeducted,
  netPayablePayout,
  lowStockCount,
  outOfStockCount = 0,
  healthyStockCount,
  inventorySummary,
  commissionRates = DEFAULT_COMMISSION_RATES,
  variant = "nursery",
}: FinancialKpisProps) {
  const isAdmin = variant === "admin";
  const feeLine = `Plants ${formatCommissionPercent(commissionRates.Plant)} · Pots ${formatCommissionPercent(commissionRates.Pot)} · Accessories ${formatCommissionPercent(commissionRates.Accessory)}`;

  const gross = Number(grossRevenue) || 0;
  const commission = Number(commissionDeducted) || 0;
  const net = Number(netPayablePayout) || 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500 bg-white border border-slate-100 rounded-2xl px-4 py-2.5 shadow-xs">
        <span className="uppercase tracking-wider text-slate-400">
          Money formula
        </span>
        <span className="text-slate-700">
          {isAdmin
            ? "Admin Revenue (Commission) = Gross GMV × category fee"
            : "My Net Payout = My Gross Sales − Platform Commission"}
        </span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-600">{feeLine}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              {isAdmin ? "Total Platform GMV" : "My Gross Sales"}
              <InfoTip
                text={
                  isAdmin
                    ? "Total amount customers paid at checkout across all nurseries for the selected period."
                    : "Total amount customers paid at checkout for your products in the selected period."
                }
              />
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">
              {formatINR(gross)}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Customer checkout total (before fees)
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-6 rounded-3xl border border-red-100 bg-red-50/10 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
              {isAdmin
                ? "Admin Revenue (Commission)"
                : "Platform Commission"}
              <InfoTip
                text={`Deducted by category fee rules: ${feeLine}. This is money kept by the platform.`}
              />
            </span>
            <div className="p-2.5 bg-red-50 text-red-600 rounded-2xl">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3
              className={`text-3xl font-black ${
                isAdmin ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {isAdmin ? "" : "− "}
              {formatINR(commission)}
            </h3>
            <p
              className={`text-xs font-medium mt-1 ${
                isAdmin ? "text-emerald-600" : "text-red-400"
              }`}
            >
              {isAdmin
                ? `Platform income from fees (${feeLine})`
                : `Deducted from your sales (${feeLine})`}
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-6 rounded-3xl border border-emerald-200 bg-emerald-50/20 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              {isAdmin ? "Payouts Due to Nurseries" : "My Net Payout"}
              <InfoTip
                text={
                  isAdmin
                    ? "Exact money owed to nursery partners: Gross GMV − Commission Collected."
                    : "Exact money that belongs to you: Gross Sales − Platform Commission."
                }
              />
            </span>
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-emerald-700">
              {formatINR(net)}
            </h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {formatINR(gross)} − {formatINR(commission)} = {formatINR(net)}
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-6 rounded-3xl border border-amber-100 bg-amber-50/20 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
              {isAdmin ? "System Inventory Alerts" : "My Low Stock Warnings"}
              <InfoTip text="Low Stock = quantity ≤ 10. Out of Stock = quantity 0. Healthy = quantity ≥ 10." />
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-amber-600 leading-tight">
              <span className="text-emerald-600">
                {healthyStockCount ?? "—"}
              </span>
              <span className="text-sm font-bold text-slate-400 mx-1">
                In Stock
              </span>
              <br />
              <span>{lowStockCount}</span>
              <span className="text-sm font-bold text-amber-500 mx-1">
                Low
              </span>
              <span className="text-red-500">{outOfStockCount}</span>
              <span className="text-sm font-bold text-red-500 mx-1">Out</span>
            </h3>
            {inventorySummary && (
              <p className="text-xs text-amber-700/80 font-medium mt-2 leading-relaxed">
                {inventorySummary.plants} Plants · {inventorySummary.pots} Pots ·{" "}
                {inventorySummary.accessories} Acc. · {inventorySummary.gardeningTools ?? 0} Tools ·{" "}
                {inventorySummary.plantCare ?? 0} Care · {inventorySummary.seedsBulbs ?? 0} Seeds ·{" "}
                {inventorySummary.plantStands ?? 0} Stands ·{" "}
                {inventorySummary.artificialDriedPlants ?? 0} Artificial
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
