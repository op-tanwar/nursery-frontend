import { api } from "@/config/api";
import {
  IRazorpayOrderInitPayload,
  RazorpayOrderResponse,
  IRazorpaySignatureVerifyPayload,
  SignatureVerificationResponse
} from "@/types/payment.type";

export interface ICancelOrderPayload {
  razorpayOrderId?: string;
  orderId?: string;
  draftOrderId?: string;
  userId?: string;
  reason?: string;
}

export const paymentService = {
  initializeRazorpayOrder: async (payload: IRazorpayOrderInitPayload): Promise<RazorpayOrderResponse> => {
    const res: any = await api.post("/payment/create-order", payload);
    return res?.data ?? res;
  },

  verifyCryptographicSignature: async (payload: IRazorpaySignatureVerifyPayload): Promise<SignatureVerificationResponse> => {
    const res: any = await api.post("/payment/verify", payload);
    return res?.data ?? res;
  },

  cancelOrder: async (payload: ICancelOrderPayload): Promise<any> => {
    const res: any = await api.post("/payment/cancel-order", payload);
    return res?.data ?? res;
  }
};
