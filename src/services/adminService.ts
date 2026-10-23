import { api } from "@/config/api";

export interface UserUpdatePayload {
  role: "user" | "nursery" | "admin";
}

export interface NurseryReviewPayload {
  status: "Approved" | "Rejected";
  rejectionReason?: string;
}

export interface ToggleNurseryStatusPayload {
  isActive: boolean;
}

interface GlobalStatsResponse { success: boolean; stats: any; }
interface AllOrdersResponse { success: boolean; orders: any[]; }
interface AllUsersResponse { success: boolean; users: any[]; }
interface AllNurseriesResponse { success: boolean; count?: number; users: any[]; }
interface NurseryApplicationsResponse { success: boolean; applications: any[]; }
interface NewsletterSubscribersResponse { success: boolean; subscribers: any[]; }
interface GenericMutationResponse { success: boolean; message: string; }

interface ToggleNurseryStatusResponse {
  success: boolean;
  message: string;
  isActive: boolean;
}

export const adminService = {
  getGlobalStats: async (): Promise<GlobalStatsResponse> => {
    const res: any = await api.get("/admin-dashboard/stats");
    return res?.data ?? res;
  },
  getAllOrders: async (): Promise<AllOrdersResponse> => {
    const res: any = await api.get("/orders/admin/all");
    return res?.data ?? res;
  },
  updateOrderStatus: async (orderId: string, status: string): Promise<GenericMutationResponse> => {
    const res: any = await api.put(`/orders/admin/manage/${orderId}`, { status });
    return res?.data ?? res;
  },
  deleteOrder: async (orderId: string): Promise<GenericMutationResponse> => {
    const res: any = await api.delete(`/orders/admin/manage/${orderId}`);
    return res?.data ?? res;
  },
  getAllUsers: async (): Promise<AllUsersResponse> => {
    const res: any = await api.get("/users/admin/users");
    return res?.data ?? res;
  },
  getSingleUser: async (userId: string): Promise<any> => {
    const res: any = await api.get(`/users/admin/user/${userId}`);
    return res?.data ?? res;
  },
  updateUserRole: async (userId: string, payload: UserUpdatePayload): Promise<GenericMutationResponse> => {
    const res: any = await api.put(`/users/admin/user/${userId}`, payload);
    return res?.data ?? res;
  },
  deleteUser: async (userId: string): Promise<GenericMutationResponse> => {
    const res: any = await api.delete(`/users/admin/user/${userId}`);
    return res?.data ?? res;
  },
  getAllNurseryUsers: async (): Promise<AllNurseriesResponse> => {
    const res: any = await api.get("/users/admin/nursery-users");
    return res?.data ?? res;
  },
  getNurseryApplications: async (): Promise<NurseryApplicationsResponse> => {
    const res: any = await api.get("/nursery-profile/admin/applications");
    return res?.data ?? res;
  },
  reviewNurseryApplication: async (applicationId: string, payload: NurseryReviewPayload): Promise<GenericMutationResponse> => {
    const res: any = await api.put(`/nursery-profile/admin/application/review/${applicationId}`, payload);
    return res?.data ?? res;
  },

  /**
   * 🌟 FIX: सुनिश्चित करें कि रूट आपके बैकएंड आर्किटेक्चर से पूरी तरह मैच करता हो।
   * अगर बैकएंड का एंडपॉइंट /nursery-profile/admin/toggle-status/:id है, तो हमने इसे यहाँ ठीक कर दिया है।
   */
  toggleNurseryStatus: async (
    profileId: string,
    payload: ToggleNurseryStatusPayload
  ): Promise<ToggleNurseryStatusResponse> => {
    // 1. अगर आपका बैकएंड PUT एक्सेप्ट करता है:
    const res: any = await api.put(`/nursery-profile/admin/nursery/toggle-status/${profileId}`, payload);
    return res?.data ?? res;
  },
  // 🛡️ [ADMIN] नर्सरी के पूरे प्रोफाइल और अपलोडेड डॉक्यूमेंट्स देखना
  getNurseryVerificationDetail: async (nurseryId: string): Promise<any> => {
    const res: any = await api.get(`/admin/nurseries/${nurseryId}`);
    return res?.data ?? res;
  },

  // 🛡️ [ADMIN] नर्सरी के डॉक्यूमेंट्स और ओवरऑल स्टेटस को अप्रूव/रिजेक्ट करना
  verifyNurseryDocuments: async (nurseryId: string, payload: any): Promise<any> => {
    const res: any = await api.patch(`/admin/nurseries/${nurseryId}/verify-documents`, payload);
    return res?.data ?? res;
  },

  getNewsletterSubscribers: async (): Promise<NewsletterSubscribersResponse> => {
    const res: any = await api.get("/newsletter/admin/subscribers");
    return res?.data ?? res;
  },

  /**
   * 🗺️ [ADMIN] Manage nursery service pincodes (add / remove / set)
   */
  managePincodes: async (
    nurseryId: string,
    payload: { action: "add" | "remove" | "set"; pincode?: string; pincodes?: string[] }
  ): Promise<{ success: boolean; message: string; deliveryPincodes: string[] }> => {
    const res: any = await api.patch(`/admin/nurseries/${nurseryId}/pincodes`, payload);
    return res?.data ?? res;
  },
};