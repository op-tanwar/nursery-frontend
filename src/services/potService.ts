import { api } from "@/config/api";
import { AllPotsResponse, PotReviewsResponse, GenericPotMutationResponse } from "@/types/pots.types";

export const potService = {
  getAllPots: async (queryParams?: string): Promise<AllPotsResponse> => {
    const url = queryParams ? `/pots/allPots?${queryParams}` : "/pots/allPots";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  getPotDetails: async (potId: string): Promise<any> => {
    const res: any = await api.get(`/pots/pot/${potId}`);
    return res?.data ?? res;
  },

  // ⚡ PERF: Direct slug lookup — avoids fetching full catalog to find one product
  getPotBySlug: async (slug: string): Promise<any> => {
    const res: any = await api.get(`/pots/pot/slug/${slug}`);
    return res?.data ?? res;
  },

  deletePot: async (potId: string): Promise<GenericPotMutationResponse> => {
    const res: any = await api.delete(`/pots/admin/pot/${potId}`);
    return res?.data ?? res;
  },

  getPotReviews: async (potId: string): Promise<PotReviewsResponse> => {
    const res: any = await api.get(`/pots/pot/reviews?id=${potId}`);
    return res?.data ?? res;
  },

  // ✨ FIXED: Arguments structured to accept (potId, reviewData) matching frontend core trigger
  submitPotReview: async (potId: string, reviewData: { rating: number; comment: string; author?: string }): Promise<any> => {
    const payload = {
      potId,
      ...reviewData
    };
    const res: any = await api.put("/pots/pot/review", payload);
    return res?.data ?? res;
  },

  deleteReview: async (potId: string, reviewId: string): Promise<GenericPotMutationResponse> => {
    const res: any = await api.delete(`/pots/pot/review/delete?potId=${potId}&id=${reviewId}`);
    return res?.data ?? res;
  },
};