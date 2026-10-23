import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ISeedsBulbs, ISeedsBulbsReview } from "@/types/index";

interface SeedsBulbsState {
  seedsBulbsList: ISeedsBulbs[];
  singleSeedsBulbs: ISeedsBulbs | null;
  currentReviews: ISeedsBulbsReview[];
  totalSeedsBulbs: number;
  filteredCount: number;
  isLoading: boolean;
  error: string | null;
  mutationSuccess: boolean;
}

const initialState: SeedsBulbsState = {
  seedsBulbsList: [],
  singleSeedsBulbs: null,
  currentReviews: [],
  totalSeedsBulbs: 0,
  filteredCount: 0,
  isLoading: false,
  error: null,
  mutationSuccess: false,
};

export const seedsBulbsSlice = createSlice({
  name: "seedsBulbs",
  initialState,
  reducers: {
    setSeedsBulbsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setSeedsBulbsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearSeedsBulbsMutationFlags: (state) => {
      state.mutationSuccess = false;
      state.error = null;
    },

    setAllSeedsBulbsData: (
      state,
      action: PayloadAction<{
        seedsBulbs: ISeedsBulbs[];
        totalSeedsBulbs: number;
        filteredCount: number;
      }>
    ) => {
      state.seedsBulbsList = action.payload.seedsBulbs;
      state.totalSeedsBulbs = action.payload.totalSeedsBulbs;
      state.filteredCount = action.payload.filteredCount;
      state.isLoading = false;
      state.error = null;
    },

    setSingleSeedsBulbsData: (state, action: PayloadAction<ISeedsBulbs>) => {
      state.singleSeedsBulbs = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    clearSingleSeedsBulbsData: (state) => {
      state.singleSeedsBulbs = null;
    },

    updateSeedsBulbsInState: (state, action: PayloadAction<ISeedsBulbs>) => {
      state.seedsBulbsList = state.seedsBulbsList.map((item) =>
        item._id === action.payload._id ? { ...item, ...action.payload } : item
      );
      state.isLoading = false;
    },

    deleteSeedsBulbsFromState: (state, action: PayloadAction<string>) => {
      state.seedsBulbsList = state.seedsBulbsList.filter(
        (item) => item._id !== action.payload
      );
      state.totalSeedsBulbs = Math.max(0, state.totalSeedsBulbs - 1);
      state.filteredCount = Math.max(0, state.filteredCount - 1);
      state.mutationSuccess = true;
    },

    setTargetSeedsBulbsReviews: (
      state,
      action: PayloadAction<ISeedsBulbsReview[]>
    ) => {
      state.currentReviews = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    submitSeedsBulbsReviewSuccess: (state) => {
      state.mutationSuccess = true;
      state.isLoading = false;
      state.error = null;
    },

    deleteReviewFromState: (state, action: PayloadAction<string>) => {
      state.currentReviews = state.currentReviews.filter(
        (rev) => rev._id !== action.payload
      );
      state.mutationSuccess = true;
    },
  },
});

export const {
  setSeedsBulbsLoading,
  setSeedsBulbsError,
  clearSeedsBulbsMutationFlags,
  setAllSeedsBulbsData,
  setSingleSeedsBulbsData,
  clearSingleSeedsBulbsData,
  updateSeedsBulbsInState,
  deleteSeedsBulbsFromState,
  setTargetSeedsBulbsReviews,
  submitSeedsBulbsReviewSuccess,
  deleteReviewFromState,
} = seedsBulbsSlice.actions;

export default seedsBulbsSlice.reducer;