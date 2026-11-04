import { api } from "@/config/api";
import {
  AdminAllProductsResponse,
  AdminResourceType,
  AdminToggleStatusResponse,
  GenericAdminMutationResponse
} from "@/types/adminProduct.types";

type ResourceRouteConfig = {
  base: string;
  listPath: string;
  singularPath: string;
  responseKey: string;
  shopType: string;
};

const RESOURCE_ROUTES: Record<AdminResourceType, ResourceRouteConfig> = {
  plant: {
    base: "/products",
    listPath: "plants",
    singularPath: "plant",
    responseKey: "plants",
    shopType: "plants",
  },
  pot: {
    base: "/products",
    listPath: "pots",
    singularPath: "pot",
    responseKey: "pots",
    shopType: "pots",
  },
  accessory: {
    base: "/products",
    listPath: "accessories",
    singularPath: "accessory",
    responseKey: "accessories",
    shopType: "accessories",
  },
  gardeningTool: {
    base: "/products",
    listPath: "gardening-tools",
    singularPath: "gardeningTool",
    responseKey: "gardeningTools",
    shopType: "gardening-tools",
  },
  plantCare: {
    base: "/products",
    listPath: "plant-care",
    singularPath: "plantCare",
    responseKey: "plantCare",
    shopType: "plant-care",
  },
  seedsBulbs: {
    base: "/products",
    listPath: "seeds-bulbs",
    singularPath: "seedsBulbs",
    responseKey: "seedsBulbs",
    shopType: "seeds-bulbs",
  },
  plantStandsShelves: {
    base: "/products",
    listPath: "stands-shelves",
    singularPath: "plantStandsShelves",
    responseKey: "plantStandsShelves",
    shopType: "stands-shelves",
  },
  artificial: {
    base: "/products",
    listPath: "artificial-dried",
    singularPath: "artificial",
    responseKey: "artificials",
    shopType: "artificial-dried",
  },
};

export const getAdminResourceConfig = (type: AdminResourceType): ResourceRouteConfig =>
  RESOURCE_ROUTES[type];

export const adminProductService = {
  // 🌟 Fetch all products across all nurseries for Admin
  getAdminAllProducts: async (
    type: AdminResourceType,
    queryParams?: string
  ): Promise<AdminAllProductsResponse> => {
    const { shopType, responseKey } = RESOURCE_ROUTES[type];
    const categoryFilter = `category=${shopType}`;
    const url = queryParams
      ? `/products?${categoryFilter}&${queryParams}`
      : `/products?${categoryFilter}`;

    const res: any = await api.get(url);
    const data = res?.data ?? res;
    const items = data.products || [];

    return {
      success: true,
      [responseKey]: items,
      totalCount: data.totalCount || items.length,
      filteredCount: data.filteredCount || items.length,
      products: items,
    } as any;
  },

  // 🌟 Toggle Active/Inactive status of any product
  toggleProductStatus: async (
    _type: AdminResourceType,
    id: string
  ): Promise<AdminToggleStatusResponse> => {
    const res: any = await api.put(`/products/${id}/toggle-status`);
    return res?.data ?? res;
  },

  // 🌟 Administrative force delete product asset pipeline
  deleteProductForce: async (
    _type: AdminResourceType,
    id: string
  ): Promise<GenericAdminMutationResponse> => {
    const res: any = await api.delete(`/products/${id}`);
    return res?.data ?? res;
  },
};

export default adminProductService;
