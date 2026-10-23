import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IArtificial, IArtificialReview } from "@/types/artificialDriedPlant.types";

interface ArtificialState {
  artificials: IArtificial[];
  singleArtificial: IArtificial | null;
  currentReviews: IArtificialReview[];
  totalArtificials: number;
  filteredCount: number;
  isLoading: boolean;
  error: string | null;
  mutationSuccess: boolean;
}

const initialState: ArtificialState = {
  artificials: [],
  singleArtificial: null,
  currentReviews: [],
  totalArtificials: 0,
  filteredCount: 0,
  isLoading: false,
  error: null,
  mutationSuccess: false,
};

export const artificialSlice = createSlice({
  name: "artificial",
  initialState,
  reducers: {
    setArtificialLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setArtificialError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearArtificialMutationFlags: (state) => {
      state.mutationSuccess = false;
      state.error = null;
    },

    setAllArtificialsData: (
      state,
      action: PayloadAction<{ artificials: IArtificial[]; totalArtificials: number; filteredCount: number }>
    ) => {
      state.artificials = action.payload.artificials;
      state.totalArtificials = action.payload.totalArtificials;
      state.filteredCount = action.payload.filteredCount;
      state.isLoading = false;
      state.error = null;
    },

    setSingleArtificialData: (state, action: PayloadAction<IArtificial>) => {
      state.singleArtificial = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    clearSingleArtificialData: (state) => {
      state.singleArtificial = null;
    },

    updateArtificialInState: (state, action: PayloadAction<IArtificial>) => {
      state.artificials = state.artificials.map((item) =>
        item._id === action.payload._id ? { ...item, ...action.payload } : item
      );
      state.isLoading = false;
    },

    deleteArtificialFromState: (state, action: PayloadAction<string>) => {
      state.artificials = state.artificials.filter((item) => item._id !== action.payload);
      state.totalArtificials = Math.max(0, state.totalArtificials - 1);
      state.filteredCount = Math.max(0, state.filteredCount - 1);
      state.mutationSuccess = true;
    },

    setTargetArtificialReviews: (state, action: PayloadAction<IArtificialReview[]>) => {
      state.currentReviews = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    submitArtificialReviewSuccess: (state) => {
      state.mutationSuccess = true;
      state.isLoading = false;
      state.error = null;
    },

    deleteArtificialReviewFromState: (state, action: PayloadAction<string>) => {
      state.currentReviews = state.currentReviews.filter((rev) => rev._id !== action.payload);
      state.mutationSuccess = true;
    },
  },
});

export const {
  setArtificialLoading,
  setArtificialError,
  clearArtificialMutationFlags,
  setAllArtificialsData,
  setSingleArtificialData,
  clearSingleArtificialData,
  updateArtificialInState,
  deleteArtificialFromState,
  setTargetArtificialReviews,
  submitArtificialReviewSuccess,
  deleteArtificialReviewFromState,
} = artificialSlice.actions;

export default artificialSlice.reducer;