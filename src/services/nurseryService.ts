import { api } from "@/config/api";

// 📝 Strict Interface Definitions to remove 'any'
interface NurseryInventoryResponse {
  success: boolean;
  count: number;
  plants?: any[];
  pots?: any[];
  accessories?: any[];
}

interface GenericMutationResponse {
  success: boolean;
  message: string;
  plant?: any;
  pot?: any;
  accessory?: any;
}

// Payloads structure for status toggle pipeline
interface UpdateStatusPayload {
  isActive: boolean;
}

export const nurseryService = {
  // ======================================================================
  // 🌿 1. BOTANICAL CORE PIPELINES (PLANTS)
  // ======================================================================
  getMyPlants: async (): Promise<NurseryInventoryResponse> => {
    return await api.get("/plants/admin/my-plants");
  },

  createNewPlant: async (formData: FormData): Promise<GenericMutationResponse> => {
    return await api.post("/plants/admin/plant/new", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updatePlantAsset: async (plantId: string, formData: FormData): Promise<GenericMutationResponse> => {
    return await api.put(`/plants/admin/plant/${plantId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deletePlantAsset: async (plantId: string): Promise<GenericMutationResponse> => {
    return await api.delete(`/plants/admin/plant/${plantId}`);
  },

  // ✨ NEWLY ADDED: Active / Inactive Status Toggle for Plants
  updatePlantStatus: async (plantId: string, payload: UpdateStatusPayload): Promise<GenericMutationResponse> => {
    return await api.put(`/plants/admin/plant/toggle/${plantId}`, payload);
  },

  // ======================================================================
  // 🏺 2. POTS & PLANTERS CORE PIPELINES
  // ======================================================================
  getMyPots: async (): Promise<NurseryInventoryResponse> => {
    return await api.get("/pots/admin/my-pots");
  },

  createNewPot: async (formData: FormData): Promise<GenericMutationResponse> => {
    return await api.post("/pots/admin/pot/new", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updatePotAsset: async (potId: string, formData: FormData): Promise<GenericMutationResponse> => {
    return await api.put(`/pots/admin/pot/${potId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deletePotAsset: async (potId: string): Promise<GenericMutationResponse> => {
    return await api.delete(`/pots/admin/pot/${potId}`);
  },

  // ✨ NEWLY ADDED: Active / Inactive Status Toggle for Pots
  updatePotStatus: async (potId: string, payload: UpdateStatusPayload): Promise<GenericMutationResponse> => {
    return await api.put(`/pots/admin/pot/toggle/${potId}`, payload);
  },

  // ======================================================================
  // 🛠️ 3. GARDENING ACCESSORIES & TOOLS CORE PIPELINES
  // ======================================================================
  getMyAccessories: async (): Promise<NurseryInventoryResponse> => {
    return await api.get("/accessories/admin/my-accessories");
  },

  createNewAccessory: async (formData: FormData): Promise<GenericMutationResponse> => {
    return await api.post("/accessories/admin/accessory/new", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateAccessoryAsset: async (accessoryId: string, formData: FormData): Promise<GenericMutationResponse> => {
    return await api.put(`/accessories/admin/accessory/${accessoryId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteAccessoryAsset: async (accessoryId: string): Promise<GenericMutationResponse> => {
    return await api.delete(`/accessories/admin/accessory/${accessoryId}`);
  },

  // ✨ NEWLY ADDED: Active / Inactive Status Toggle for Accessories
  updateAccessoryStatus: async (accessoryId: string, payload: UpdateStatusPayload): Promise<GenericMutationResponse> => {
    return await api.put(`/accessories/admin/accessory/toggle/${accessoryId}`, payload);
  },
};