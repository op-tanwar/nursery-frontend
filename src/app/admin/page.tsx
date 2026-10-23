"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { AppDispatch, RootState } from "@/redux/store";
import {
  setDashboardLoading,
  setAdminDashboardData,
  setDashboardError,
  setTimeframe,
  setCustomDateRange,
} from "@/redux/slices/dashboardSlice";
import { dashboardService } from "@/services/dashboardService";
import {
  TimeframeFilter,
  ICustomDateRange,
  IDashboardMetrics,
  IPayoutInfo,
  ITopNursery,
  DEFAULT_COMMISSION_RATES,
  formatINR,
} from "@/types/dashboard.types";

import dynamic from "next/dynamic";
import DashboardHeader from "@/components/dashboard-common/DashboardHeader";
import FinancialKpis from "@/components/dashboard-common/FinancialKpis";
import PayoutBanner from "@/components/dashboard-common/PayoutBanner";
const DashboardCharts = dynamic(
  () => import("@/components/dashboard-common/DashboardCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-center animate-pulse">
        <span className="text-sm font-medium text-slate-400">Loading Analytics Charts...</span>
      </div>
    ),
  }
);
import CategoryPerformance from "@/components/dashboard-common/CategoryPerformance";
import InventoryAndBestSellers from "@/components/dashboard-common/InventoryAndBestSellers";
import RecentOrdersTable from "@/components/dashboard-common/RecentOrdersTable";

const EMPTY_METRICS: IDashboardMetrics = {
  grossRevenue: 0,
  commissionDeducted: 0,
  netPayablePayout: 0,
  totalOrders: 0,
  totalGrossGMV: 0,
  netPlatformCommissionRevenue: 0,
  netProductSales: 0,
  users: { customers: 0, nurseries: 0, admins: 0 },
  inventorySummary: {
    totalProducts: 0,
    plants: 0,
    pots: 0,
    accessories: 0,
    gardeningTools: 0,
    plantCare: 0,
    seedsBulbs: 0,
    plantStands: 0,
    artificialDriedPlants: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    healthyStockCount: 0,
    inStockCount: 0,
  },
};

const EMPTY_PAYOUTS: IPayoutInfo = {
  weeklyPayable: 0,
  pendingPayout: 0,
  paidAmount: 0,
  upcomingSettlement: 0,
  nextSettlementDate: "N/A",
  nextSettlementLabel: "Next payout date pending",
  status: "Processing",
};

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const maybe = err as {
      message?: string;
      response?: { data?: { message?: string } };
    };
    return (
      maybe.response?.data?.message ||
      maybe.message ||
      "Failed to load global administration stats."
    );
  }
  return "Failed to load global administration stats.";
}

