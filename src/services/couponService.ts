import { api } from "../config/api";

// ======================================================================
// 🎟️ TYPED PROMOTIONAL COUPON ENTITIES & API CONTRACTS
// ======================================================================

export const COUPON_ENDPOINTS = {
  BASE: "/coupons",
  VALIDATE: "/promotions/coupon/validate",
  VALIDATE_LEGACY: "/coupon/validate",
} as const;

export type DiscountType = "percentage" | "flat";

export interface ICoupon {
  _id: string;
  id?: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  minCartValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  expiryDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  totalRedemptions: number;
}

export interface GetCouponsParams {
  search?: string;
  status?: "all" | "active" | "expired" | "inactive" | string;
  discountType?: "all" | "percentage" | "flat" | string;
  page?: number;
  limit?: number;
}

export interface GetCouponsResponse {
  success: boolean;
  count: number;
  totalPages: number;
  currentPage: number;
  stats: CouponStats;
  coupons: ICoupon[];
}

export interface CreateCouponDTO {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startDate?: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdateCouponDTO {
  code?: string;
  discountType?: DiscountType;
  discountValue?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface CouponMutationResponse {
  success: boolean;
  coupon?: ICoupon;
  message?: string;
}

export interface ValidateCouponPayload {
  code: string;
  cartTotal: number;
}

export interface ValidateCouponResponse {
  success: boolean;
  message?: string;
  code?: string;
  discountType?: "flat" | "percentage";
  discountValue?: number;
  discountAmount: number;
  finalTotal: number;
}

// ======================================================================
// 🚀 AUTHORITATIVE COUPON SERVICE CLIENT
// ======================================================================

export const couponService = {
  /**
   * 🛒 Checkout Validation (Customer facing)
   */
  validateCoupon: async (code: string, cartTotal: number): Promise<ValidateCouponResponse> => {
    const cleanCode = (code || "").trim().toUpperCase();
    const cleanTotal = Math.max(0, Number(cartTotal) || 0);

    const payload: ValidateCouponPayload = {
      code: cleanCode,
      cartTotal: cleanTotal,
    };

    const res: any = await api.post(COUPON_ENDPOINTS.VALIDATE, payload);
    return res as ValidateCouponResponse;
  },

  /**
   * 📋 Get All Coupons with search, filters, pagination & KPI stats (Admin)
   */
  getCoupons: async (params?: GetCouponsParams): Promise<GetCouponsResponse> => {
    const res: any = await api.get(COUPON_ENDPOINTS.BASE, { params });
    return res as GetCouponsResponse;
  },

  /**
   * 🔍 Get single coupon by ID (Admin)
   */
  getCouponById: async (id: string): Promise<{ success: boolean; coupon: ICoupon }> => {
    const res: any = await api.get(`${COUPON_ENDPOINTS.BASE}/${id}`);
    return res as { success: boolean; coupon: ICoupon };
  },

  /**
   * ➕ Create a new promotional coupon (Admin)
   */
  createCoupon: async (payload: CreateCouponDTO): Promise<CouponMutationResponse> => {
    const res: any = await api.post(COUPON_ENDPOINTS.BASE, payload);
    return res as CouponMutationResponse;
  },

  /**
   * ✏️ Update existing coupon (Admin)
   */
  updateCoupon: async (id: string, payload: UpdateCouponDTO): Promise<CouponMutationResponse> => {
    const res: any = await api.put(`${COUPON_ENDPOINTS.BASE}/${id}`, payload);
    return res as CouponMutationResponse;
  },

  /**
   * ⚡ Toggle coupon active state (Admin)
   */
  toggleCouponStatus: async (id: string, isActive?: boolean): Promise<CouponMutationResponse> => {
    const res: any = await api.patch(`${COUPON_ENDPOINTS.BASE}/${id}/toggle-status`, { isActive });
    return res as CouponMutationResponse;
  },

  /**
   * 🗑️ Delete coupon (Admin)
   */
  deleteCoupon: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res: any = await api.delete(`${COUPON_ENDPOINTS.BASE}/${id}`);
    return res as { success: boolean; message: string };
  },
};
