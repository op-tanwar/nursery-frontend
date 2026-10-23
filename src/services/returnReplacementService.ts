import { api } from "@/config/api";
import {
  CreateReturnReplacementPayload,
  ReturnReplacementResponse,
  AllReturnReplacementsResponse,
} from "@/types/returnReplacement.types";

export const returnReplacementService = {
  // Customer: Create Return or Replacement Request
  createRequest: async (
    payload: FormData | CreateReturnReplacementPayload
  ): Promise<ReturnReplacementResponse> => {
    const res = await api.post<any, ReturnReplacementResponse>(
      "/return-replacement/create",
      payload
    );
    return res;
  },

  // Customer: Get Return Requests for specific order
  getOrderRequests: async (
    orderId: string
  ): Promise<{ success: boolean; requests: any[] }> => {
    const res = await api.get<any, { success: boolean; requests: any[] }>(
      `/return-replacement/order/${orderId}`
    );
    return res;
  },

  // Central Admin: Get all requests with optional status/type filter
  getAllAdminRequests: async (params?: {
    status?: string;
    type?: string;
    requestType?: string;
  }): Promise<AllReturnReplacementsResponse> => {
    const res = await api.get<any, AllReturnReplacementsResponse>(
      "/return-replacement/admin/all",
      { params }
    );
    return res;
  },

  // Central Admin: Update status and notes
  updateAdminStatus: async (
    id: string,
    status: string,
    adminNotes?: string
  ): Promise<ReturnReplacementResponse> => {
    const res = await api.patch<any, ReturnReplacementResponse>(
      `/return-replacement/admin/${id}/status`,
      { status, adminNotes }
    );
    return res;
  },

  // Nursery Partner: Get requests associated with this nursery
  getNurseryRequests: async (): Promise<AllReturnReplacementsResponse> => {
    const res = await api.get<any, AllReturnReplacementsResponse>(
      "/return-replacement/nursery/my-requests"
    );
    return res;
  },
};
