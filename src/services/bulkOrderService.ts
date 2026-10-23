import { api } from "@/config/api";
import {
  CreateBulkOrderPayload,
  BulkOrdersResponse,
  BulkOrderSingleResponse,
} from "@/types/bulkOrder.types";

export const bulkOrderService = {
  /**
   * Submit a new bulk order inquiry (Public)
   */
  createBulkOrder: async (
    payload: CreateBulkOrderPayload
  ): Promise<BulkOrderSingleResponse> => {
    const res: any = await api.post("/bulk-orders", payload);
    return res?.data ?? res;
  },

  /**
   * Fetch all bulk orders with pagination, search, and filters (Admin)
   */
  getBulkOrders: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    productType?: string;
  }): Promise<BulkOrdersResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search && params.search.trim()) query.append("search", params.search.trim());
    if (params?.status && params.status !== "all") query.append("status", params.status);
    if (params?.productType && params.productType !== "all") query.append("productType", params.productType);

    const queryString = query.toString();
    const url = `/admin/bulk-orders${queryString ? `?${queryString}` : ""}`;

    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  /**
   * Update status and optional admin notes (Admin)
   */
  updateBulkOrderStatus: async (
    id: string,
    status: string,
    adminNotes?: string
  ): Promise<BulkOrderSingleResponse> => {
    const res: any = await api.patch(`/admin/bulk-orders/${id}/status`, {
      status,
      adminNotes,
    });
    return res?.data ?? res;
  },

  /**
   * Get single bulk order details (Admin)
   */
  getBulkOrderDetails: async (id: string): Promise<BulkOrderSingleResponse> => {
    const res: any = await api.get(`/admin/bulk-orders/${id}`);
    return res?.data ?? res;
  },

  /**
   * Delete an invalid or test inquiry (Admin)
   */
  deleteBulkOrder: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const res: any = await api.delete(`/admin/bulk-orders/${id}`);
    return res?.data ?? res;
  },
};
