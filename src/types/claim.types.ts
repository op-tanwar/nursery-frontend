export type ClaimType =
  | "RETURN"
  | "REPLACEMENT"
  | "DAMAGE_CLAIM"
  | "Return"
  | "Replacement"
  | "Damage Claim";

export type ClaimStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Completed";

export interface IClaimTimeline {
  status: string;
  action: string;
  actor?: any;
  actorRole?: string;
  notes?: string;
  timestamp: string | Date;
}

export interface IClaimRefundDetails {
  refundId?: string;
  refundStatus?: "NONE" | "PENDING" | "PROCESSED" | "FAILED" | "PENDING_MANUAL_REVIEW";
  refundAmount?: number;
  refundedAt?: string | Date;
  failureReason?: string;
}

export interface IClaimTrackingInfo {
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  dispatchedAt?: string | Date;
  deliveredAt?: string | Date;
}

export interface IClaimRequest {
  _id: string;
  orderId: any;
  itemId: string | any;
  userId: any;
  nurseryId: any;
  type: ClaimType;
  requestType: ClaimType;
  reason: string;
  description?: string;
  images?: string[];
  proofImages: string[];
  unboxingVideoUrl?: string;
  status: ClaimStatus;
  adminNotes?: string;
  adminComments?: string;
  refundStatus?: string;
  refundDetails?: IClaimRefundDetails;
  trackingInfo?: IClaimTrackingInfo;
  productName: string;
  productImage: string;
  productModel?: string;
  replacementOrderId?: any;
  inventoryAction?: string;
  isProcessed?: boolean;
  resolvedAt?: string | Date;
  timeline?: IClaimTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateClaimPayload {
  orderId: string;
  itemId: string;
  type?: ClaimType;
  requestType?: ClaimType;
  claimType?: ClaimType;
  reason: string;
  description?: string;
  proofImages?: string[];
  images?: string[];
  productName?: string;
  productImage?: string;
  productModel?: string;
  unboxingVideoUrl?: string;
}

export interface GetClaimsQuery {
  status?: string;
  type?: string;
  requestType?: string;
  orderId?: string;
  nurseryId?: string;
  page?: number;
  limit?: number;
}

export interface UpdateClaimStatusPayload {
  status: ClaimStatus | string;
  adminNotes?: string;
  adminComments?: string;
  refundAmount?: number;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface ClaimResponse {
  success: boolean;
  message?: string;
  claim?: IClaimRequest;
  request?: IClaimRequest;
  returnRequest?: IClaimRequest;
  claimStatus?: string;
}

export interface ClaimListResponse {
  success: boolean;
  count: number;
  total?: number;
  claims: IClaimRequest[];
  requests: IClaimRequest[];
}
