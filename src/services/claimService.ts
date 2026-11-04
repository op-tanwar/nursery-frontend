import { api } from "@/config/api";
import {
  CreateReturnReplacementPayload,
  ReturnReplacementResponse,
  AllReturnReplacementsResponse,
} from "@/types/returnReplacement.types";

export const claimService = {
  // Customer: Create Return, Replacement, or Damage Claim Request
  createClaim: async (
    payload: FormData | CreateReturnReplacementPayload
  ): Promise<ReturnReplacementResponse> => {
    const res = await api.post<any, ReturnReplacementResponse>(
      "/claims/create",
      payload
    );
    return res;
  },

  // Customer: Get Claims for specific order
  getOrderClaims: async (
    orderId: string
  ): Promise<{ success: boolean; requests: any[]; claims?: any[] }> => {
    const res = await api.get<any, { success: boolean; requests: any[]; claims?: any[] }>(
      `/claims/order/${orderId}`
    );
    return res;
  },

  // Central Admin: Get all claims with optional status/type filter
  getAllAdminClaims: async (params?: {
    status?: string;
    type?: string;
    requestType?: string;
  }): Promise<AllReturnReplacementsResponse> => {
    const res = await api.get<any, AllReturnReplacementsResponse>(
      "/claims/admin/all",
      { params }
    );
    return res;
  },

  // Central Admin: Update status and notes
  updateClaimStatus: async (
    id: string,
    status: string,
    adminNotes?: string
  ): Promise<ReturnReplacementResponse> => {
    const res = await api.patch<any, ReturnReplacementResponse>(
      `/claims/admin/${id}/status`,
      { status, adminNotes }
    );
    return res;
  },

  // Nursery Partner: Get claims associated with this nursery
  getNurseryClaims: async (): Promise<AllReturnReplacementsResponse> => {
    const res = await api.get<any, AllReturnReplacementsResponse>(
      "/claims/nursery/my-requests"
    );
    return res;
  },
};

export default claimService;
