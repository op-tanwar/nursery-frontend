import { ICloudinaryImage } from "./index";

export interface IArtificialReview {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IArtificialSpecifications {
  brand?: string;
  material?: string;
  height?: string;
  color?: string;
  washable?: boolean;
  potIncluded?: boolean;
}

export interface IArtificial {
  _id: string;
  name: string;
  slug: string;
  description: string;
  descriptionOption?: {
    short: string;
    points: string[];
  };
  specifications: IArtificialSpecifications;
  price: number;
  discountPrice?: number;
  category: string;
  ratings: number;
  coverImage: ICloudinaryImage;
  images: ICloudinaryImage[];
  stock: number;
  numOfReviews: number;
  reviews: IArtificialReview[];
  nursery:
  | {
    _id: string;
    name: string;
    location?: string;
  }
  | string;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
}

export interface AllArtificialsResponse {
  success: boolean;
  totalArtificials: number;
  filteredCount: number;
  resultsPerPage: number;
  artificials: IArtificial[];
  count: number;
}

export interface ArtificialReviewsResponse {
  success: boolean;
  reviews: IArtificialReview[];
}

export interface GenericArtificialMutationResponse {
  success: boolean;
  message: string;
}