import { api } from "@/config/api";
import { IVendorPublicResponse, IVendorAdminDetailResponse } from "@/types/index";

export const vendorService = {
  // 🏪 Public: Get vendor profile & catalog items by slug or ID
  getPublicVendorBySlug: async (slug: string): Promise<IVendorPublicResponse> => {
    const res: any = await api.get(`/nursery-profile/vendor/${slug}`);
    return res?.data ?? res;
  },

  // 🌿 Public: Get catalog items specifically mapped to vendor
  getVendorProducts: async (slugOrId: string): Promise<{ success: boolean; count: number; vendor: any; products: any[] }> => {
    const res: any = await api.get(`/nursery-profile/vendor/${slugOrId}/products`);
    return res?.data ?? res;
  },

  // 🛡️ Admin: Get full vendor details by ID for Admin Panel
  getAdminVendorDetail: async (id: string): Promise<IVendorAdminDetailResponse> => {
    const res: any = await api.get(`/nursery-profile/admin/vendor/${id}`);
    return res?.data ?? res;
  },
};
