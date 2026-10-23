import { api } from "@/config/api";

export interface ICategoryTax {
  _id: string;
  category: string;
  itemModel: string;
  taxPercentage: number;
  isTaxInclusive: boolean;
  description?: string;
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryTaxesResponse {
  success: boolean;
  message?: string;
  count: number;
  data: ICategoryTax[];
  taxes: ICategoryTax[];
}

export interface SingleTaxResponse {
  success: boolean;
  message?: string;
  data: ICategoryTax;
  tax: ICategoryTax;
}

export interface CreateCategoryTaxPayload {
  category: string;
  itemModel: string;
  taxPercentage: number;
  isTaxInclusive?: boolean;
  description?: string;
}

export interface UpdateCategoryTaxPayload {
  taxPercentage?: number;
  isTaxInclusive?: boolean;
  description?: string;
}

export interface BulkTaxUpdateItem {
  id?: string;
  _id?: string;
  category?: string;
  itemModel?: string;
  taxPercentage: number;
  isTaxInclusive?: boolean;
  description?: string;
}

export const taxService = {
  /**
   * Fetch all category taxes (Public or Admin)
   * Robust against polymorphic backend response structures (taxes, data, or array)
   */
  getAllTaxes: async (): Promise<CategoryTaxesResponse> => {
    const res: any = await api.get("/taxes");
    const extractedList: ICategoryTax[] =
      res?.taxes || res?.data || (Array.isArray(res) ? res : []);

    return {
      success: res?.success ?? true,
      count: extractedList.length,
      data: extractedList,
      taxes: extractedList,
    };
  },

  /**
   * Create a new category tax slab (Admin only)
   */
  createCategoryTax: async (
    payload: CreateCategoryTaxPayload
  ): Promise<SingleTaxResponse> => {
    const res: any = await api.post("/taxes", payload);
    const item = res?.tax || res?.data || res;
    return {
      success: res?.success ?? true,
      message: res?.message,
      data: item,
      tax: item,
    };
  },

  /**
   * Update a specific category tax rate by ID (Admin only)
   */
  updateCategoryTax: async (
    id: string,
    payload: UpdateCategoryTaxPayload
  ): Promise<SingleTaxResponse> => {
    const res: any = await api.patch(`/taxes/${id}`, payload);
    const item = res?.tax || res?.data || res;
    return {
      success: res?.success ?? true,
      message: res?.message,
      data: item,
      tax: item,
    };
  },

  /**
   * Bulk update multiple category tax rates in one call (Admin only)
   */
  bulkUpdateCategoryTaxes: async (
    taxes: BulkTaxUpdateItem[]
  ): Promise<CategoryTaxesResponse> => {
    const res: any = await api.patch("/taxes", { taxes });
    const extractedList: ICategoryTax[] =
      res?.taxes || res?.data || (Array.isArray(res) ? res : []);
    return {
      success: res?.success ?? true,
      message: res?.message,
      count: extractedList.length,
      data: extractedList,
      taxes: extractedList,
    };
  },

  /**
   * Reset all tax rates to official GST defaults (Admin only)
   */
  resetDefaultTaxes: async (): Promise<CategoryTaxesResponse> => {
    let res: any;
    try {
      res = await api.post("/taxes/reset");
    } catch {
      res = await api.post("/taxes/reset/defaults");
    }

    const extractedList: ICategoryTax[] =
      res?.taxes || res?.data || (Array.isArray(res) ? res : []);

    return {
      success: res?.success ?? true,
      message: res?.message,
      count: extractedList.length,
      data: extractedList,
      taxes: extractedList,
    };
  },

  /**
   * Delete a category tax slab by ID (Admin only)
   */
  deleteCategoryTax: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res: any = await api.delete(`/taxes/${id}`);
    return res?.data ?? res;
  },
};
