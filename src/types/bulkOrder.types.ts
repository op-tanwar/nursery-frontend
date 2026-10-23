export type BulkOrderProductType =
  | "plants"
  | "pots"
  | "fertilizers"
  | "services"
  | "accessories"
  | "mixed";

export type BulkOrderStatus =
  | "Pending"
  | "In Discussion"
  | "Quoted"
  | "Fulfilled"
  | "Cancelled";

export interface BulkOrderInquiry {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  city: string;
  state: string;
  productType: BulkOrderProductType;
  estimatedQuantity: number;
  message?: string;
  status: BulkOrderStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBulkOrderPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  city: string;
  state: string;
  productType: BulkOrderProductType;
  estimatedQuantity: number;
  message?: string;
}

export interface BulkOrdersResponse {
  success: boolean;
  count: number;
  totalBulkOrders: number;
  totalPages: number;
  currentPage: number;
  stats?: {
    total: number;
    pending: number;
    inDiscussion: number;
    quoted: number;
    fulfilled: number;
    cancelled: number;
  };
  bulkOrders: BulkOrderInquiry[];
}

export interface BulkOrderSingleResponse {
  success: boolean;
  message?: string;
  bulkOrder: BulkOrderInquiry;
}
