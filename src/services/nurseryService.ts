import { api } from "@/config/api";

interface NurseryInventoryResponse {
  success: boolean;
  count: number;
  products?: any[];
  plants?: any[];
  pots?: any[];
  accessories?: any[];
  gardeningTools?: any[];
  plantCare?: any[];
  seedsBulbs?: any[];
  plantStandsShelves?: any[];
  artificials?: any[];
}

interface GenericMutationResponse {
  success: boolean;
  message: string;
  product?: any;
  plant?: any;
  pot?: any;
  accessory?: any;
}

interface UpdateStatusPayload {
  isActive: boolean;
}

export const nurseryService = {
  // ======================================================================
  // 🌟 UNIFIED CATALOG CORE PIPELINES
  // ======================================================================
  getMyProducts: async (category?: string): Promise<NurseryInventoryResponse> => {
    const url = category
      ? `/products/vendor/my-products?category=${category}`
      : "/products/vendor/my-products";
    const res: any = await api.get(url);
    return res?.data ?? res;
  },

  createProduct: async (formData: FormData): Promise<GenericMutationResponse> => {
    const res: any = await api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data ?? res;
  },

  updateProduct: async (
    productId: string,
    formData: FormData
  ): Promise<GenericMutationResponse> => {
    const res: any = await api.put(`/products/${productId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data ?? res;
  },

  deleteProduct: async (productId: string): Promise<GenericMutationResponse> => {
    const res: any = await api.delete(`/products/${productId}`);
    return res?.data ?? res;
  },

  toggleProductStatus: async (
    productId: string,
    _payload?: UpdateStatusPayload
  ): Promise<GenericMutationResponse> => {
    const res: any = await api.put(`/products/${productId}/toggle-status`);
    return res?.data ?? res;
  },

  getProductDetails: async (productId: string): Promise<any> => {
    const res: any = await api.get(`/products/${productId}`);
    return res?.data ?? res;
  },

  // ======================================================================
  // 🌿 1. PLANTS PIPELINES
  // ======================================================================
  getMyPlants: async (): Promise<NurseryInventoryResponse> => {
    return nurseryService.getMyProducts("plants");
  },

  createNewPlant: async (formData: FormData): Promise<GenericMutationResponse> => {
    if (!formData.has("category")) formData.append("category", "plants");
    return nurseryService.createProduct(formData);
  },

  updatePlantAsset: async (plantId: string, formData: FormData): Promise<GenericMutationResponse> => {
    return nurseryService.updateProduct(plantId, formData);
  },

  deletePlantAsset: async (plantId: string): Promise<GenericMutationResponse> => {
    return nurseryService.deleteProduct(plantId);
  },

  updatePlantStatus: async (plantId: string, payload?: UpdateStatusPayload): Promise<GenericMutationResponse> => {
    return nurseryService.toggleProductStatus(plantId, payload);
  },

  getPlantDetails: async (plantId: string): Promise<any> => {
    return nurseryService.getProductDetails(plantId);
  },

  // ======================================================================
  // 🏺 2. POTS & PLANTERS PIPELINES
  // ======================================================================
  getMyPots: async (): Promise<NurseryInventoryResponse> => {
    return nurseryService.getMyProducts("pots");
  },

  createNewPot: async (formData: FormData): Promise<GenericMutationResponse> => {
    if (!formData.has("category")) formData.append("category", "pots");
    return nurseryService.createProduct(formData);
  },

  updatePotAsset: async (potId: string, formData: FormData): Promise<GenericMutationResponse> => {
    return nurseryService.updateProduct(potId, formData);
  },

  deletePotAsset: async (potId: string): Promise<GenericMutationResponse> => {
    return nurseryService.deleteProduct(potId);
  },

  updatePotStatus: async (potId: string, payload?: UpdateStatusPayload): Promise<GenericMutationResponse> => {
    return nurseryService.toggleProductStatus(potId, payload);
  },

  getPotDetails: async (potId: string): Promise<any> => {
    return nurseryService.getProductDetails(potId);
  },

  // ======================================================================
  // 🛠️ 3. ACCESSORIES PIPELINES
  // ======================================================================
  getMyAccessories: async (): Promise<NurseryInventoryResponse> => {
    return nurseryService.getMyProducts("accessories");
  },

  createNewAccessory: async (formData: FormData): Promise<GenericMutationResponse> => {
    if (!formData.has("category")) formData.append("category", "accessories");
    return nurseryService.createProduct(formData);
  },

  updateAccessoryAsset: async (accessoryId: string, formData: FormData): Promise<GenericMutationResponse> => {
    return nurseryService.updateProduct(accessoryId, formData);
  },

  deleteAccessoryAsset: async (accessoryId: string): Promise<GenericMutationResponse> => {
    return nurseryService.deleteProduct(accessoryId);
  },

  updateAccessoryStatus: async (accessoryId: string, payload?: UpdateStatusPayload): Promise<GenericMutationResponse> => {
    return nurseryService.toggleProductStatus(accessoryId, payload);
  },

  getAccessoryDetails: async (accessoryId: string): Promise<any> => {
    return nurseryService.getProductDetails(accessoryId);
  },

  // ======================================================================
  // 🔧 4. GARDENING TOOLS PIPELINES
  // ======================================================================
  getMyGardeningTools: async (): Promise<NurseryInventoryResponse> => {
    return nurseryService.getMyProducts("gardening-tools");
  },

  createGardeningTool: async (formData: FormData): Promise<GenericMutationResponse> => {
    if (!formData.has("category")) formData.append("category", "gardening-tools");
    return nurseryService.createProduct(formData);
  },

  updateGardeningTool: async (id: string, formData: FormData): Promise<GenericMutationResponse> => {
    return nurseryService.updateProduct(id, formData);
  },

  deleteGardeningTool: async (id: string): Promise<GenericMutationResponse> => {
    return nurseryService.deleteProduct(id);
  },

  toggleGardeningToolStatus: async (id: string): Promise<GenericMutationResponse> => {
    return nurseryService.toggleProductStatus(id);
  },

  getGardeningToolDetails: async (id: string): Promise<any> => {
    return nurseryService.getProductDetails(id);
  },

  // ======================================================================
  // 🧪 5. PLANT CARE PIPELINES
  // ======================================================================
  getMyPlantCare: async (): Promise<NurseryInventoryResponse> => {
    return nurseryService.getMyProducts("plant-care");
  },

  createPlantCare: async (formData: FormData): Promise<GenericMutationResponse> => {
    if (!formData.has("category")) formData.append("category", "plant-care");
    return nurseryService.createProduct(formData);
  },

  updatePlantCare: async (id: string, formData: FormData): Promise<GenericMutationResponse> => {
    return nurseryService.updateProduct(id, formData);
  },

  deletePlantCare: async (id: string): Promise<GenericMutationResponse> => {
    return nurseryService.deleteProduct(id);
  },

  togglePlantCareStatus: async (id: string): Promise<GenericMutationResponse> => {
    return nurseryService.toggleProductStatus(id);
  },

  getPlantCareDetails: async (id: string): Promise<any> => {
    return nurseryService.getProductDetails(id);
  },

  // ======================================================================
  // 🌱 6. SEEDS & BULBS PIPELINES
  // ======================================================================
  getMySeedsBulbs: async (): Promise<NurseryInventoryResponse> => {
    return nurseryService.getMyProducts("seeds-bulbs");
  },

  createSeedsBulbs: async (formData: FormData): Promise<GenericMutationResponse> => {
    if (!formData.has("category")) formData.append("category", "seeds-bulbs");
    return nurseryService.createProduct(formData);
  },

  updateSeedsBulbs: async (id: string, formData: FormData): Promise<GenericMutationResponse> => {
    return nurseryService.updateProduct(id, formData);
  },

  deleteSeedsBulbs: async (id: string): Promise<GenericMutationResponse> => {
    return nurseryService.deleteProduct(id);
  },

  toggleSeedsBulbsStatus: async (id: string): Promise<GenericMutationResponse> => {
    return nurseryService.toggleProductStatus(id);
  },

  getSeedsBulbsDetails: async (id: string): Promise<any> => {
    return nurseryService.getProductDetails(id);
  },

  // ======================================================================
  // 🪜 7. PLANT STANDS & SHELVES PIPELINES
  // ======================================================================
  getMyPlantStandsShelves: async (): Promise<NurseryInventoryResponse> => {
    return nurseryService.getMyProducts("stands-shelves");
  },

  createPlantStandsShelves: async (formData: FormData): Promise<GenericMutationResponse> => {
    if (!formData.has("category")) formData.append("category", "stands-shelves");
    return nurseryService.createProduct(formData);
  },

  updatePlantStandsShelves: async (id: string, formData: FormData): Promise<GenericMutationResponse> => {
    return nurseryService.updateProduct(id, formData);
  },

  deletePlantStandsShelves: async (id: string): Promise<GenericMutationResponse> => {
    return nurseryService.deleteProduct(id);
  },

  togglePlantStandsShelvesStatus: async (id: string): Promise<GenericMutationResponse> => {
    return nurseryService.toggleProductStatus(id);
  },

  getPlantStandsShelvesDetails: async (id: string): Promise<any> => {
    return nurseryService.getProductDetails(id);
  },

  // ======================================================================
  // 🥀 8. ARTIFICIAL & DRIED PLANTS PIPELINES
  // ======================================================================
  getMyArtificials: async (): Promise<NurseryInventoryResponse> => {
    return nurseryService.getMyProducts("artificial-dried");
  },

  createArtificial: async (formData: FormData): Promise<GenericMutationResponse> => {
    if (!formData.has("category")) formData.append("category", "artificial-dried");
    return nurseryService.createProduct(formData);
  },

  updateArtificial: async (id: string, formData: FormData): Promise<GenericMutationResponse> => {
    return nurseryService.updateProduct(id, formData);
  },

  deleteArtificial: async (id: string): Promise<GenericMutationResponse> => {
    return nurseryService.deleteProduct(id);
  },

  toggleArtificialStatus: async (id: string): Promise<GenericMutationResponse> => {
    return nurseryService.toggleProductStatus(id);
  },

  getArtificialDetails: async (id: string): Promise<any> => {
    return nurseryService.getProductDetails(id);
  },
};

export default nurseryService;
