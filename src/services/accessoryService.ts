import { api } from "@/config/api";
import { AllAccessoriesResponse, AccessoryReviewsResponse, GenericAccessoryMutationResponse } from "@/types/accessories.types";

export const accessoryService = {
  getAllAccessories: async (queryParams?: string): Promise<AllAccessoriesResponse> => {
    const url = queryParams ? `/accessories/allAccessories?${queryParams}` : "/accessories/allAccessories";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  getAccessoryDetails: async (accessoryId: string): Promise<any> => {
    const res: any = await api.get(`/accessories/accessory/${accessoryId}`);
    return res?.data ?? res;
  },

  // ⚡ PERF: Direct slug lookup — avoids fetching full catalog to find one product
  getAccessoryBySlug: async (slug: string): Promise<any> => {
    const res: any = await api.get(`/accessories/accessory/slug/${slug}`);
    return res?.data ?? res;
  },

  deleteAccessory: async (accessoryId: string): Promise<GenericAccessoryMutationResponse> => {
    const res: any = await api.delete(`/accessories/admin/accessory/${accessoryId}`);
    return res?.data ?? res;
  },

  getAccessoryReviews: async (accessoryId: string): Promise<AccessoryReviewsResponse> => {
    const res: any = await api.get(`/accessories/accessory/reviews?id=${accessoryId}`);
    return res?.data ?? res;
  },

  // ✨ FIXED: Standardized to separate identifier mapping to block structural pipeline breaks
  submitAccessoryReview: async (accessoryId: string, reviewData: { rating: number; comment: string; author?: string }): Promise<any> => {
    const payload = {
      accessoryId,
      ...reviewData
    };
    const res: any = await api.put("/accessories/accessory/review", payload);
    return res?.data ?? res;
  },

  deleteReview: async (accessoryId: string, reviewId: string): Promise<GenericAccessoryMutationResponse> => {
    const res: any = await api.delete(
      `/accessories/accessory/review/delete?accessoryId=${accessoryId}&id=${reviewId}`
    );
    return res?.data ?? res;
  },
};