export default function AdminDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { adminData, timeframe, customDateRange, isLoading, error } =
    useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    let isMounted = true;

    const fetchAdminStats = async () => {
      if (
        timeframe === "custom" &&
        (!customDateRange.startDate || !customDateRange.endDate)
      ) {
        return;
      }

      try {
        dispatch(setDashboardLoading(true));
        dispatch(setDashboardError(null));

        const res = await dashboardService.getAdminDashboard(
          timeframe,
          customDateRange.startDate,
          customDateRange.endDate
        );

        if (isMounted && res.success) {
          const { success, ...payload } = res;
          void success;
          dispatch(setAdminDashboardData(payload));
        } else if (isMounted) {
          dispatch(
            setDashboardError("Failed to load global administration stats.")
          );
        }
      } catch (err: unknown) {
        if (isMounted) {
          dispatch(setDashboardError(getErrorMessage(err)));
        }
      }
    };

    fetchAdminStats();

    return () => {
      isMounted = false;
    };
  }, [timeframe, customDateRange, dispatch]);

  const handleTimeframeChange = (next: TimeframeFilter) => {
    dispatch(setTimeframe(next));
  };

  const handleCustomDateApply = (range: ICustomDateRange) => {
    dispatch(setCustomDateRange(range));
  };

  if (isLoading && !adminData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/50">
        <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin" />
        <p className="mt-4 text-sm font-semibold text-slate-600">
          Loading platform GMV & commission…
        </p>
      </div>
    );
  }

  if (error && !adminData) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center mt-12">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 inline-block shadow-sm">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
          <h2 className="text-lg font-bold mb-1">
            Unable to Load Admin Control Center
          </h2>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(setTimeframe(timeframe))}
            className="px-4 py-2 bg-red-600 text-white font-medium text-xs rounded-xl hover:bg-red-700 transition cursor-pointer"
          >
            Retry Request
          </button>
        </div>
      </div>
    );
  }

  const metrics = adminData?.metrics ?? EMPTY_METRICS;
  const payouts = adminData?.payouts ?? EMPTY_PAYOUTS;
  const inventorySummary = metrics.inventorySummary;
  const commissionRates =
    adminData?.commissionRates ?? DEFAULT_COMMISSION_RATES;
  const statusDistribution =
    adminData?.statusDistribution ??
    adminData?.orderStatusDistribution ??
    {};
  const categoryPerformance = adminData?.categoryPerformance ?? [];
  const lowStockItems = adminData?.lowStockItems ?? [];
  const topSellingProducts = adminData?.topSellingProducts ?? [];
  const recentOrders =
    adminData?.recentOrders ?? adminData?.recentPlatformOrders ?? [];
  const trends = adminData?.trends ?? [];
  const topNurseries: ITopNursery[] = adminData?.topNurseries ?? [];
  const users = adminData?.users ??
    metrics.users ?? {
      customers: 0,
      nurseries: 0,
      admins: 0,
    };

  const grossRevenue = metrics.totalGrossGMV ?? metrics.grossRevenue;
  const commission =
    metrics.netPlatformCommissionRevenue ?? metrics.commissionDeducted;
  const netPayout = metrics.netProductSales ?? metrics.netPayablePayout;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto bg-slate-50/50 min-h-screen font-sans text-slate-800">
      <DashboardHeader
        title="Platform Administration"
        subtitle="Total GMV, admin commission revenue, nursery payouts due, and system-wide inventory — every rupee explained."
        timeframe={timeframe}
        onTimeframeChange={handleTimeframeChange}
        customDateRange={customDateRange}
        onCustomDateApply={handleCustomDateApply}
      />

      {error && (
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Displaying cached data. Refresh failed: {error}</span>
          </div>
          <button
            onClick={() => dispatch(setTimeframe(timeframe))}
            className="px-3 py-1 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      <FinancialKpis
        variant="admin"
        grossRevenue={grossRevenue}
        commissionDeducted={commission}
        netPayablePayout={netPayout}
        lowStockCount={inventorySummary.lowStockCount}
        outOfStockCount={inventorySummary.outOfStockCount}
        healthyStockCount={inventorySummary.healthyStockCount}
        inventorySummary={inventorySummary}
        commissionRates={commissionRates}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Customers
          </p>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {users.customers}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Nurseries
          </p>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {users.nurseries}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Listed Products
          </p>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {inventorySummary.totalProducts}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            {inventorySummary.plants} Plants · {inventorySummary.pots} Pots ·{" "}
            {inventorySummary.accessories} Acc. · {inventorySummary.gardeningTools ?? 0} Tools ·{" "}
            {inventorySummary.plantCare ?? 0} Care · {inventorySummary.seedsBulbs ?? 0} Seeds ·{" "}
            {inventorySummary.plantStands ?? 0} Stands ·{" "}
            {inventorySummary.artificialDriedPlants ?? 0} Artificial
          </p>
        </div>
      </div>

      <PayoutBanner variant="admin" payouts={payouts} />

      <DashboardCharts
        variant="admin"
        trends={trends}
        statusDistribution={statusDistribution}
        totalOrders={metrics.totalOrders}
      />

      <CategoryPerformance
        variant="admin"
        categories={categoryPerformance}
        commissionRates={commissionRates}
      />

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Vendor Leaderboard
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Gross sales → Commission collected → Net payout due to each nursery
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-100">
                <th className="p-4">Nursery</th>
                <th className="p-4">Units Sold</th>
                <th className="p-4">Gross Sales</th>
                <th className="p-4">Commission Collected</th>
                <th className="p-4">Net Payout Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {topNurseries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No vendor transactions logged.
                  </td>
                </tr>
              ) : (
                topNurseries.map((v) => {
                  const gross = Number(v.totalSalesValue) || 0;
                  const fee =
                    Number(
                      v.platformCommissionGenerated ?? v.commissionGenerated
                    ) || 0;
                  const net = Number(v.netNurseryPayout) || 0;
                  return (
                    <tr key={v.nurseryId} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">
                        {v.nurseryName}
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        {v.itemsSold ?? 0}
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {formatINR(gross)}
                      </td>
                      <td className="p-4 font-bold text-emerald-600">
                        + {formatINR(fee)}
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-blue-700">
                          {formatINR(net)}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {formatINR(gross)} − {formatINR(fee)}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InventoryAndBestSellers
        variant="admin"
        lowStockItems={lowStockItems}
        topSellingProducts={topSellingProducts}
        inventorySummary={inventorySummary}
      />

      <RecentOrdersTable
        variant="admin"
        orders={recentOrders}
        showFinancialBreakdown
      />
    </div>
  );
}
