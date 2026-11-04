import { api } from "@/config/api";

export interface ValidateCouponResponse {
  success: boolean;
  message?: string;
  code?: string;
  discountType?: "flat" | "percentage";
  discountValue?: number;
  discountAmount: number;
  finalTotal: number;
}

export const couponService = {
  validateCoupon: async (code: string, cartTotal: number): Promise<ValidateCouponResponse> => {
    const res: any = await api.post("/promotions/coupon/validate", { code, cartTotal });
    return res;
  },
};
