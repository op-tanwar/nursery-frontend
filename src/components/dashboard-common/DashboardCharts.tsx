"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { ITrendPoint, formatINR } from "@/types/dashboard.types";

export interface DashboardChartsProps {
  trends: ITrendPoint[];
  statusDistribution: Record<string, number>;
  totalOrders: number;
  areaTitle?: string;
  areaSubtitle?: string;
  pieTitle?: string;
  pieSubtitle?: string;
  variant?: "nursery" | "admin";
}

const STATUS_COLORS: Record<string, string> = {
  Delivered: "#10b981",
  Processing: "#f59e0b",
  Shipped: "#3b82f6",
  Packed: "#8b5cf6",
  Cancelled: "#ef4444",
  Returned: "#f97316",
  Refunded: "#64748b",
  Claimed: "#a855f7",
};

export default function DashboardCharts({
  trends,
  statusDistribution,
  totalOrders,
  areaTitle,
  areaSubtitle,
  pieTitle = "Order Fulfillment Status",
  pieSubtitle = "Processing → Packed → Shipped → Delivered (plus Cancelled / Returned)",
  variant = "nursery",
}: DashboardChartsProps) {
  const isAdmin = variant === "admin";
  const resolvedAreaTitle =
    areaTitle ||
    (isAdmin
      ? "Platform GMV vs Nursery Net Payout"
      : "My Gross Sales vs My Net Payout");
  const resolvedAreaSubtitle =
    areaSubtitle ||
    (isAdmin
      ? "Gross customer spend vs net amount due to nurseries over time"
      : "What customers paid vs what you keep after commission");

  const pieChartStatusData = Object.entries(statusDistribution).map(
    ([name, value]) => ({
      name,
      value: Number(value) || 0,
    })
  );

  const hasTrendData = trends.length > 0;
  const hasStatusData = pieChartStatusData.some((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{resolvedAreaTitle}</h3>
            <p className="text-xs text-slate-400 font-medium">{resolvedAreaSubtitle}</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />{" "}
              Gross
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />{" "}
              Net Payout
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          {!hasTrendData ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
              No trend data available for this timeframe.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trends}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "16px",
                    color: "#fff",
                    border: "none",
                  }}
                  formatter={(value) => [
                    formatINR(Number(value) || 0),
                    "",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="grossRevenue"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGross)"
                />
                <Area
                  type="monotone"
                  dataKey="netPayout"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorNet)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{pieTitle}</h3>
          <p className="text-xs text-slate-400 font-medium mb-4">
            {pieSubtitle}
          </p>
        </div>

        <div className="h-48 w-full relative">
          {!hasStatusData ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
              No status distribution data.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartStatusData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartStatusData.map((entry, idx) => (
                      <Cell
                        key={`${entry.name}-${idx}`}
                        fill={STATUS_COLORS[entry.name] || "#cbd5e1"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800">
                  {totalOrders}
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Total Orders
                </span>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs font-semibold">
          {Object.entries(statusDistribution).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: STATUS_COLORS[key] || "#cbd5e1",
                  }}
                />
                {key}
              </span>
              <span className="font-bold text-slate-800">
                {Number(val) || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
