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
    base: "/plants",
    listPath: "all-plants",
    singularPath: "plant",
    responseKey: "plants",
    shopType: "plants",
  },
  pot: {
    base: "/pots",
    listPath: "all-pots",
    singularPath: "pot",
    responseKey: "pots",
    shopType: "pots",
  },
  accessory: {
    base: "/accessories",
    listPath: "all-accessories",
    singularPath: "accessory",
    responseKey: "accessories",
    shopType: "accessories",
  },
  gardeningTool: {
    base: "/gardening-tools",
    listPath: "all-gardeningTools",
    singularPath: "gardeningTool",
    responseKey: "gardeningTools",
    shopType: "gardening-tools",
  },
  plantCare: {
    base: "/plant-care",
    listPath: "all-plantCare",
    singularPath: "plantCare",
    responseKey: "plantCare",
    shopType: "plant-care",
  },
  seedsBulbs: {
    base: "/seeds-bulbs",
    listPath: "all-seedsBulbs",
    singularPath: "seedsBulbs",
    responseKey: "seedsBulbs",
    shopType: "seeds-bulbs",
  },
  plantStandsShelves: {
    base: "/plant-stands-shelves",
    listPath: "all-plantStandsShelves",
    singularPath: "plantStandsShelves",
    responseKey: "plantStandsShelves",
    shopType: "plant-stands-shelves",
  },
  artificial: {
    base: "/artificial-dried-plants",
    listPath: "all-artificials",
    singularPath: "artificial",
    responseKey: "artificials",
    shopType: "artificial-dried-plants",
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
    const { base, listPath } = RESOURCE_ROUTES[type];

    const url = queryParams
      ? `${base}/admin/${listPath}?${queryParams}`
      : `${base}/admin/${listPath}`;

    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  // 🌟 Toggle Active/Inactive status of any product
  toggleProductStatus: async (
    type: AdminResourceType,
    id: string
  ): Promise<AdminToggleStatusResponse> => {
    const { base, singularPath } = RESOURCE_ROUTES[type];
    const res: any = await api.put(`${base}/admin/${singularPath}/toggle/${id}`);
    return res?.data ?? res;
  },

  // 🌟 Administrative force delete product asset pipeline
  deleteProductForce: async (
    type: AdminResourceType,
    id: string
  ): Promise<GenericAdminMutationResponse> => {
    const { base, singularPath } = RESOURCE_ROUTES[type];
    const res: any = await api.delete(`${base}/admin/${singularPath}/${id}`);
    return res?.data ?? res;
  },
};
