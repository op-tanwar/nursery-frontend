import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardStats {
  totalRevenue: number;
  ordersFulfilled: number;
  liveProducts: number;
  activeUsers: number;
  recentActionsLog: Array<{ id: string; activity: string; timestamp: string }>;
}

interface AdminState {
  stats: DashboardStats | null;
  orders: any[];
  users: any[];
  nurseryUsers: any[];
  nurseryApplications: any[];
  subscribers: any[];
  currentSelectedUser: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  orders: [],
  users: [],
  nurseryUsers: [],
  nurseryApplications: [],
  subscribers: [],
  currentSelectedUser: null,
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAdminError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setGlobalStats: (state, action: PayloadAction<DashboardStats>) => {
      state.stats = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setAdminOrders: (state, action: PayloadAction<any[]>) => {
      state.orders = action.payload;
      state.isLoading = false;
    },
    updateAdminOrderInState: (state, action: PayloadAction<{ id: string; status: string }>) => {
      state.orders = state.orders.map((order) =>
        order._id === action.payload.id ? { ...order, status: action.payload.status } : order
      );
    },
    deleteAdminOrderFromState: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter((order) => order._id !== action.payload);
    },
    setAdminUsers: (state, action: PayloadAction<any[]>) => {
      state.users = action.payload;
      state.isLoading = false;
    },
    setSingleUserDetails: (state, action: PayloadAction<any>) => {
      state.currentSelectedUser = action.payload;
      state.isLoading = false;
    },
    deleteUserFromState: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((user) => user._id !== action.payload);
      state.nurseryUsers = state.nurseryUsers.filter((user) => user._id !== action.payload);
    },
    setAdminNurseryUsers: (state, action: PayloadAction<any[]>) => {
      state.nurseryUsers = action.payload;
      state.isLoading = false;
    },

    /**
     * 🌟 FIX: updateNurseryActiveState अब `users` और `nurseryUsers` दोनों लिस्ट्स को सिंक करेगा।
     * यह चेक करेगा कि ID चाहे profileId हो या userId (_id), दोनों जगहों पर सही वैल्यू मैप हो।
     */
    updateNurseryActiveState: (state, action: PayloadAction<{ id: string; profileId: string; isActive: boolean }>) => {
      const mapper = (item: any) => {
        // अगर ये वही ऑब्जेक्ट है जिसका स्टेटस बदला है
        if (item._id === action.payload.id || item.nurseryProfile?._id === action.payload.profileId || item._id === action.payload.profileId) {
          return {
            ...item,
            isActive: action.payload.isActive,
            nurseryProfile: item.nurseryProfile
              ? { ...item.nurseryProfile, isActive: action.payload.isActive }
              : undefined
          };
        }
        return item;
      };

      state.nurseryUsers = state.nurseryUsers.map(mapper);
      state.users = state.users.map(mapper);
    },

    setNurseryApplications: (state, action: PayloadAction<any[]>) => {
      state.nurseryApplications = action.payload;
      state.isLoading = false;
    },
    updateNurseryApplicationStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      state.nurseryApplications = state.nurseryApplications.map((app) =>
        app._id === action.payload.id ? { ...app, status: action.payload.status } : app
      );
    },
    setNewsletterSubscribers: (state, action: PayloadAction<any[]>) => {
      state.subscribers = action.payload;
      state.isLoading = false;
    },
    clearAdminState: (state) => {
      return initialState;
    },
  },
});

export const {
  setAdminLoading,
  setAdminError,
  setGlobalStats,
  setAdminOrders,
  updateAdminOrderInState,
  deleteAdminOrderFromState,
  setAdminUsers,
  setSingleUserDetails,
  deleteUserFromState,
  setAdminNurseryUsers,
  updateNurseryActiveState,
  setNurseryApplications,
  updateNurseryApplicationStatus,
  setNewsletterSubscribers,
  clearAdminState,
} = adminSlice.actions;

export default adminSlice.reducer;