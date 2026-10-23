import { ICloudinaryImage } from "./index";

export interface IPlantCareReview {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IPlantCare {
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
  howToUse?: string[];
  composition?: string;
  volumeOrWeight?: string;
  formType?: string;
  isOrganic?: boolean;
  ratings: number;
  coverImage: ICloudinaryImage;
  images: ICloudinaryImage[];
  category: string;
  stock: number;
  numOfReviews: number;
  reviews: IPlantCareReview[];
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

export interface AllPlantCareResponse {
  success: boolean;
  totalPlantCare: number;
  filteredCount: number;
  resultsPerPage: number;
  plantCare: IPlantCare[];
  count: number;
}

export interface PlantCareReviewsResponse {
  success: boolean;
  reviews: IPlantCareReview[];
}

export interface GenericPlantCareMutationResponse {
  success: boolean;
  message: string;
}