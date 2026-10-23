import { api } from "@/config/api";
import {
  INurseryDashboardResponse,
  IAdminDashboardResponse,
  TimeframeFilter,
} from "@/types/dashboard.types";

const buildDashboardUrl = (
  path: string,
  timeframe: TimeframeFilter,
  startDate?: string,
  endDate?: string
): string => {
  const params = new URLSearchParams({ timeframe });
  if (timeframe === "custom" && startDate && endDate) {
    params.set("startDate", startDate);
    params.set("endDate", endDate);
  }
  return `${path}?${params.toString()}`;
};

export const dashboardService = {
  getNurseryDashboard: async (
    timeframe: TimeframeFilter,
    startDate?: string,
    endDate?: string
  ): Promise<INurseryDashboardResponse> => {
    const url = buildDashboardUrl(
      "/dashboard/nursery/dashboard",
      timeframe,
      startDate,
      endDate
    );
    // api interceptor already returns response.data
    return (await api.get(url)) as unknown as INurseryDashboardResponse;
  },

  getAdminDashboard: async (
    timeframe: TimeframeFilter,
    startDate?: string,
    endDate?: string
  ): Promise<IAdminDashboardResponse> => {
    const url = buildDashboardUrl(
      "/dashboard/admin/dashboard",
      timeframe,
      startDate,
      endDate
    );
    return (await api.get(url)) as unknown as IAdminDashboardResponse;
  },
};
