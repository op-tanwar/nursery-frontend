import { api } from "@/config/api";
import {
  CreateOrderPayload,
  OrderResponse,
  GetMyOrdersResponse,
  AllOrdersResponse,
  ClaimRequestPayload,
  DashboardStatsResponse,
  UpdateStatusPayload
} from "@/types/order.types";

export const orderService = {

  // ==========================================
  // 1. PUBLIC / AUTHENTICATED USER ROUTES
  // ==========================================

  createNewOrder: async (orderData: CreateOrderPayload): Promise<OrderResponse> => {
    const res = await api.post<any, OrderResponse>("/orders/new", orderData);
    return res;
  },

  getMyOrders: async (): Promise<GetMyOrdersResponse> => {
    const res = await api.get<any, GetMyOrdersResponse>("/orders/me");
    return res;
  },

  requestItemClaim: async (claimData: ClaimRequestPayload): Promise<{ success: boolean; message: string }> => {
    const res = await api.post<any, { success: boolean; message: string }>("/orders/claim/new", claimData);
    return res;
  },

  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    const res = await api.get<any, OrderResponse>(`/orders/single/${orderId}`);
    return res;
  },

  // ==========================================
  // 2. NURSERY PARTNER ROUTES
  // ==========================================

  getNurseryStats: async (): Promise<DashboardStatsResponse> => {
    const res = await api.get<any, DashboardStatsResponse>("/orders/nursery/dashboard-stats");
    return res;
  },

  getNurseryOrders: async (): Promise<AllOrdersResponse> => {
    const res = await api.get<any, AllOrdersResponse>("/orders/nursery/all");
    return res;
  },

  updateNurseryOrderStatus: async (orderId: string, updateData: UpdateStatusPayload): Promise<OrderResponse> => {
    const res = await api.put<any, OrderResponse>(`/orders/nursery/update-status/${orderId}`, updateData);
    return res;
  },

  // ==========================================
  // 3. CENTRAL ADMIN ROUTES
  // ==========================================

  getAdminStats: async (): Promise<DashboardStatsResponse> => {
    const res = await api.get<any, DashboardStatsResponse>("/orders/admin/dashboard-stats");
    return res;
  },

  getAllOrdersAdmin: async (): Promise<AllOrdersResponse> => {
    const res = await api.get<any, AllOrdersResponse>("/orders/admin/all");
    return res;
  },

  updateAdminOrderStatus: async (orderId: string, updateData: UpdateStatusPayload): Promise<OrderResponse> => {
    const res = await api.put<any, OrderResponse>(`/orders/admin/manage/${orderId}`, updateData);
    return res;
  },

  deleteOrderAdmin: async (orderId: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete<any, { success: boolean; message: string }>(`/orders/admin/manage/${orderId}`);
    return res;
  }
};