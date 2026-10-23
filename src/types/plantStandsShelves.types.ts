import { ICloudinaryImage } from "./index";

export interface IPlantStandsShelvesReview {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IPlantStandsShelves {
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
  material?: string;
  dimensions?: { height?: string; width?: string; length?: string };
  tierCount?: number;
  maxLoadCapacity?: number;
  ratings: number;
  coverImage: ICloudinaryImage;
  images: ICloudinaryImage[];
  category: string;
  stock: number;
  numOfReviews: number;
  reviews: IPlantStandsShelvesReview[];
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

export interface AllPlantStandsShelvesResponse {
  success: boolean;
  totalPlantStandsShelves: number;
  filteredCount: number;
  resultsPerPage: number;
  plantStandsShelves: IPlantStandsShelves[];
  count: number;
}

export interface PlantStandsShelvesReviewsResponse {
  success: boolean;
  reviews: IPlantStandsShelvesReview[];
}

export interface GenericPlantStandsShelvesMutationResponse {
  success: boolean;
  message: string;
}