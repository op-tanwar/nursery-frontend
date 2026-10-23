import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IOrder } from "@/types/order.types";

interface OrderState {
  orders: IOrder[];
  currentOrder: IOrder | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrderLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setOrderError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setMyOrdersData: (state, action: PayloadAction<IOrder[]>) => {
      state.orders = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentOrderDetails: (state, action: PayloadAction<IOrder>) => {
      state.currentOrder = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    clearOrderState: (state) => {
      state.orders = [];
      state.currentOrder = null;
      state.error = null;
      state.isLoading = false;
    }
  },
});

export const {
  setOrderLoading,
  setOrderError,
  setMyOrdersData,
  setCurrentOrderDetails,
  clearOrderState
} = orderSlice.actions;

export default orderSlice.reducer;