import { api } from "@/config/api";

// ─── Canonical Categories ────────────────────────────────────────────────────
export const CANONICAL_CATEGORIES = [
  "Plants",
  "Pots",
  "Accessories",
  "Gardening Tools",
  "Plant Care",
  "Seeds & Bulbs",
  "Plant Stands",
  "Artificial & Dried Plants",
] as const;

export type CanonicalCategory = (typeof CANONICAL_CATEGORIES)[number];

// ─── Response Types ──────────────────────────────────────────────────────────
export interface ICategoryCommission {
  _id: string;
  category: string;
  itemModel: string;
  commissionPercentage: number;
  description?: string;
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface INurseryCategoryCommissionItem {
  category: string;
  /** Global platform rate for this category — may be missing in some API payloads */
  globalRate?: number;
  /** Nursery-specific override rate — undefined means "no override set" */
  nurseryCustomRate?: number;
  /** Resolved effective rate — may be missing, fall back to globalRate ?? 10 */
  effectiveRate?: number;
  isOverridden?: boolean;
  source?: "nursery_override" | "global_category" | "system_default";
}

/** Fully-normalized row used internally by the Commission card — all fields guaranteed */
export interface NormalizedCommissionRow {
  category: string;
  globalRate: number;        // always a number, defaulted to 10
  nurseryCustomRate?: number; // undefined = no override
  effectiveRate: number;     // always a number
  isOverridden: boolean;
  source: "nursery_override" | "global_category" | "system_default";
}

export interface INurseryCommissionResponse {
  success: boolean;
  nurseryId: string;
  businessName?: string;
  defaultNurseryCommission?: number;
  commissionOverrides?: { category: string; customCommissionPercentage: number }[];
  effectiveRates?: INurseryCategoryCommissionItem[];
  categories?: INurseryCategoryCommissionItem[];
  message?: string;
}

export interface CategoryCommissionsResponse {
  success: boolean;
  message?: string;
  count: number;
  data: ICategoryCommission[];
  commissions: ICategoryCommission[];
}

export interface SingleCommissionResponse {
  success: boolean;
  message?: string;
  data: ICategoryCommission;
  commission: ICategoryCommission;
}

export interface CreateCategoryCommissionPayload {
  category: string;
  itemModel: string;
  commissionPercentage: number;
  description?: string;
}

export interface UpdateCategoryCommissionPayload {
  commissionPercentage?: number;
  description?: string;
}

export interface BulkCommissionUpdateItem {
  id?: string;
  _id?: string;
  category?: string;
  itemModel?: string;
  commissionPercentage: number;
  description?: string;
}

export interface UpdateNurseryCommissionPayload {
  defaultNurseryCommission?: number | null;
  commissionOverrides?: { category: string; customCommissionPercentage: number }[];
}

// ─── Service ─────────────────────────────────────────────────────────────────
export const commissionService = {
  /**
   * Fetch all global category commissions
   */
  getAllCommissions: async (): Promise<CategoryCommissionsResponse> => {
    const res: any = await api.get("/commissions");
    const list: ICategoryCommission[] =
      res?.commissions || res?.data || (Array.isArray(res) ? res : []);
    return {
      success: res?.success ?? true,
      message: res?.message,
      count: list.length,
      data: list,
      commissions: list,
    };
  },

  /**
   * Create a new global category commission
   */
  createCategoryCommission: async (
    payload: CreateCategoryCommissionPayload
  ): Promise<SingleCommissionResponse> => {
    const res: any = await api.post("/commissions", payload);
    const item = res?.commission || res?.data || res;
    return {
      success: res?.success ?? true,
      message: res?.message,
      data: item,
      commission: item,
    };
  },

  /**
   * Update a single category commission by ID
   */
  updateCategoryCommission: async (
    id: string,
    payload: UpdateCategoryCommissionPayload
  ): Promise<SingleCommissionResponse> => {
    const res: any = await api.patch(`/commissions/${id}`, payload);
    const item = res?.commission || res?.data || res;
    return {
      success: res?.success ?? true,
      message: res?.message,
      data: item,
      commission: item,
    };
  },

  /**
   * Bulk update multiple category commissions in one call
   */
  bulkUpdateCommissions: async (
    commissions: BulkCommissionUpdateItem[]
  ): Promise<CategoryCommissionsResponse> => {
    const res: any = await api.patch("/commissions", { commissions });
    const list: ICategoryCommission[] =
      res?.commissions || res?.data || (Array.isArray(res) ? res : []);
    return {
      success: res?.success ?? true,
      message: res?.message,
      count: list.length,
      data: list,
      commissions: list,
    };
  },

  /**
   * Reset all commissions to system defaults
   */
  resetDefaultCommissions: async (): Promise<CategoryCommissionsResponse> => {
    let res: any;
    try {
      res = await api.post("/commissions/reset");
    } catch {
      res = await api.post("/commissions/reset-defaults");
    }
    const list: ICategoryCommission[] =
      res?.commissions || res?.data || (Array.isArray(res) ? res : []);
    return {
      success: res?.success ?? true,
      message: res?.message,
      count: list.length,
      data: list,
      commissions: list,
    };
  },

  /**
   * Delete a category commission by ID
   */
  deleteCategoryCommission: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const res: any = await api.delete(`/commissions/${id}`);
    return res?.data ?? res;
  },

