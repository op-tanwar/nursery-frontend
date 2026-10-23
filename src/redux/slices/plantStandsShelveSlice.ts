import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPlantStandsShelves, IPlantStandsShelvesReview } from "@/types/index";

interface PlantStandsShelvesState {
  plantStandsShelvesList: IPlantStandsShelves[];
  singlePlantStandsShelves: IPlantStandsShelves | null;
  currentReviews: IPlantStandsShelvesReview[];
  totalPlantStandsShelves: number;
  filteredCount: number;
  isLoading: boolean;
  error: string | null;
  mutationSuccess: boolean;
}

const initialState: PlantStandsShelvesState = {
  plantStandsShelvesList: [],
  singlePlantStandsShelves: null,
  currentReviews: [],
  totalPlantStandsShelves: 0,
  filteredCount: 0,
  isLoading: false,
  error: null,
  mutationSuccess: false,
};

export const plantStandsShelvesSlice = createSlice({
  name: "plantStandsShelves",
  initialState,
  reducers: {
    setPlantStandsShelvesLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setPlantStandsShelvesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearPlantStandsShelvesMutationFlags: (state) => {
      state.mutationSuccess = false;
      state.error = null;
    },

    setAllPlantStandsShelvesData: (
      state,
      action: PayloadAction<{
        plantStandsShelves: IPlantStandsShelves[];
        totalPlantStandsShelves: number;
        filteredCount: number;
      }>
    ) => {
      state.plantStandsShelvesList = action.payload.plantStandsShelves;
      state.totalPlantStandsShelves = action.payload.totalPlantStandsShelves;
      state.filteredCount = action.payload.filteredCount;
      state.isLoading = false;
      state.error = null;
    },

    setSinglePlantStandsShelvesData: (
      state,
      action: PayloadAction<IPlantStandsShelves>
    ) => {
      state.singlePlantStandsShelves = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    clearSinglePlantStandsShelvesData: (state) => {
      state.singlePlantStandsShelves = null;
    },

    updatePlantStandsShelvesInState: (
      state,
      action: PayloadAction<IPlantStandsShelves>
    ) => {
      state.plantStandsShelvesList = state.plantStandsShelvesList.map((item) =>
        item._id === action.payload._id ? { ...item, ...action.payload } : item
      );
      state.isLoading = false;
    },

    deletePlantStandsShelvesFromState: (
      state,
      action: PayloadAction<string>
    ) => {
      state.plantStandsShelvesList = state.plantStandsShelvesList.filter(
        (item) => item._id !== action.payload
      );
      state.totalPlantStandsShelves = Math.max(
        0,
        state.totalPlantStandsShelves - 1
      );
      state.filteredCount = Math.max(0, state.filteredCount - 1);
      state.mutationSuccess = true;
    },

    setTargetPlantStandsShelvesReviews: (
      state,
      action: PayloadAction<IPlantStandsShelvesReview[]>
    ) => {
      state.currentReviews = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    submitPlantStandsShelvesReviewSuccess: (state) => {
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
  setPlantStandsShelvesLoading,
  setPlantStandsShelvesError,
  clearPlantStandsShelvesMutationFlags,
  setAllPlantStandsShelvesData,
  setSinglePlantStandsShelvesData,
  clearSinglePlantStandsShelvesData,
  updatePlantStandsShelvesInState,
  deletePlantStandsShelvesFromState,
  setTargetPlantStandsShelvesReviews,
  submitPlantStandsShelvesReviewSuccess,
  deleteReviewFromState,
} = plantStandsShelvesSlice.actions;

export default plantStandsShelvesSlice.reducer;