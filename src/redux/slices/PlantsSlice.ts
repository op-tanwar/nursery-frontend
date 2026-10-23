import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPlant, IPlantReview } from "@/types/index";

interface PlantState {
  plants: IPlant[];
  singlePlant: IPlant | null;
  currentReviews: IPlantReview[];
  totalPlants: number;
  filteredCount: number;
  isLoading: boolean;
  error: string | null;
  mutationSuccess: boolean;
}

const initialState: PlantState = {
  plants: [],
  singlePlant: null,
  currentReviews: [],
  totalPlants: 0,
  filteredCount: 0,
  isLoading: false,
  error: null,
  mutationSuccess: false,
};

export const plantSlice = createSlice({
  name: "plant",
  initialState,
  reducers: {
    setPlantLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setPlantError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearPlantMutationFlags: (state) => {
      state.mutationSuccess = false;
      state.error = null;
    },

    setAllPlantsData: (
      state,
      action: PayloadAction<{ plants: IPlant[]; totalPlants: number; filteredCount: number }>
    ) => {
      state.plants = action.payload.plants;
      state.totalPlants = action.payload.totalPlants;
      state.filteredCount = action.payload.filteredCount;
      state.isLoading = false;
      state.error = null;
    },

    setSinglePlantData: (state, action: PayloadAction<IPlant>) => {
      state.singlePlant = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    clearSinglePlantData: (state) => {
      state.singlePlant = null;
    },

    deletePlantFromState: (state, action: PayloadAction<string>) => {
      state.plants = state.plants.filter((plant) => plant._id !== action.payload);
      state.totalPlants = Math.max(0, state.totalPlants - 1);
      state.filteredCount = Math.max(0, state.filteredCount - 1);
      state.mutationSuccess = true;
    },

    setTargetPlantReviews: (state, action: PayloadAction<IPlantReview[]>) => {
      state.currentReviews = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    // ✨ FIXED: Added for handling successful review submission/update
    submitPlantReviewSuccess: (state) => {
      state.mutationSuccess = true;
      state.isLoading = false;
      state.error = null;
    },

    deleteReviewFromState: (state, action: PayloadAction<string>) => {
      state.currentReviews = state.currentReviews.filter((rev) => rev._id !== action.payload);
      state.mutationSuccess = true;
    },
  },
});

export const {
  setPlantLoading,
  setPlantError,
  clearPlantMutationFlags,
  setAllPlantsData,
  setSinglePlantData,
  clearSinglePlantData,
  deletePlantFromState,
  setTargetPlantReviews,
  submitPlantReviewSuccess, // Exported
  deleteReviewFromState,
} = plantSlice.actions;

export default plantSlice.reducer;