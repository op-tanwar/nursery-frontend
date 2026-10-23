import { api } from "@/config/api";
import {
  INurseryPayoutSummaryResponse,
  INurseryPayoutHistoryResponse,
  ICommissionBreakdownResponse,
  IAdminPayoutsListResponse,
  IPayoutRecord,
} from "@/types/payout.types";

export const payoutService = {
  // ── Nursery Endpoints ──────────────────────────────────────────

  getNurseryPayoutSummary: async (): Promise<INurseryPayoutSummaryResponse> => {
    return (await api.get("/payouts/nursery/summary")) as unknown as INurseryPayoutSummaryResponse;
  },

  getNurseryPayoutHistory: async (
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<INurseryPayoutHistoryResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status && status !== "ALL") {
      params.append("status", status);
    }
    return (await api.get(
      `/payouts/nursery/history?${params.toString()}`
    )) as unknown as INurseryPayoutHistoryResponse;
  },

  requestPayout: async (
    amount: number,
    payoutMethod: "BANK_TRANSFER" | "UPI" | "MANUAL" = "BANK_TRANSFER",
    idempotencyKey?: string
  ): Promise<{ success: boolean; message: string; payout: IPayoutRecord; idempotent?: boolean }> => {
    // Auto-generate idempotency key if not provided — prevents duplicate transfers on retry
    const key = idempotencyKey ?? `payout-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return (await api.post("/payouts/nursery/request", {
      amount,
      payoutMethod,
      idempotencyKey: key,
    })) as unknown as { success: boolean; message: string; payout: IPayoutRecord; idempotent?: boolean };
  },

  getNurseryCommissionBreakdown: async (
    page: number = 1,
    limit: number = 20
  ): Promise<ICommissionBreakdownResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return (await api.get(
      `/payouts/nursery/commission-breakdown?${params.toString()}`
    )) as unknown as ICommissionBreakdownResponse;
  },

  // ── Admin Endpoints ────────────────────────────────────────────

  getAdminPayoutsList: async (
    status?: string,
    nurseryId?: string,
    page: number = 1,
    limit: number = 15
  ): Promise<IAdminPayoutsListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status && status !== "ALL") {
      params.append("status", status);
    }
    if (nurseryId) {
      params.append("nurseryId", nurseryId);
    }
    return (await api.get(
      `/payouts/admin/list?${params.toString()}`
    )) as unknown as IAdminPayoutsListResponse;
  },

  adminUpdatePayoutStatus: async (
    id: string,
    payload: {
      status: "PROCESSING" | "COMPLETED" | "REJECTED";
      utrNumber?: string;
      rejectionReason?: string;
      adminNote?: string;
    }
  ): Promise<{ success: boolean; message: string; payout: IPayoutRecord }> => {
    const cleanId = encodeURIComponent(String(id).trim());
    return (await api.patch(
      `/payouts/admin/${cleanId}/status`,
      payload
    )) as unknown as { success: boolean; message: string; payout: IPayoutRecord };
  },
};
