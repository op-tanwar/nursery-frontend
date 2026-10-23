import { ICloudinaryImage } from "./index";

export interface IAccessoryReview {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface IAccessorySpecifications {
  brand?: string;
  weight?: string;
  material?: string;
  capacity?: string;
  dimensions?: string;
}

export interface IAccessory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  descriptionOption?: {
    short: string;
    points: string[];
  };
  specifications: IAccessorySpecifications;
  price: number;
  discountPrice?: number;
  category: string;
  ratings: number;
  coverImage: ICloudinaryImage;
  images: ICloudinaryImage[];
  stock: number;
  numOfReviews: number;
  reviews: IAccessoryReview[];
  nursery: {
    _id: string;
    name: string;
    location?: string;
  } | string;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
}

export interface AllAccessoriesResponse {
  success: boolean;
  totalAccessories: number;
  filteredCount: number;
  resultsPerPage: number;
  accessories: IAccessory[];
  count: number;
}

export interface AccessoryReviewsResponse {
  success: boolean;
  reviews: IAccessoryReview[];
}

export interface GenericAccessoryMutationResponse {
  success: boolean;
  message: string;
}