  // ─── Nursery-Specific Override Endpoints ─────────────────────────────────

  /**
   * Get effective commission rates for a specific nursery.
   * Normalizes the API response so all numeric fields are guaranteed non-undefined.
   */
  getNurseryCommissionRates: async (
    nurseryId: string
  ): Promise<INurseryCommissionResponse> => {
    const res: any = await api.get(
      `/nursery-profile/admin/nurseries/${nurseryId}/commission`
    );

    // Normalize raw categories/effectiveRates array — handle any API shape
    const rawList: any[] =
      res?.effectiveRates ||
      res?.categories ||
      res?.commissionRates ||
      [];

    const SYSTEM_DEFAULT_RATES: Record<string, number> = {
      Plants: 10,
      Pots: 12,
      Accessories: 15,
      "Gardening Tools": 15,
      "Plant Care": 12,
      "Seeds & Bulbs": 5,
      "Plant Stands": 15,
      "Artificial & Dried Plants": 15,
    };

    const normalized: INurseryCategoryCommissionItem[] = rawList.map((item: any) => {
      const cat: string = item?.category || "General";
      const globalRate: number =
        typeof item?.globalRate === "number"
          ? item.globalRate
          : typeof item?.globalCommissionRate === "number"
          ? item.globalCommissionRate
          : (SYSTEM_DEFAULT_RATES[cat] ?? 10);

      const nurseryCustomRate: number | undefined =
        typeof item?.nurseryCustomRate === "number"
          ? item.nurseryCustomRate
          : typeof item?.customCommissionPercentage === "number"
          ? item.customCommissionPercentage
          : typeof item?.customRate === "number"
          ? item.customRate
          : undefined;

      const effectiveRate: number =
        typeof item?.effectiveRate === "number"
          ? item.effectiveRate
          : nurseryCustomRate ?? globalRate;

      const isOverridden: boolean =
        typeof item?.isOverridden === "boolean"
          ? item.isOverridden
          : nurseryCustomRate !== undefined;

      const source: "nursery_override" | "global_category" | "system_default" =
        item?.source === "nursery_override" || item?.source === "global_category" || item?.source === "system_default"
          ? item.source
          : isOverridden
          ? "nursery_override"
          : "global_category";

      return { category: cat, globalRate, nurseryCustomRate, effectiveRate, isOverridden, source };
    });

    return {
      success: res?.success ?? true,
      nurseryId,
      businessName: res?.businessName,
      defaultNurseryCommission:
        typeof res?.defaultNurseryCommission === "number"
          ? res.defaultNurseryCommission
          : undefined,
      commissionOverrides: res?.commissionOverrides,
      effectiveRates: normalized,
      categories: normalized,
      message: res?.message,
    };
  },

  /**
   * Update nursery-specific commission overrides
   */
  updateNurseryCommission: async (
    nurseryId: string,
    payload: UpdateNurseryCommissionPayload
  ): Promise<INurseryCommissionResponse> => {
    const res: any = await api.patch(
      `/nursery-profile/admin/nurseries/${nurseryId}/commission`,
      payload
    );
    return {
      success: res?.success ?? true,
      nurseryId,
      defaultNurseryCommission: res?.defaultNurseryCommission,
      commissionOverrides: res?.commissionOverrides,
      effectiveRates: res?.effectiveRates || res?.categories,
      categories: res?.effectiveRates || res?.categories,
      message: res?.message,
    };
  },
};
