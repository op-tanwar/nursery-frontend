"use client";

import React from "react";
import Link from "next/link";
import { IRecentOrder, formatINR } from "@/types/dashboard.types";

export interface RecentOrdersTableProps {
  orders: IRecentOrder[];
  title?: string;
  subtitle?: string;
  /** When false, hides commission / net earnings columns */
  showFinancialBreakdown?: boolean;
  variant?: "nursery" | "admin";
}

const statusTagClass = (status: string): string => {
  const normalized = status.toLowerCase();
  if (normalized === "delivered") return "bg-emerald-100 text-emerald-800";
  if (normalized === "processing" || normalized === "packed")
    return "bg-amber-100 text-amber-800";
  if (normalized === "shipped") return "bg-blue-100 text-blue-800";
  if (
    normalized === "cancelled" ||
    normalized === "returned" ||
    normalized === "refunded"
  )
    return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-600";
};

const paymentTagClass = (status: string): string => {
  if (status === "Paid" || status === "Succeeded") {
    return "bg-emerald-100 text-emerald-800";
  }
  if (status === "Cash on Delivery" || status === "COD") {
    return "bg-amber-100 text-amber-800";
  }
  return "bg-slate-100 text-slate-600";
};

const shortOrderId = (id: string): string =>
  id.length > 10 ? `${id.slice(0, 8)}…` : id;

export default function RecentOrdersTable({
  orders,
  title,
  subtitle,
  showFinancialBreakdown = true,
  variant = "nursery",
}: RecentOrdersTableProps) {
  const isAdmin = variant === "admin";
  const resolvedTitle =
    title ||
    (isAdmin ? "Global Customer Transactions" : "My Recent Orders");
  const resolvedSubtitle =
    subtitle ||
    (isAdmin
      ? "Every order with Gross · Commission Collected · Net Nursery Payout"
      : "Every order with items, Gross Total · Commission Deducted · My Net Payout");

  const colSpan = showFinancialBreakdown ? 8 : 5;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900">{resolvedTitle}</h3>
        <p className="text-xs text-slate-400 font-medium">{resolvedSubtitle}</p>
      </div>

      <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50/95 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
              <th className="p-4 whitespace-nowrap">Order ID</th>
              <th className="p-4 whitespace-nowrap">Customer</th>
              <th className="p-4 min-w-[180px]">Items</th>
              <th className="p-4 whitespace-nowrap">Payment</th>
              <th className="p-4 whitespace-nowrap">Status</th>
              <th className="p-4 whitespace-nowrap">Gross Total</th>
              {showFinancialBreakdown && (
                <>
                  <th className="p-4 whitespace-nowrap">
                    {isAdmin ? "Commission Collected" : "Commission Deducted"}
                  </th>
                  <th className="p-4 whitespace-nowrap">
                    {isAdmin ? "Net Nursery Payout" : "My Net Payout"}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="p-8 text-center text-slate-400"
                >
                  No recent orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const itemsText =
                  order.itemsSummary ||
                  order.items?.map((i) => i.label).join(", ") ||
                  "—";
                const gross = Number(order.totalAmount) || 0;
                const commission = Number(order.adminCommission) || 0;
                const net = Number(order.nurseryEarnings) || 0;

                return (
                  <tr
                    key={order.orderId}
                    className="hover:bg-slate-50/50 transition align-top"
                  >
                    <td className="p-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {order.orderId || (order as any)._id ? (
                        <Link
                          href={
                            isAdmin
                              ? `/admin/orders/${order.orderId || (order as any)._id}`
                              : `/nursery/orders/${order.orderId || (order as any)._id}`
                          }
                          className="text-emerald-700 hover:text-emerald-800 hover:underline inline-block font-bold cursor-pointer"
                          title={order.orderId || (order as any)._id}
                        >
                          {shortOrderId(order.orderId || (order as any)._id)}
                        </Link>
                      ) : (
                        <span title={order.orderId}>{shortOrderId(order.orderId)}</span>
                      )}
                      <p className="text-[10px] font-medium text-slate-400 mt-1">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "en-IN"
                            )
                          : "N/A"}
                      </p>
                    </td>
                    <td className="p-4 font-semibold text-slate-800 whitespace-nowrap">
                      {order.customerName || "Guest"}
                    </td>
                    <td className="p-4 text-slate-600 max-w-[240px]">
                      <p className="font-medium leading-relaxed whitespace-normal">
                        {itemsText}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${paymentTagClass(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusTagClass(
                          String(order.orderStatus)
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                      {formatINR(gross)}
                    </td>
                    {showFinancialBreakdown && (
                      <>
                        <td className="p-4 text-red-600 font-medium whitespace-nowrap">
                          − {formatINR(commission)}
                        </td>
                        <td className="p-4 font-black text-emerald-700 whitespace-nowrap">
                          {formatINR(net)}
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                            {formatINR(gross)} − {formatINR(commission)}
                          </p>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
