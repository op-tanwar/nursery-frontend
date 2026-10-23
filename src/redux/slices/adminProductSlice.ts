import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IAdminProduct } from "@/types/adminProduct.types";

interface AdminProductState {
  products: IAdminProduct[];
  totalCount: number;
  filteredCount: number;
  isLoading: boolean;
  error: string | null;
  mutationSuccess: boolean;
}

const initialState: AdminProductState = {
  products: [],
  totalCount: 0,
  filteredCount: 0,
  isLoading: false,
  error: null,
  mutationSuccess: false,
};

export const adminProductSlice = createSlice({
  name: "adminProduct",
  initialState,
  reducers: {
    setAdminProductLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setAdminProductError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearAdminProductMutationFlags: (state) => {
      state.mutationSuccess = false;
      state.error = null;
    },

    setAdminProductsData: (
      state,
      action: PayloadAction<{ products: IAdminProduct[]; totalCount: number; filteredCount: number }>
    ) => {
      state.products = action.payload.products;
      state.totalCount = action.payload.totalCount;
      state.filteredCount = action.payload.filteredCount;
      state.isLoading = false;
      state.error = null;
    },

    // 🌟 Local state updates after admin toggles the active switch
    updateProductStatusInState: (state, action: PayloadAction<{ id: string; isActive: boolean }>) => {
      const index = state.products.findIndex((item) => item._id === action.payload.id);
      if (index !== -1) {
        state.products[index].isActive = action.payload.isActive;
      }
      state.mutationSuccess = true;
    },

    // 🌟 Local state updates after admin deletes a resource completely
    deleteProductFromAdminState: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((item) => item._id !== action.payload);
      state.totalCount = Math.max(0, state.totalCount - 1);
      state.filteredCount = Math.max(0, state.filteredCount - 1);
      state.mutationSuccess = true;
      state.isLoading = false;
    },
  },
});

export const {
  setAdminProductLoading,
  setAdminProductError,
  clearAdminProductMutationFlags,
  setAdminProductsData,
  updateProductStatusInState,
  deleteProductFromAdminState,
} = adminProductSlice.actions;

export default adminProductSlice.reducer;