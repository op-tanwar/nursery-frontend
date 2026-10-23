import { ICloudinaryImage } from "./index";

export interface IPotReview {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface IPotDimensions {
  height: string;
  diameter: string;
}

export interface IPot {
  _id: string;
  name: string;
  slug: string;
  description: string;
  descriptionOption?: {
    short: string;
    points: string[];
  };
  material: string;
  color: string[];
  dimensions: IPotDimensions;
  shape?: string;
  hasDrainageHole?: boolean;
  isIndoorOutdoor?: string;
  includesSaucer?: boolean;
  price: number;
  discountPrice?: number;
  category: string;
  ratings: number;
  coverImage: ICloudinaryImage;
  images: ICloudinaryImage[];
  stock: number;
  numOfReviews: number;
  reviews: IPotReview[];
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

export interface AllPotsResponse {
  success: boolean;
  totalPots: number;
  filteredCount: number;
  resultsPerPage: number;
  pots: IPot[];
  count: number;
}

export interface PotReviewsResponse {
  success: boolean;
  reviews: IPotReview[];
}

export interface GenericPotMutationResponse {
  success: boolean;
  message: string;
}