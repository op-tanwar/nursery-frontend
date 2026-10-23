import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPlantCare, IPlantCareReview } from "@/types/index";

interface PlantCareState {
  plantCareList: IPlantCare[];
  singlePlantCare: IPlantCare | null;
  currentReviews: IPlantCareReview[];
  totalPlantCare: number;
  filteredCount: number;
  isLoading: boolean;
  error: string | null;
  mutationSuccess: boolean;
}

const initialState: PlantCareState = {
  plantCareList: [],
  singlePlantCare: null,
  currentReviews: [],
  totalPlantCare: 0,
  filteredCount: 0,
  isLoading: false,
  error: null,
  mutationSuccess: false,
};

export const plantCareSlice = createSlice({
  name: "plantCare",
  initialState,
  reducers: {
    setPlantCareLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setPlantCareError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearPlantCareMutationFlags: (state) => {
      state.mutationSuccess = false;
      state.error = null;
    },

    setAllPlantCareData: (
      state,
      action: PayloadAction<{
        plantCare: IPlantCare[];
        totalPlantCare: number;
        filteredCount: number;
      }>
    ) => {
      state.plantCareList = action.payload.plantCare;
      state.totalPlantCare = action.payload.totalPlantCare;
      state.filteredCount = action.payload.filteredCount;
      state.isLoading = false;
      state.error = null;
    },

    setSinglePlantCareData: (state, action: PayloadAction<IPlantCare>) => {
      state.singlePlantCare = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    clearSinglePlantCareData: (state) => {
      state.singlePlantCare = null;
    },

    updatePlantCareInState: (state, action: PayloadAction<IPlantCare>) => {
      state.plantCareList = state.plantCareList.map((item) =>
        item._id === action.payload._id ? { ...item, ...action.payload } : item
      );
      state.isLoading = false;
    },

    deletePlantCareFromState: (state, action: PayloadAction<string>) => {
      state.plantCareList = state.plantCareList.filter(
        (item) => item._id !== action.payload
      );
      state.totalPlantCare = Math.max(0, state.totalPlantCare - 1);
      state.filteredCount = Math.max(0, state.filteredCount - 1);
      state.mutationSuccess = true;
    },

    setTargetPlantCareReviews: (
      state,
      action: PayloadAction<IPlantCareReview[]>
    ) => {
      state.currentReviews = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    submitPlantCareReviewSuccess: (state) => {
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
  setPlantCareLoading,
  setPlantCareError,
  clearPlantCareMutationFlags,
  setAllPlantCareData,
  setSinglePlantCareData,
  clearSinglePlantCareData,
  updatePlantCareInState,
  deletePlantCareFromState,
  setTargetPlantCareReviews,
  submitPlantCareReviewSuccess,
  deleteReviewFromState,
} = plantCareSlice.actions;

export default plantCareSlice.reducer;