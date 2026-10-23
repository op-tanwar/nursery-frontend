import { api } from "@/config/api";
import {
  AllGardeningToolsResponse,
  GardeningToolReviewsResponse,
  GenericGardeningToolMutationResponse,
} from "@/types/index";

export const gardeningToolService = {
  getAllGardeningTools: async (
    queryParams?: string
  ): Promise<AllGardeningToolsResponse> => {
    const url = queryParams
      ? `/gardening-tools/allGardeningTools?${queryParams}`
      : "/gardening-tools/allGardeningTools";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  getGardeningToolDetails: async (toolId: string): Promise<any> => {
    const res: any = await api.get(`/gardening-tools/gardeningTool/${toolId}`);
    return res?.data ?? res;
  },

  // ⚡ PERF: Direct slug lookup — avoids fetching full catalog to find one product
  getGardeningToolBySlug: async (slug: string): Promise<any> => {
    const res: any = await api.get(`/gardening-tools/gardeningTool/slug/${slug}`);
    return res?.data ?? res;
  },

  createGardeningTool: async (formData: FormData): Promise<any> => {
    const res: any = await api.post("/gardening-tools/admin/gardeningTool/new", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data ?? res;
  },

  updateGardeningTool: async (toolId: string, formData: FormData): Promise<any> => {
    const res: any = await api.put(`/gardening-tools/admin/gardeningTool/${toolId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data ?? res;
  },

  deleteGardeningTool: async (
    toolId: string
  ): Promise<GenericGardeningToolMutationResponse> => {
    const res: any = await api.delete(`/gardening-tools/admin/gardeningTool/${toolId}`);
    return res?.data ?? res;
  },

  toggleGardeningToolStatus: async (toolId: string): Promise<any> => {
    const res: any = await api.put(`/gardening-tools/admin/gardeningTool/toggle/${toolId}`);
    return res?.data ?? res;
  },

  getMyGardeningTools: async (): Promise<any> => {
    const res: any = await api.get("/gardening-tools/admin/my-gardeningTools");
    return res?.data ?? res;
  },

  getAdminAllGardeningTools: async (queryParams?: string): Promise<any> => {
    const url = queryParams
      ? `/gardening-tools/admin/all-gardeningTools?${queryParams}`
      : "/gardening-tools/admin/all-gardeningTools";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  getGardeningToolReviews: async (
    toolId: string
  ): Promise<GardeningToolReviewsResponse> => {
    const res: any = await api.get(`/gardening-tools/reviews?id=${toolId}`);
    return res?.data ?? res;
  },

  submitGardeningToolReview: async (
    gardeningToolId: string,
    reviewData: { rating: number; comment: string; author?: string }
  ): Promise<any> => {
    const payload = {
      gardeningToolId,
      ...reviewData,
    };
    const res: any = await api.put("/gardening-tools/review", payload);
    return res?.data ?? res;
  },

  deleteReview: async (
    gardeningToolId: string,
    reviewId: string
  ): Promise<GenericGardeningToolMutationResponse> => {
    const res: any = await api.delete(
      `/gardening-tools/review/delete?gardeningToolId=${gardeningToolId}&id=${reviewId}`
    );
    return res?.data ?? res;
  },
};