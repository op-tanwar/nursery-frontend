export * from "./claim.types";

import {
  ClaimType,
  ClaimStatus,
  IClaimRequest,
  CreateClaimPayload,
  ClaimResponse,
  ClaimListResponse,
} from "./claim.types";

export type RequestType = ClaimType;
export type RequestStatus = ClaimStatus;
export type IReturnReplacementRequest = IClaimRequest;
export type CreateReturnReplacementPayload = CreateClaimPayload;
export type ReturnReplacementResponse = ClaimResponse;
export type AllReturnReplacementsResponse = ClaimListResponse;
