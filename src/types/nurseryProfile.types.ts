import { ICloudinaryImage } from "./index"; // आपकी बाकी फाइल्स के रेफरेंस के हिसाब से

export type TApprovalStatus = "Pending" | "Approved" | "Rejected";
export type TVerificationStatus = "Pending" | "Approved" | "Rejected";
export type TDocumentType =
  | "gstin"
  | "panCard"
  | "nurseryLicense"
  | "identityProof"
  | "bankDetails";

export interface INurseryDocumentItem {
  url?: string;
  publicId?: string;
  status: TVerificationStatus;
  rejectionReason?: string;
  uploadedAt?: string;
}

export interface INurseryDocuments {
  gstin?: INurseryDocumentItem;
  panCard?: INurseryDocumentItem;
  nurseryLicense?: INurseryDocumentItem;
  identityProof?: INurseryDocumentItem;
  bankDetails?: INurseryDocumentItem;
}

export interface IBusinessAddress {
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

export interface IBankDetails {
  accountHolderName: string;
  accountNumber: string; // यह बैकएंड से मास्केड (masked) होकर आएगी
  ifscCode: string;
  bankName: string;
}

export interface INurseryProfile {
  _id: string;
  nursery: {
    _id: string;
    name: string;
    email: string;
    avatar?: ICloudinaryImage;
  } | string;
  businessName: string;
  slug?: string;
  businessEmail: string;
  businessPhone: string;
  gstin?: string;
  panNumber?: string;
  businessAddress: IBusinessAddress;
  bankDetails: IBankDetails;
  documents?: INurseryDocuments;
  verificationStatus?: TVerificationStatus;
  adminReviewNotes?: string;
  documentsSubmittedAt?: string;
  approvalStatus: TApprovalStatus;
  deliveryPincodes: string[];
  /** Echoed from backend config when fetching own profile */
  serviceRadiusKm?: number;
  rejectionReason?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// API REQUEST PAYLOAD TYPES
// ==========================================
export interface INurseryApplyInput {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: Partial<IBusinessAddress> & {
    address: string;
    city: string;
    pinCode: string;
  };
  bankDetails?: Partial<IBankDetails>;
  gstin?: string;
  panNumber?: string;
}

export interface INurseryUpdateInput extends Partial<INurseryApplyInput> { }

export interface IReviewApplicationInput {
  status: "Approved" | "Rejected";
  rejectionReason?: string;
}

export interface IVerifyDocumentsInput {
  verificationStatus?: TVerificationStatus;
  adminReviewNotes?: string;
  verificationNotes?: string;
  documentType?: TDocumentType;
  status?: TVerificationStatus;
  rejectionReason?: string;
  documentUpdates?: Partial<Record<TDocumentType, { status: TVerificationStatus; rejectionReason?: string }>>;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================
export interface NurseryProfileResponse {
  success: boolean;
  profile: INurseryProfile;
  message?: string;
}

export interface NurseryActionResponse {
  success: boolean;
  message: string;
  profile: INurseryProfile;
}

export interface AllNurseryApplicationsResponse {
  success: boolean;
  count: number;
  applications: INurseryProfile[];
}

export interface NurseryDocumentsUploadResponse {
  success: boolean;
  message: string;
  documents: INurseryDocuments;
  verificationStatus: TVerificationStatus;
  documentsSubmittedAt: string;
  profile?: INurseryProfile;
}

export interface AdminNurseryVerificationResponse {
  success: boolean;
  nursery: INurseryProfile & {
    nurseryId: string;
    owner?: any;
    rating?: number;
    numOfReviews?: number;
    coverImage?: any;
  };
  message?: string;
}