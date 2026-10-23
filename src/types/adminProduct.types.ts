import { ICloudinaryImage } from "./index"; // Aapke folder structure ke hisab se

export type AdminResourceType =
  | "plant"
  | "pot"
  | "accessory"
  | "gardeningTool"
  | "plantCare"
  | "seedsBulbs"
  | "plantStandsShelves"
  | "artificial";

export interface IAdminProductReview {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IAdminNurseryPopulated {
  _id: string;
  name: string;
  email?: string;
  location?: string;
}

export interface IAdminProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  ratings: number;
  numOfReviews: number;
  isActive: boolean;
  coverImage: ICloudinaryImage;
  images: ICloudinaryImage[];
  nursery: IAdminNurseryPopulated; // Admin ke liye complete nursery meta data populated hai
  createdAt: string;
  // Dynamic fields handle karne ke liye (e.g., benefits, careInstructions, material, specifications)
  [key: string]: any;
}

// Backend dynamic plural key structure return karta hai (e.g., "plants", "pots", "gardeningTools")
export interface AdminAllProductsResponse {
  success: boolean;
  totalCount: number;
  filteredCount: number;
  resultsPerPage: number;
  count: number;
  [resourcePluralKey: string]: any; // Handles dynamic dynamic response payloads safely
}

export interface AdminToggleStatusResponse {
  success: boolean;
  message: string;
  isActive: boolean;
}

export interface GenericAdminMutationResponse {
  success: boolean;
  message: string;
}
