// Strict payload structure for handling images (Cloudinary node format)
import { ICloudinaryImage } from "./index";
// Review schema configuration matrix for Gardening Tools
export interface IGardeningToolReview {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Main Gardening Tool Document entity layout structure
export interface IGardeningTool {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  discountPrice?: number;
  description: string;
  descriptionOption?: {
    short: string;
    points: string[];
  };
  features?: string[];
  material?: string;
  handleMaterial?: string;
  warrantyMonths?: number;
  ratings: number;
  coverImage: ICloudinaryImage;
  images: ICloudinaryImage[];
  category: string;
  stock: number;
  numOfReviews: number;
  reviews: IGardeningToolReview[];
  nursery:
  | {
    _id: string;
    name: string;
    location?: string;
  }
  | string;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
}

// API Server Wrapper Responses Matrix
export interface AllGardeningToolsResponse {
  success: boolean;
  totalGardeningTools: number;
  filteredCount: number;
  resultsPerPage: number;
  gardeningTools: IGardeningTool[];
  count: number;
}

export interface GardeningToolReviewsResponse {
  success: boolean;
  reviews: IGardeningToolReview[];
}

export interface GenericGardeningToolMutationResponse {
  success: boolean;
  message: string;
}