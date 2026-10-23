import { api } from "@/config/api";
import {
  AllSeedsBulbsResponse,
  SeedsBulbsReviewsResponse,
  GenericSeedsBulbsMutationResponse,
} from "@/types/index";

export const seedsBulbsService = {
  getAllSeedsBulbs: async (queryParams?: string): Promise<AllSeedsBulbsResponse> => {
    const url = queryParams
      ? `/seeds-bulbs/allSeedsBulbs?${queryParams}`
      : "/seeds-bulbs/allSeedsBulbs";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  getSeedsBulbsDetails: async (id: string): Promise<any> => {
    const res: any = await api.get(`/seeds-bulbs/seedsBulbs/${id}`);
    return res?.data ?? res;
  },

  // ⚡ PERF: Direct slug lookup — avoids fetching full catalog to find one product
  getSeedsBulbsBySlug: async (slug: string): Promise<any> => {
    const res: any = await api.get(`/seeds-bulbs/seedsBulbs/slug/${slug}`);
    return res?.data ?? res;
  },

  createSeedsBulbs: async (formData: FormData): Promise<any> => {
    const res: any = await api.post("/seeds-bulbs/admin/seedsBulbs/new", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data ?? res;
  },

  updateSeedsBulbs: async (id: string, formData: FormData): Promise<any> => {
    const res: any = await api.put(`/seeds-bulbs/admin/seedsBulbs/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data ?? res;
  },

  deleteSeedsBulbs: async (id: string): Promise<GenericSeedsBulbsMutationResponse> => {
    const res: any = await api.delete(`/seeds-bulbs/admin/seedsBulbs/${id}`);
    return res?.data ?? res;
  },

  toggleSeedsBulbsStatus: async (id: string): Promise<any> => {
    const res: any = await api.put(`/seeds-bulbs/admin/seedsBulbs/toggle/${id}`);
    return res?.data ?? res;
  },

  getMySeedsBulbs: async (): Promise<any> => {
    const res: any = await api.get("/seeds-bulbs/admin/my-seedsBulbs");
    return res?.data ?? res;
  },

  getAdminAllSeedsBulbs: async (queryParams?: string): Promise<any> => {
    const url = queryParams
      ? `/seeds-bulbs/admin/all-seedsBulbs?${queryParams}`
      : "/seeds-bulbs/admin/all-seedsBulbs";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  getSeedsBulbsReviews: async (id: string): Promise<SeedsBulbsReviewsResponse> => {
    const res: any = await api.get(`/seeds-bulbs/reviews?id=${id}`);
    return res?.data ?? res;
  },

  submitSeedsBulbsReview: async (
    seedsBulbsId: string,
    reviewData: { rating: number; comment: string; author?: string }
  ): Promise<any> => {
    const payload = { seedsBulbsId, ...reviewData };
    const res: any = await api.put("/seeds-bulbs/review", payload);
    return res?.data ?? res;
  },

  deleteReview: async (
    seedsBulbsId: string,
    reviewId: string
  ): Promise<GenericSeedsBulbsMutationResponse> => {
    const res: any = await api.delete(
      `/seeds-bulbs/review/delete?seedsBulbsId=${seedsBulbsId}&id=${reviewId}`
    );
    return res?.data ?? res;
  },
};