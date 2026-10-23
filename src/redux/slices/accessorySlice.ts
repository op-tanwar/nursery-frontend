import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IAccessory, IAccessoryReview } from "@/types/accessories.types";

interface AccessoryState {
  accessories: IAccessory[];
  singleAccessory: IAccessory | null;
  currentReviews: IAccessoryReview[];
  totalAccessories: number;
  filteredCount: number;
  isLoading: boolean;
  error: string | null;
  mutationSuccess: boolean;
}

const initialState: AccessoryState = {
  accessories: [],
  singleAccessory: null,
  currentReviews: [],
  totalAccessories: 0,
  filteredCount: 0,
  isLoading: false,
  error: null,
  mutationSuccess: false,
};

export const accessorySlice = createSlice({
  name: "accessory",
  initialState,
  reducers: {
    setAccessoryLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setAccessoryError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearAccessoryMutationFlags: (state) => {
      state.mutationSuccess = false;
      state.error = null;
    },

    setAllAccessoriesData: (
      state,
      action: PayloadAction<{ accessories: IAccessory[]; totalAccessories: number; filteredCount: number }>
    ) => {
      state.accessories = action.payload.accessories;
      state.totalAccessories = action.payload.totalAccessories;
      state.filteredCount = action.payload.filteredCount;
      state.isLoading = false;
      state.error = null;
    },

    setSingleAccessoryData: (state, action: PayloadAction<IAccessory>) => {
      state.singleAccessory = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    clearSingleAccessoryData: (state) => {
      state.singleAccessory = null;
    },

    deleteAccessoryFromState: (state, action: PayloadAction<string>) => {
      state.accessories = state.accessories.filter((item) => item._id !== action.payload);
      state.totalAccessories = Math.max(0, state.totalAccessories - 1);
      state.filteredCount = Math.max(0, state.filteredCount - 1);
      state.mutationSuccess = true;
    },

    setTargetAccessoryReviews: (state, action: PayloadAction<IAccessoryReview[]>) => {
      state.currentReviews = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    // ✨ FIXED: Added for handling successful review submission/update
    submitAccessoryReviewSuccess: (state) => {
      state.mutationSuccess = true;
      state.isLoading = false;
      state.error = null;
    },

    deleteAccessoryReviewFromState: (state, action: PayloadAction<string>) => {
      state.currentReviews = state.currentReviews.filter((rev) => rev._id !== action.payload);
      state.mutationSuccess = true;
    },
  },
});

export const {
  setAccessoryLoading,
  setAccessoryError,
  clearAccessoryMutationFlags,
  setAllAccessoriesData,
  setSingleAccessoryData,
  clearSingleAccessoryData,
  deleteAccessoryFromState,
  setTargetAccessoryReviews,
  submitAccessoryReviewSuccess, // Exported
  deleteAccessoryReviewFromState,
} = accessorySlice.actions;

export default accessorySlice.reducer;