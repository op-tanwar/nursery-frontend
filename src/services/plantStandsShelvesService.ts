import { api } from "@/config/api";
import {
  AllPlantStandsShelvesResponse,
  PlantStandsShelvesReviewsResponse,
  GenericPlantStandsShelvesMutationResponse,
} from "@/types/index";

export const plantStandsShelvesService = {
  getAllPlantStandsShelves: async (
    queryParams?: string
  ): Promise<AllPlantStandsShelvesResponse> => {
    const url = queryParams
      ? `/plant-stands-shelves/allPlantStandsShelves?${queryParams}`
      : "/plant-stands-shelves/allPlantStandsShelves";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  getPlantStandsShelvesDetails: async (id: string): Promise<any> => {
    const res: any = await api.get(`/plant-stands-shelves/plantStandsShelves/${id}`);
    return res?.data ?? res;
  },

  // ⚡ PERF: Direct slug lookup — avoids fetching full catalog to find one product
  getPlantStandsShelvesBySlug: async (slug: string): Promise<any> => {
    const res: any = await api.get(`/plant-stands-shelves/plantStandsShelves/slug/${slug}`);
    return res?.data ?? res;
  },

  createPlantStandsShelves: async (formData: FormData): Promise<any> => {
    const res: any = await api.post(
      "/plant-stands-shelves/admin/plantStandsShelves/new",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res?.data ?? res;
  },

  updatePlantStandsShelves: async (id: string, formData: FormData): Promise<any> => {
    const res: any = await api.put(
      `/plant-stands-shelves/admin/plantStandsShelves/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res?.data ?? res;
  },

  deletePlantStandsShelves: async (
    id: string
  ): Promise<GenericPlantStandsShelvesMutationResponse> => {
    const res: any = await api.delete(
      `/plant-stands-shelves/admin/plantStandsShelves/${id}`
    );
    return res?.data ?? res;
  },

  togglePlantStandsShelvesStatus: async (id: string): Promise<any> => {
    const res: any = await api.put(
      `/plant-stands-shelves/admin/plantStandsShelves/toggle/${id}`
    );
    return res?.data ?? res;
  },

  getMyPlantStandsShelves: async (): Promise<any> => {
    const res: any = await api.get("/plant-stands-shelves/admin/my-plantStandsShelves");
    return res?.data ?? res;
  },

  getAdminAllPlantStandsShelves: async (queryParams?: string): Promise<any> => {
    const url = queryParams
      ? `/plant-stands-shelves/admin/all-plantStandsShelves?${queryParams}`
      : "/plant-stands-shelves/admin/all-plantStandsShelves";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  getPlantStandsShelvesReviews: async (
    id: string
  ): Promise<PlantStandsShelvesReviewsResponse> => {
    const res: any = await api.get(`/plant-stands-shelves/reviews?id=${id}`);
    return res?.data ?? res;
  },

  submitPlantStandsShelvesReview: async (
    plantStandsShelvesId: string,
    reviewData: { rating: number; comment: string; author?: string }
  ): Promise<any> => {
    const payload = { plantStandsShelvesId, ...reviewData };
    const res: any = await api.put("/plant-stands-shelves/review", payload);
    return res?.data ?? res;
  },

  deleteReview: async (
    plantStandsShelvesId: string,
    reviewId: string
  ): Promise<GenericPlantStandsShelvesMutationResponse> => {
    const res: any = await api.delete(
      `/plant-stands-shelves/review/delete?plantStandsShelvesId=${plantStandsShelvesId}&id=${reviewId}`
    );
    return res?.data ?? res;
  },
};