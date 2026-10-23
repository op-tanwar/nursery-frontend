import { ICloudinaryImage } from "./index";

export interface ISeedsBulbsReview {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ISeedsBulbs {
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
  sowingSeason?: string[];
  germinationTime?: string;
  quantityPerPack?: string;
  ratings: number;
  coverImage: ICloudinaryImage;
  images: ICloudinaryImage[];
  category: string;
  stock: number;
  numOfReviews: number;
  reviews: ISeedsBulbsReview[];
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

export interface AllSeedsBulbsResponse {
  success: boolean;
  totalSeedsBulbs: number;
  filteredCount: number;
  resultsPerPage: number;
  seedsBulbs: ISeedsBulbs[];
  count: number;
}

export interface SeedsBulbsReviewsResponse {
  success: boolean;
  reviews: ISeedsBulbsReview[];
}

export interface GenericSeedsBulbsMutationResponse {
  success: boolean;
  message: string;
}