export type RequestType = "Return" | "Replacement";
export type RequestStatus = "Pending" | "Approved" | "Rejected" | "Completed";

export interface IReturnReplacementRequest {
  _id: string;
  orderId: any;
  userId: any;
  nurseryId: any;
  itemId: string;
  productName: string;
  productImage: string;
  requestType: RequestType;
  reason: string;
  description: string;
  proofImages: string[];
  status: RequestStatus;
  adminNotes?: string;
  resolvedAt?: string;
  isProcessed?: boolean;
  refundDetails?: {
    refundId?: string;
    refundStatus?: "PENDING" | "PROCESSED" | "FAILED" | "PENDING_MANUAL_REVIEW";
    refundAmount?: number;
    refundedAt?: string;
    failureReason?: string;
  };
  replacementOrderId?: any;
  inventoryAction?: string;
  timeline?: Array<{
    status: string;
    action: string;
    actor?: any;
    actorRole?: string;
    notes?: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReturnReplacementPayload {
  orderId: string;
  itemId: string;
  requestType: RequestType;
  reason: string;
  description?: string;
  proofImages?: string[];
  productName?: string;
  productImage?: string;
}

export interface ReturnReplacementResponse {
  success: boolean;
  message: string;
  request?: IReturnReplacementRequest;
  returnRequest?: IReturnReplacementRequest;
}

export interface AllReturnReplacementsResponse {
  success: boolean;
  count: number;
  requests: IReturnReplacementRequest[];
}
