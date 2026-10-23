import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IWishlist } from "@/types/index";

interface WishlistState {
  wishlist: IWishlist | null;
  isLoading: boolean;
  error: string | null;
  mutationSuccess: boolean;
  actionMessage: string | null;
}

const initialState: WishlistState = {
  wishlist: null,
  isLoading: false,
  error: null,
  mutationSuccess: false,
  actionMessage: null,
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlistLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setWishlistError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearWishlistMutationFlags: (state) => {
      state.mutationSuccess = false;
      state.error = null;
      state.actionMessage = null;
    },

    setWishlistData: (state, action: PayloadAction<IWishlist>) => {
      state.wishlist = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    wishlistToggleSuccess: (state, action: PayloadAction<{ wishlist: IWishlist; message?: string }>) => {
      state.wishlist = action.payload.wishlist;
      state.mutationSuccess = true;
      state.actionMessage = action.payload.message || null;
      state.isLoading = false;
      state.error = null;
    },

    clearWishlistData: (state) => {
      state.wishlist = null;
      state.mutationSuccess = false;
      state.actionMessage = null;
      state.error = null;
    },
  },
});

export const {
  setWishlistLoading,
  setWishlistError,
  clearWishlistMutationFlags,
  setWishlistData,
  wishlistToggleSuccess,
  clearWishlistData,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;