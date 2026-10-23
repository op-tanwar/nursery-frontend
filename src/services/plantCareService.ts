import { api } from "@/config/api";
import {
  AllPlantCareResponse,
  PlantCareReviewsResponse,
  GenericPlantCareMutationResponse,
} from "@/types/index";

export const plantCareService = {
  getAllPlantCare: async (queryParams?: string): Promise<AllPlantCareResponse> => {
    const url = queryParams
      ? `/plant-care/allPlantCare?${queryParams}`
      : "/plant-care/allPlantCare";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  getPlantCareDetails: async (item: string): Promise<any> => {
    const res: any = await api.get(`/plant-care/plantCare/${item}`);
    return res?.data ?? res;
  },

  // ⚡ PERF: Direct slug lookup — avoids fetching full catalog to find one product
  getPlantCareBySlug: async (slug: string): Promise<any> => {
    const res: any = await api.get(`/plant-care/plantCare/slug/${slug}`);
    return res?.data ?? res;
  },

  createPlantCare: async (formData: FormData): Promise<any> => {
    const res: any = await api.post("/plant-care/admin/plantCare/new", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data ?? res;
  },

  updatePlantCare: async (id: string, formData: FormData): Promise<any> => {
    const res: any = await api.put(`/plant-care/admin/plantCare/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data ?? res;
  },

  deletePlantCare: async (id: string): Promise<GenericPlantCareMutationResponse> => {
    const res: any = await api.delete(`/plant-care/admin/plantCare/${id}`);
    return res?.data ?? res;
  },

  togglePlantCareStatus: async (id: string): Promise<any> => {
    const res: any = await api.put(`/plant-care/admin/plantCare/toggle/${id}`);
    return res?.data ?? res;
  },

  getMyPlantCare: async (): Promise<any> => {
    const res: any = await api.get("/plant-care/admin/my-plantCare");
    return res?.data ?? res;
  },

  getAdminAllPlantCare: async (queryParams?: string): Promise<any> => {
    const url = queryParams
      ? `/plant-care/admin/all-plantCare?${queryParams}`
      : "/plant-care/admin/all-plantCare";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  getPlantCareReviews: async (id: string): Promise<PlantCareReviewsResponse> => {
    const res: any = await api.get(`/plant-care/reviews?id=${id}`);
    return res?.data ?? res;
  },

  submitPlantCareReview: async (
    plantCareId: string,
    reviewData: { rating: number; comment: string; author?: string }
  ): Promise<any> => {
    const payload = { plantCareId, ...reviewData };
    const res: any = await api.put("/plant-care/review", payload);
    return res?.data ?? res;
  },

  deleteReview: async (
    plantCareId: string,
    reviewId: string
  ): Promise<GenericPlantCareMutationResponse> => {
    const res: any = await api.delete(
      `/plant-care/review/delete?plantCareId=${plantCareId}&id=${reviewId}`
    );
    return res?.data ?? res;
  },
};