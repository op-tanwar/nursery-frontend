import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPot, IPotReview } from "@/types/pots.types";

interface PotState {
  pots: IPot[];
  singlePot: IPot | null;
  currentReviews: IPotReview[];
  totalPots: number;
  filteredCount: number;
  isLoading: boolean;
  error: string | null;
  mutationSuccess: boolean;
}

const initialState: PotState = {
  pots: [],
  singlePot: null,
  currentReviews: [],
  totalPots: 0,
  filteredCount: 0,
  isLoading: false,
  error: null,
  mutationSuccess: false,
};

export const potSlice = createSlice({
  name: "pot",
  initialState,
  reducers: {
    setPotLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setPotError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearPotMutationFlags: (state) => {
      state.mutationSuccess = false;
      state.error = null;
    },

    setAllPotsData: (
      state,
      action: PayloadAction<{ pots: IPot[]; totalPots: number; filteredCount: number }>
    ) => {
      state.pots = action.payload.pots;
      state.totalPots = action.payload.totalPots;
      state.filteredCount = action.payload.filteredCount;
      state.isLoading = false;
      state.error = null;
    },

    setSinglePotData: (state, action: PayloadAction<IPot>) => {
      state.singlePot = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    clearSinglePotData: (state) => {
      state.singlePot = null;
    },

    deletePotFromState: (state, action: PayloadAction<string>) => {
      state.pots = state.pots.filter((pot) => pot._id !== action.payload);
      state.totalPots = Math.max(0, state.totalPots - 1);
      state.filteredCount = Math.max(0, state.filteredCount - 1);
      state.mutationSuccess = true;
    },

    setTargetPotReviews: (state, action: PayloadAction<IPotReview[]>) => {
      state.currentReviews = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    // ✨ FIXED: Added for handling successful review submission/update
    submitPotReviewSuccess: (state) => {
      state.mutationSuccess = true;
      state.isLoading = false;
      state.error = null;
    },

    deletePotReviewFromState: (state, action: PayloadAction<string>) => {
      state.currentReviews = state.currentReviews.filter((rev) => rev._id !== action.payload);
      state.mutationSuccess = true;
    },
  },
});

export const {
  setPotLoading,
  setPotError,
  clearPotMutationFlags,
  setAllPotsData,
  setSinglePotData,
  clearSinglePotData,
  deletePotFromState,
  setTargetPotReviews,
  submitPotReviewSuccess, // Exported
  deletePotReviewFromState,
} = potSlice.actions;

export default potSlice.reducer;