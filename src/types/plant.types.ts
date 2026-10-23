// Strict payload structure for handling images (Cloudinary node format)
export interface ICloudinaryImage {
  public_id: string;
  url: string;
}

// Review schema configuration matrix
export interface IPlantReview {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Main Plant Document entity layout structure
export interface IPlant {
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
  benefits?: string[];
  careInstructions?: string[];
  lightRequirement?: string;
  wateringSchedule?: string;
  maintenanceLevel?: string;
  isPetFriendly?: boolean;
  ratings: number;
  coverImage: ICloudinaryImage;
  images: ICloudinaryImage[];
  category: string;
  stock: number;
  numOfReviews: number;
  reviews: IPlantReview[];
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

// API Server Wrapper Responses Matrix
export interface AllPlantsResponse {
  success: boolean;
  totalPlants: number;
  filteredCount: number;
  resultsPerPage: number;
  plants: IPlant[];
  count: number;
}

export interface PlantReviewsResponse {
  success: boolean;
  reviews: IPlantReview[];
}

export interface GenericPlantMutationResponse {
  success: boolean;
  message: string;
}