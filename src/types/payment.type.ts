import { IShippingAddress } from "./order.types";

export interface IRazorpayOrderInitPayload {
  orderItems: {
    productId?: string;
    item?: string;
    quantity: number;
    itemModel?: string;
    name?: string;
    price?: number;
    image?: string;
  }[];
  shippingInfo?: IShippingAddress | Record<string, any>;
  // Legacy / informative fields (backend ignores and recalculates authoritatively)
  amount?: number;
  currency?: "INR" | string;
  receipt?: string;
  itemsPrice?: number;
  taxPrice?: number;
  shippingPrice?: number;
  totalPrice?: number;
}

export interface IRazorpayOrderData {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

export interface RazorpayOrderResponse {
  success: boolean;
  message?: string;
  order: IRazorpayOrderData;
  calculation?: {
    originalItemsPrice: number;
    discountAmount: number;
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
  };
}

export interface IRazorpaySignatureVerifyPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  shippingInfo?: IShippingAddress | Record<string, any>;
  orderItems: {
    productId?: string;
    item?: string;
    quantity: number;
    itemModel?: string;
    name?: string;
    price?: number;
    image?: string;
  }[];
  paymentInfo?: {
    id?: string;
    status?: string;
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };
  itemsPrice?: number;
  taxPrice?: number;
  shippingPrice?: number;
  totalPrice?: number;
}

export interface SignatureVerificationResponse {
  success: boolean;
  message: string;
  order?: any;
}