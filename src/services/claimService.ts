import { api } from "@/config/api";
import {
  CreateClaimPayload,
  GetClaimsQuery,
  UpdateClaimStatusPayload,
  ClaimResponse,
  ClaimListResponse,
} from "@/types/claim.types";

/**
 * 🌿 Canonical Claim, Return & Replacement Service
 * Centralized client for all customer claims, returns, damaged item disputes,
 * nursery merchant review feeds, and central admin audits.
 *
 * Aligned with backend router: `/api/v1/claims`
 */
export const claimService = {
  /**
   * 👤 Customer: Create a Claim / Return / Replacement Request
   * Supports both multipart FormData (with image/video uploads) and JSON payloads.
   */
  createClaim: async (
    payload: FormData | CreateClaimPayload
  ): Promise<ClaimResponse> => {
    return api.post<any, ClaimResponse>("/claims/create", payload);
  },

  /**
   * 👤 Customer: Retrieve all claims submitted for a specific order
   */
  getOrderClaims: async (orderId: string): Promise<ClaimListResponse> => {
    return api.get<any, ClaimListResponse>(`/claims/order/${encodeURIComponent(orderId)}`);
  },

  /**
   * 👤 Customer: Retrieve all claims filed by the currently authenticated user
   */
  getUserClaims: async (): Promise<ClaimListResponse> => {
    return api.get<any, ClaimListResponse>("/claims/me");
  },

  /**
   * 🔍 Details: Fetch full details for a single claim record by ID
   */
  getClaimById: async (id: string): Promise<ClaimResponse> => {
    return api.get<any, ClaimResponse>(`/claims/single/${encodeURIComponent(id)}`);
  },

  /**
   * 🛡️ Central Admin: Get all platform claims with optional status/type/pagination filters
   */
  getAllAdminClaims: async (params?: GetClaimsQuery): Promise<ClaimListResponse> => {
    return api.get<any, ClaimListResponse>("/claims/admin/all", { params });
  },

  /**
   * 🛡️ Central Admin: Update claim lifecycle status, admin notes, refunds, or tracking
   */
  updateClaimStatus: async (
    id: string,
    statusOrPayload: string | UpdateClaimStatusPayload,
    adminNotes?: string
  ): Promise<ClaimResponse> => {
    const payload: UpdateClaimStatusPayload =
      typeof statusOrPayload === "string"
        ? { status: statusOrPayload, adminNotes }
        : statusOrPayload;

    return api.patch<any, ClaimResponse>(
      `/claims/admin/${encodeURIComponent(id)}/status`,
      payload
    );
  },

  /**
   * 🏡 Nursery Merchant: Get all claims assigned to this nursery vendor
   */
  getNurseryClaims: async (): Promise<ClaimListResponse> => {
    return api.get<any, ClaimListResponse>("/claims/nursery/my-requests");
  },

  /**
   * 🚫 Customer / Admin: Cancel an open claim request
   */
  cancelClaim: async (id: string, reason?: string): Promise<ClaimResponse> => {
    return api.patch<any, ClaimResponse>(
      `/claims/admin/${encodeURIComponent(id)}/status`,
      {
        status: "REJECTED",
        adminNotes: reason || "Cancelled by user request.",
      }
    );
  },

  // ======================================================================
  // 🔄 Backward-Compatible Migration Aliases
  // ======================================================================
  createRequest: async (
    payload: FormData | CreateClaimPayload
  ): Promise<ClaimResponse> => {
    return claimService.createClaim(payload);
  },

  getOrderRequests: async (orderId: string): Promise<ClaimListResponse> => {
    return claimService.getOrderClaims(orderId);
  },

  getAllAdminRequests: async (params?: GetClaimsQuery): Promise<ClaimListResponse> => {
    return claimService.getAllAdminClaims(params);
  },

  updateAdminStatus: async (
    id: string,
    status: string,
    adminNotes?: string
  ): Promise<ClaimResponse> => {
    return claimService.updateClaimStatus(id, status, adminNotes);
  },

  getNurseryRequests: async (): Promise<ClaimListResponse> => {
    return claimService.getNurseryClaims();
  },
};

export default claimService;
