import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  INurseryDashboardData,
  IAdminDashboardData,
  TimeframeFilter,
  ICustomDateRange,
} from "@/types/dashboard.types";

export interface DashboardState {
  nurseryData: INurseryDashboardData | null;
  adminData: IAdminDashboardData | null;
  timeframe: TimeframeFilter;
  customDateRange: ICustomDateRange;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  nurseryData: null,
  adminData: null,
  timeframe: "this_month",
  customDateRange: {
    startDate: "",
    endDate: "",
  },
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDashboardLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTimeframe: (state, action: PayloadAction<TimeframeFilter>) => {
      state.timeframe = action.payload;
      if (action.payload !== "custom") {
        state.customDateRange = { startDate: "", endDate: "" };
      }
    },
    setCustomDateRange: (state, action: PayloadAction<ICustomDateRange>) => {
      state.customDateRange = action.payload;
      state.timeframe = "custom";
    },
    setDashboardError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setNurseryDashboardData: (
      state,
      action: PayloadAction<INurseryDashboardData>
    ) => {
      state.nurseryData = action.payload;
      state.error = null;
      state.isLoading = false;
    },
    setAdminDashboardData: (
      state,
      action: PayloadAction<IAdminDashboardData>
    ) => {
      state.adminData = action.payload;
      state.error = null;
      state.isLoading = false;
    },
    clearDashboardState: (state) => {
      state.nurseryData = null;
      state.adminData = null;
      state.error = null;
      state.isLoading = false;
      state.timeframe = "this_month";
      state.customDateRange = { startDate: "", endDate: "" };
    },
  },
});

export const {
  setDashboardLoading,
  setTimeframe,
  setCustomDateRange,
  setDashboardError,
  setNurseryDashboardData,
  setAdminDashboardData,
  clearDashboardState,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
