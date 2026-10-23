import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICart } from "@/types/index";
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
  clearGuestCart,
  formatGuestCartToICart,
  IGuestProduct,
} from "@/utils/guestCart";

interface CartState {
  cart: ICart | null;
  isLoading: boolean;
  error: string | null;
  mutationSuccess: boolean;
  actionMessage: string | null;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
  mutationSuccess: false,
  actionMessage: null,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setCartError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearCartMutationFlags: (state) => {
      state.mutationSuccess = false;
      state.error = null;
      state.actionMessage = null;
    },

    setCartData: (state, action: PayloadAction<ICart>) => {
      state.cart = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    cartActionSuccess: (state, action: PayloadAction<{ cart: ICart; message?: string }>) => {
      state.cart = action.payload.cart;
      state.mutationSuccess = true;
      state.actionMessage = action.payload.message || null;
      state.isLoading = false;
      state.error = null;
    },

    clearCartData: (state) => {
      state.cart = null;
      state.mutationSuccess = false;
      state.actionMessage = null;
      state.error = null;
    },

    // 🛒 GUEST CART ACTIONS (LOCALSTORAGE MIRRORED TO REDUX)
    loadGuestCart: (state) => {
      if (typeof window !== "undefined") {
        const guestItems = getGuestCart();
        state.cart = formatGuestCartToICart(guestItems);
        state.isLoading = false;
        state.error = null;
      }
    },

    addToGuestCartAction: (
      state,
      action: PayloadAction<{
        product: IGuestProduct;
        quantity: number;
        itemModel?: string;
        nursery?: string;
      }>
    ) => {
      const { cart, message } = addToGuestCart(action.payload);
      state.cart = cart;
      state.mutationSuccess = true;
      state.actionMessage = message;
      state.isLoading = false;
      state.error = null;
    },

    updateGuestCartQuantityAction: (
      state,
      action: PayloadAction<{
        productId: string;
        quantity: number;
      }>
    ) => {
      const { cart } = updateGuestCartQuantity(
        action.payload.productId,
        action.payload.quantity
      );
      state.cart = cart;
      state.mutationSuccess = true;
      state.isLoading = false;
      state.error = null;
    },

    removeFromGuestCartAction: (
      state,
      action: PayloadAction<{
        productId: string;
      }>
    ) => {
      const { cart, message } = removeFromGuestCart(action.payload.productId);
      state.cart = cart;
      state.mutationSuccess = true;
      state.actionMessage = message;
      state.isLoading = false;
      state.error = null;
    },

    clearGuestCartAction: (state) => {
      clearGuestCart();
      state.cart = formatGuestCartToICart([]);
      state.mutationSuccess = true;
      state.actionMessage = "Guest cart cleared";
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setCartLoading,
  setCartError,
  clearCartMutationFlags,
  setCartData,
  cartActionSuccess,
  clearCartData,
  loadGuestCart,
  addToGuestCartAction,
  updateGuestCartQuantityAction,
  removeFromGuestCartAction,
  clearGuestCartAction,
} = cartSlice.actions;

export default cartSlice.reducer;