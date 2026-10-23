import { api } from "@/config/api";
import { AllPlantsResponse, PlantReviewsResponse, GenericPlantMutationResponse } from "@/types/index";

export const plantService = {
  getAllPlants: async (queryParams?: string): Promise<AllPlantsResponse> => {
    const url = queryParams ? `/plants/allPlants?${queryParams}` : "/plants/allPlants";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  getPlantDetails: async (plantId: string): Promise<any> => {
    const res: any = await api.get(`/plants/plant/${plantId}`);
    return res?.data ?? res;
  },

  // ⚡ PERF: Direct slug lookup — avoids fetching full catalog to find one product
  getPlantBySlug: async (slug: string): Promise<any> => {
    const res: any = await api.get(`/plants/plant/slug/${slug}`);
    return res?.data ?? res;
  },

  deletePlant: async (plantId: string): Promise<GenericPlantMutationResponse> => {
    const res: any = await api.delete(`/plants/admin/plant/${plantId}`);
    return res?.data ?? res;
  },

  getPlantReviews: async (plantId: string): Promise<PlantReviewsResponse> => {
    const res: any = await api.get(`/plants/reviews?id=${plantId}`);
    return res?.data ?? res;
  },

  // ✨ FIXED: Added explicit id key injection inside body payload mapping
  submitPlantReview: async (plantId: string, reviewData: { rating: number; comment: string; author?: string }): Promise<any> => {
    const payload = {
      plantId, // Passes identifier for factory backend logic parsing
      ...reviewData
    };
    const res: any = await api.put("/plants/review", payload);
    return res?.data ?? res;
  },

  deleteReview: async (plantId: string, reviewId: string): Promise<GenericPlantMutationResponse> => {
    const res: any = await api.delete(`/plants/review/delete?plantId=${plantId}&id=${reviewId}`);
    return res?.data ?? res;
  },
};