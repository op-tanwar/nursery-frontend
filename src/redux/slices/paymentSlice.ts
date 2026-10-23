import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IRazorpayOrderData } from "@/types/payment.type";

interface PaymentState {
  activeRazorpayOrder: IRazorpayOrderData | null;
  isProcessing: boolean;
  paymentVerificationSuccess: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  activeRazorpayOrder: null,
  isProcessing: false,
  paymentVerificationSuccess: false,
  error: null,
};

export const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    startPaymentProcess: (state) => {
      state.isProcessing = true;
      state.error = null;
      state.paymentVerificationSuccess = false;
    },
    setRazorpayOrderSuccess: (state, action: PayloadAction<IRazorpayOrderData>) => {
      state.activeRazorpayOrder = action.payload;
      state.isProcessing = false;
    },
    setPaymentVerificationStatus: (state, action: PayloadAction<boolean>) => {
      state.paymentVerificationSuccess = action.payload;
      state.isProcessing = false;
      state.activeRazorpayOrder = null;
    },
    setPaymentFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isProcessing = false;
      state.paymentVerificationSuccess = false;
    },
    resetPaymentState: (state) => {
      state.activeRazorpayOrder = null;
      state.isProcessing = false;
      state.paymentVerificationSuccess = false;
      state.error = null;
    }
  },
});

export const {
  startPaymentProcess,
  setRazorpayOrderSuccess,
  setPaymentVerificationStatus,
  setPaymentFailure,
  resetPaymentState
} = paymentSlice.actions;

export default paymentSlice.reducer;