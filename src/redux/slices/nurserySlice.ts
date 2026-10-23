import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 📝 Shared core structure for type safety across all catalog assets
export interface BaseNurseryProduct {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean; // 👈 Status trigger capability matrix mapping
  ratings?: number;
  numOfReviews?: number;
  coverImage: {
    url: string;
  };
}

export interface NurseryDashboardStats {
  totalRevenue: number;
  ordersFulfilled: number;
  liveProducts: number;
  activeUsers?: number;
  recentActionsLog: Array<{ id: string; activity: string; timestamp: string }>;
}

export interface NurseryOrder {
  _id: string;
  status: "Placed" | "Processing" | "Shipped" | "Delivered";
  totalAmount: number;
  createdAt: string;
  itemsCount: number;
  user: {
    name: string;
    email: string;
  };
}

interface NurseryState {
  stats: NurseryDashboardStats | null;
  nurseryPlants: BaseNurseryProduct[];
  nurseryPots: BaseNurseryProduct[];
  nurseryAccessories: BaseNurseryProduct[];
  orders: NurseryOrder[];
  currentSelectedPlant: BaseNurseryProduct | null;
  currentSelectedPot: BaseNurseryProduct | null;
  currentSelectedAccessory: BaseNurseryProduct | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: NurseryState = {
  stats: null,
  nurseryPlants: [],
  nurseryPots: [],
  nurseryAccessories: [],
  orders: [],
  currentSelectedPlant: null,
  currentSelectedPot: null,
  currentSelectedAccessory: null,
  isLoading: false,
  error: null,
};

const nurserySlice = createSlice({
  name: "nursery",
  initialState,
  reducers: {
    // ⚙️ Core Telemetry & Status Orchestrators
    setNurseryLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setNurseryError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // 📈 Populate Vendor Dashboard KPIs Telemetry
    setNurseryStats: (state, action: PayloadAction<NurseryDashboardStats>) => {
      state.stats = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    // ======================================================================
    // 🌿 BOTANICAL INVENTORY STATE MATRIX (PLANTS)
    // ======================================================================
    setNurseryPlants: (state, action: PayloadAction<BaseNurseryProduct[]>) => {
      state.nurseryPlants = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addPlantToNurseryState: (state, action: PayloadAction<BaseNurseryProduct>) => {
      state.nurseryPlants = [action.payload, ...state.nurseryPlants];
      state.isLoading = false;
    },
    updatePlantInNurseryState: (state, action: PayloadAction<BaseNurseryProduct>) => {
      state.nurseryPlants = state.nurseryPlants.map((plant) =>
        plant._id === action.payload._id ? action.payload : plant
      );
      state.isLoading = false;
    },
    deletePlantFromNurseryState: (state, action: PayloadAction<string>) => {
      state.nurseryPlants = state.nurseryPlants.filter((plant) => plant._id !== action.payload);
      state.isLoading = false;
    },
    setSinglePlantDetails: (state, action: PayloadAction<BaseNurseryProduct>) => {
      state.currentSelectedPlant = action.payload;
      state.isLoading = false;
    },

    // ======================================================================
    // 🏺 POTS & PLANTERS STATE MATRIX (POTS)
    // ======================================================================
    setNurseryPots: (state, action: PayloadAction<BaseNurseryProduct[]>) => {
      state.nurseryPots = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addPotToNurseryState: (state, action: PayloadAction<BaseNurseryProduct>) => {
      state.nurseryPots = [action.payload, ...state.nurseryPots];
      state.isLoading = false;
    },
    updatePotInNurseryState: (state, action: PayloadAction<BaseNurseryProduct>) => {
      state.nurseryPots = state.nurseryPots.map((pot) =>
        pot._id === action.payload._id ? action.payload : pot
      );
      state.isLoading = false;
    },
    deletePotFromNurseryState: (state, action: PayloadAction<string>) => {
      state.nurseryPots = state.nurseryPots.filter((pot) => pot._id !== action.payload);
      state.isLoading = false;
    },
    setSinglePotDetails: (state, action: PayloadAction<BaseNurseryProduct>) => {
      state.currentSelectedPot = action.payload;
      state.isLoading = false;
    },

    // ======================================================================
    // 🛠️ GARDENING ACCESSORIES & TOOLS STATE MATRIX
    // ======================================================================
    setNurseryAccessories: (state, action: PayloadAction<BaseNurseryProduct[]>) => {
      state.nurseryAccessories = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addAccessoryToNurseryState: (state, action: PayloadAction<BaseNurseryProduct>) => {
      state.nurseryAccessories = [action.payload, ...state.nurseryAccessories];
      state.isLoading = false;
    },
    updateAccessoryInNurseryState: (state, action: PayloadAction<BaseNurseryProduct>) => {
      state.nurseryAccessories = state.nurseryAccessories.map((item) =>
        item._id === action.payload._id ? action.payload : item
      );
      state.isLoading = false;
    },
    deleteAccessoryFromNurseryState: (state, action: PayloadAction<string>) => {
      state.nurseryAccessories = state.nurseryAccessories.filter((item) => item._id !== action.payload);
      state.isLoading = false;
    },
    setSingleAccessoryDetails: (state, action: PayloadAction<BaseNurseryProduct>) => {
      state.currentSelectedAccessory = action.payload;
      state.isLoading = false;
    },

    // ======================================================================
    // 📦 VENDOR PERSONAL ORDERS PIPELINES
    // ======================================================================
    setNurseryOrders: (state, action: PayloadAction<NurseryOrder[]>) => {
      state.orders = action.payload;
      state.isLoading = false;
    },
    updateNurseryOrderInState: (
      state,
      action: PayloadAction<{ id: string; status: NurseryOrder["status"] }>
    ) => {
      state.orders = state.orders.map((order) =>
        order._id === action.payload.id ? { ...order, status: action.payload.status } : order
      );
    },

    // 🧹 Clean state context on sign-out/exit logic
    clearNurseryState: () => {
      return initialState;
    },
  },
});

export const {
  setNurseryLoading,
  setNurseryError,
  setNurseryStats,
  setNurseryPlants,
  addPlantToNurseryState,
  updatePlantInNurseryState,
  deletePlantFromNurseryState,
  setSinglePlantDetails,
  setNurseryPots,
  addPotToNurseryState,
  updatePotInNurseryState,
  deletePotFromNurseryState,
  setSinglePotDetails,
  setNurseryAccessories,
  addAccessoryToNurseryState,
  updateAccessoryInNurseryState,
  deleteAccessoryFromNurseryState,
  setSingleAccessoryDetails,
  setNurseryOrders,
  updateNurseryOrderInState,
  clearNurseryState,
} = nurserySlice.actions;

export default nurserySlice.reducer;