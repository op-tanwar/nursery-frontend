import { api } from "@/config/api";
import {
  AllArtificialsResponse,
  ArtificialReviewsResponse,
  GenericArtificialMutationResponse,
} from "@/types/artificialDriedPlant.types";

export const artificialDriedPlantService = {
  getAllArtificials: async (queryParams?: string): Promise<AllArtificialsResponse> => {
    const url = queryParams
      ? `/artificial-dried-plants/allArtificials?${queryParams}`
      : "/artificial-dried-plants/allArtificials";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  getArtificialDetails: async (artificialId: string): Promise<any> => {
    const res: any = await api.get(`/artificial-dried-plants/artificial/${artificialId}`);
    return res?.data ?? res;
  },

  // ⚡ PERF: Direct slug lookup — avoids fetching full catalog to find one product
  getArtificialBySlug: async (slug: string): Promise<any> => {
    const res: any = await api.get(`/artificial-dried-plants/artificial/slug/${slug}`);
    return res?.data ?? res;
  },

  deleteArtificial: async (artificialId: string): Promise<GenericArtificialMutationResponse> => {
    const res: any = await api.delete(`/artificial-dried-plants/admin/artificial/${artificialId}`);
    return res?.data ?? res;
  },

  createArtificial: async (formData: FormData): Promise<any> => {
    const res: any = await api.post("/artificial-dried-plants/admin/artificial/new", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data ?? res;
  },

  updateArtificial: async (id: string, formData: FormData): Promise<any> => {
    const res: any = await api.put(`/artificial-dried-plants/admin/artificial/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data ?? res;
  },

  getNurseryArtificials: async (): Promise<any> => {
    const res: any = await api.get("/artificial-dried-plants/admin/my-artificials");
    return res?.data ?? res;
  },

  /** Alias used by nursery inventory pages */
  getMyArtificials: async (): Promise<any> => {
    const res: any = await api.get("/artificial-dried-plants/admin/my-artificials");
    return res?.data ?? res;
  },

  toggleArtificialStatus: async (id: string): Promise<any> => {
    const res: any = await api.put(`/artificial-dried-plants/admin/artificial/toggle/${id}`);
    return res?.data ?? res;
  },

  getArtificialReviews: async (artificialId: string): Promise<ArtificialReviewsResponse> => {
    const res: any = await api.get(`/artificial-dried-plants/artificial/reviews?id=${artificialId}`);
    return res?.data ?? res;
  },

  submitArtificialReview: async (
    artificialId: string,
    reviewData: { rating: number; comment: string; author?: string }
  ): Promise<any> => {
    const payload = {
      artificialId,
      ...reviewData,
    };
    const res: any = await api.put("/artificial-dried-plants/artificial/review", payload);
    return res?.data ?? res;
  },

  deleteReview: async (artificialId: string, reviewId: string): Promise<GenericArtificialMutationResponse> => {
    const res: any = await api.delete(
      `/artificial-dried-plants/artificial/review/delete?artificialId=${artificialId}&id=${reviewId}`
    );
    return res?.data ?? res;
  },
};