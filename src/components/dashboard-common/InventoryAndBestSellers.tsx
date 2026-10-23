"use client";

import React from "react";
import { AlertTriangle, ShoppingBag } from "lucide-react";
import {
  ILowStockItem,
  ITopSellingProduct,
  IInventorySummary,
  formatINR,
  StockStatus,
} from "@/types/dashboard.types";

export interface InventoryAndBestSellersProps {
  lowStockItems: ILowStockItem[];
  topSellingProducts: ITopSellingProduct[];
  inventorySummary?: IInventorySummary;
  variant?: "nursery" | "admin";
}

function resolveStockStatus(item: ILowStockItem): StockStatus {
  if (item.stockStatus) return item.stockStatus;
  if (item.stock === 0) return "out_of_stock";
  if (item.stock <= 10) return "low_stock";
  return "in_stock";
}

function stockBadge(status: StockStatus, stock: number) {
  if (status === "out_of_stock") {
    return {
      className: "bg-red-100 text-red-700",
      label: "Out of Stock (0)",
    };
  }
  if (status === "low_stock") {
    return {
      className: "bg-amber-100 text-amber-800",
      label: `Low Stock (${stock})`,
    };
  }
  return {
    className: "bg-emerald-100 text-emerald-800",
    label: `In Stock (${stock})`,
  };
}

export default function InventoryAndBestSellers({
  lowStockItems,
  topSellingProducts,
  inventorySummary,
  variant = "nursery",
}: InventoryAndBestSellersProps) {
  const isAdmin = variant === "admin";

  return (
    <div className="space-y-4">
      {inventorySummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Plants
            </p>
            <p className="text-lg font-black text-slate-800">
              {inventorySummary.plants}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pots
            </p>
            <p className="text-lg font-black text-slate-800">
              {inventorySummary.pots}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Accessories
            </p>
            <p className="text-lg font-black text-slate-800">
              {inventorySummary.accessories}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tools
            </p>
            <p className="text-lg font-black text-slate-800">
              {inventorySummary.gardeningTools ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Plant Care
            </p>
            <p className="text-lg font-black text-slate-800">
              {inventorySummary.plantCare ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Seeds & Bulbs
            </p>
            <p className="text-lg font-black text-slate-800">
              {inventorySummary.seedsBulbs ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Stands
            </p>
            <p className="text-lg font-black text-slate-800">
              {inventorySummary.plantStands ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Artificial
            </p>
            <p className="text-lg font-black text-slate-800">
              {inventorySummary.artificialDriedPlants ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-xs sm:col-span-2 lg:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Stock Health
            </p>
            <p className="text-xs font-bold text-slate-700 mt-1">
              <span className="text-emerald-600">
                {inventorySummary.healthyStockCount ??
                  inventorySummary.inStockCount ??
                  0}{" "}
                In
              </span>
              {" · "}
              <span className="text-amber-600">
                {inventorySummary.lowStockCount} Low
              </span>
              {" · "}
              <span className="text-red-600">
                {inventorySummary.outOfStockCount} Out
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {isAdmin ? "System-wide Low Stock" : "My Low Stock Warnings"}
            </h3>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              ≤ 10 = Low · 0 = Out
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                All product stocks are at safe levels (In Stock ≥ 10).
              </p>
            ) : (
              lowStockItems.map((item) => {
                const status = resolveStockStatus(item);
                const badge = stockBadge(status, item.stock);
                return (
                  <div
                    key={item._id}
                    className="flex items-center justify-between py-3.5 text-xs gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {item.type} · {formatINR(item.price)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-3 py-1 rounded-xl text-xs font-black ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              {isAdmin ? "Platform Best Sellers" : "My Best Sellers"}
            </h3>
            <span className="text-xs font-bold text-slate-400">
              Gross → Net after fee
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
            {topSellingProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No top-selling metrics recorded yet.
              </p>
            ) : (
              topSellingProducts.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between py-3.5 text-xs gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {item.itemType} · {item.quantitySold} units sold
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-emerald-700 text-sm">
                      Net {formatINR(item.nurseryEarnings ?? 0)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Gross {formatINR(item.grossRevenue)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
