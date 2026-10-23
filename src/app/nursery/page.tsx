"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { AppDispatch, RootState } from "@/redux/store";
import {
  setDashboardLoading,
  setNurseryDashboardData,
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
  DEFAULT_COMMISSION_RATES,
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
  totalItemsSold: 0,
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
      "Failed to load nursery analytics."
    );
  }
  return "Failed to load nursery analytics.";
}

export default function NurseryDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { nurseryData, timeframe, customDateRange, isLoading, error } =
    useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    let isMounted = true;

    const fetchNurseryStats = async () => {
      if (
        timeframe === "custom" &&
        (!customDateRange.startDate || !customDateRange.endDate)
      ) {
        return;
      }

      try {
        dispatch(setDashboardLoading(true));
        dispatch(setDashboardError(null));

        const res = await dashboardService.getNurseryDashboard(
          timeframe,
          customDateRange.startDate,
          customDateRange.endDate
        );

        if (isMounted && res.success) {
          const { success, ...payload } = res;
          void success;
          dispatch(setNurseryDashboardData(payload));
        } else if (isMounted) {
          dispatch(setDashboardError("Failed to load nursery analytics."));
        }
      } catch (err: unknown) {
        if (isMounted) {
          dispatch(setDashboardError(getErrorMessage(err)));
        }
      }
    };

    fetchNurseryStats();

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

  if (isLoading && !nurseryData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/50">
        <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin" />
        <p className="mt-4 text-sm font-semibold text-slate-600">
          Loading your nursery earnings…
        </p>
      </div>
    );
  }

  if (error && !nurseryData) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center mt-12">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 inline-block shadow-sm">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
          <h2 className="text-lg font-bold mb-1">Unable to Load Dashboard</h2>
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

  const metrics = nurseryData?.metrics ?? EMPTY_METRICS;
  const payouts = nurseryData?.payouts ?? EMPTY_PAYOUTS;
  const inventorySummary = metrics.inventorySummary;
  const commissionRates =
    nurseryData?.commissionRates ?? DEFAULT_COMMISSION_RATES;
  const statusDistribution =
    nurseryData?.statusDistribution ??
    nurseryData?.orderStatusDistribution ??
    {};
  const categoryPerformance = nurseryData?.categoryPerformance ?? [];
  const lowStockItems = nurseryData?.lowStockItems ?? [];
  const topSellingProducts = nurseryData?.topSellingProducts ?? [];
  const recentOrders = nurseryData?.recentOrders ?? [];
  const trends = nurseryData?.trends ?? [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto bg-slate-50/50 min-h-screen font-sans text-slate-800">
      <DashboardHeader
        title="My Nursery Earnings"
        subtitle="Crystal-clear view of your gross sales, platform fees, net payout, and inventory — every rupee explained."
        timeframe={timeframe}
        onTimeframeChange={handleTimeframeChange}
        customDateRange={customDateRange}
        onCustomDateApply={handleCustomDateApply}
        extendedOptions
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
        variant="nursery"
        grossRevenue={metrics.grossRevenue}
        commissionDeducted={metrics.commissionDeducted}
        netPayablePayout={metrics.netPayablePayout}
        lowStockCount={inventorySummary.lowStockCount}
        outOfStockCount={inventorySummary.outOfStockCount}
        healthyStockCount={inventorySummary.healthyStockCount}
        inventorySummary={inventorySummary}
        commissionRates={commissionRates}
      />

      <PayoutBanner variant="nursery" payouts={payouts} />

      <DashboardCharts
        variant="nursery"
        trends={trends}
        statusDistribution={statusDistribution}
        totalOrders={metrics.totalOrders}
      />

      <CategoryPerformance
        variant="nursery"
        categories={categoryPerformance}
        commissionRates={commissionRates}
      />

      <InventoryAndBestSellers
        variant="nursery"
        lowStockItems={lowStockItems}
        topSellingProducts={topSellingProducts}
        inventorySummary={inventorySummary}
      />

      <RecentOrdersTable
        variant="nursery"
        orders={recentOrders}
        showFinancialBreakdown
      />
    </div>
  );
}
