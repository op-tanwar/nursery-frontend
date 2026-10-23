import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IGardeningTool, IGardeningToolReview } from "@/types/index";

interface GardeningToolState {
  gardeningTools: IGardeningTool[];
  singleGardeningTool: IGardeningTool | null;
  currentReviews: IGardeningToolReview[];
  totalGardeningTools: number;
  filteredCount: number;
  isLoading: boolean;
  error: string | null;
  mutationSuccess: boolean;
}

const initialState: GardeningToolState = {
  gardeningTools: [],
  singleGardeningTool: null,
  currentReviews: [],
  totalGardeningTools: 0,
  filteredCount: 0,
  isLoading: false,
  error: null,
  mutationSuccess: false,
};

export const gardeningToolSlice = createSlice({
  name: "gardeningTool",
  initialState,
  reducers: {
    setGardeningToolLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setGardeningToolError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearGardeningToolMutationFlags: (state) => {
      state.mutationSuccess = false;
      state.error = null;
    },

    setAllGardeningToolsData: (
      state,
      action: PayloadAction<{
        gardeningTools: IGardeningTool[];
        totalGardeningTools: number;
        filteredCount: number;
      }>
    ) => {
      state.gardeningTools = action.payload.gardeningTools;
      state.totalGardeningTools = action.payload.totalGardeningTools;
      state.filteredCount = action.payload.filteredCount;
      state.isLoading = false;
      state.error = null;
    },

    setSingleGardeningToolData: (
      state,
      action: PayloadAction<IGardeningTool>
    ) => {
      state.singleGardeningTool = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    clearSingleGardeningToolData: (state) => {
      state.singleGardeningTool = null;
    },

    updateGardeningToolInState: (
      state,
      action: PayloadAction<IGardeningTool>
    ) => {
      state.gardeningTools = state.gardeningTools.map((tool) =>
        tool._id === action.payload._id ? { ...tool, ...action.payload } : tool
      );
      state.isLoading = false;
    },

    deleteGardeningToolFromState: (state, action: PayloadAction<string>) => {
      state.gardeningTools = state.gardeningTools.filter(
        (tool) => tool._id !== action.payload
      );
      state.totalGardeningTools = Math.max(0, state.totalGardeningTools - 1);
      state.filteredCount = Math.max(0, state.filteredCount - 1);
      state.mutationSuccess = true;
    },

    setTargetGardeningToolReviews: (
      state,
      action: PayloadAction<IGardeningToolReview[]>
    ) => {
      state.currentReviews = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    submitGardeningToolReviewSuccess: (state) => {
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
  setGardeningToolLoading,
  setGardeningToolError,
  clearGardeningToolMutationFlags,
  setAllGardeningToolsData,
  setSingleGardeningToolData,
  clearSingleGardeningToolData,
  updateGardeningToolInState,
  deleteGardeningToolFromState,
  setTargetGardeningToolReviews,
  submitGardeningToolReviewSuccess,
  deleteReviewFromState,
} = gardeningToolSlice.actions;

export default gardeningToolSlice.reducer;