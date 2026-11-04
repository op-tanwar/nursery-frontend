// ======================================================================
// 🌿 UNIFIED POLYMORPHIC PRODUCT TYPES (CLIENT & NEXT.JS FRONTEND)
// ======================================================================

import { ICloudinaryImage } from "./plant.types";

export type IProductImage = ICloudinaryImage;

export const PRODUCT_CATEGORIES = [
  "plants",
  "pots",
  "accessories",
  "gardening-tools",
  "plant-care",
  "seeds-bulbs",
  "stands-shelves",
  "artificial-dried",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface IProductReview {
  _id?: string;
  user?: string;
  name: string;
  rating: number;
  comment: string;
  isVerifiedBuyer?: boolean;
  createdAt?: string;
}

// ----------------------------------------------------------------------
// Category-Specific Dynamic Attributes
// ----------------------------------------------------------------------

export interface PlantAttributes {
  lightRequirement?: string;
  wateringSchedule?: string;
  maintenanceLevel?: "Easy" | "Medium" | "High" | string;
  isPetFriendly?: boolean;
  benefits?: string[];
  careInstructions?: string[];
  plantType?: "Indoor" | "Outdoor" | "Flowering" | "Air Purifying" | "Succulent" | string;
}

export interface PotAttributes {
  material?: string;
  color?: string[] | string;
  dimensions?: {
    height?: string;
    diameter?: string;
    width?: string;
    length?: string;
  };
  drainageHoles?: boolean;
  shape?: string;
}

export interface AccessoryAttributes {
  material?: string;
  brand?: string;
  weight?: string;
  capacity?: string;
  usageType?: string;
}

export interface GardeningToolAttributes {
  features?: string[];
  material?: string;
  handleMaterial?: string;
  warrantyMonths?: number;
  toolType?: string;
}

export interface PlantCareAttributes {
  composition?: string;
  howToUse?: string[];
  volumeOrWeight?: string;
  formType?: "Liquid" | "Granules" | "Powder" | "Pellets" | string;
  suitableFor?: string[];
}

export interface SeedsBulbsAttributes {
  sowingSeason?: string[];
  germinationTime?: string;
  quantityPerPack?: string;
  sunlightRequirement?: string;
  seedType?: string;
}

export interface StandsShelvesAttributes {
  material?: string;
  dimensions?: {
    height?: string;
    width?: string;
    length?: string;
  };
  tierCount?: number;
  maxLoadCapacity?: string;
  isFoldable?: boolean;
}

export interface ArtificialDriedAttributes {
  material?: string;
  height?: string;
  color?: string;
  brand?: string;
  includesVase?: boolean;
}

export type CategoryAttributes =
  | PlantAttributes
  | PotAttributes
  | AccessoryAttributes
  | GardeningToolAttributes
  | PlantCareAttributes
  | SeedsBulbsAttributes
  | StandsShelvesAttributes
  | ArtificialDriedAttributes
  | Record<string, any>;

// ----------------------------------------------------------------------
// Unified Product Interface (Polymorphic with backward-compatible aliases)
// ----------------------------------------------------------------------

export interface INurseryInfo {
  _id: string;
  businessName?: string;
  name?: string;
  slug?: string;
  businessAddress?: {
    address?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  };
  logo?: ICloudinaryImage;
  email?: string;
  phone?: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  slugHistory?: string[];
  category: ProductCategory;
  nursery: INurseryInfo | string;
  price: number;
  discountPrice?: number;
  stock: number;
  reservedStock?: number;
  availableStock?: number;
  coverImage?: ICloudinaryImage;
  images: ICloudinaryImage[];
  description: string;
  descriptionOption?: {
    short?: string;
    points?: string[];
  };
  isPublished: boolean;
  isActive?: boolean;
  ratingsAverage: number;
  ratingsQuantity: number;
  ratings?: number;
  numOfReviews?: number;
  reviews: IProductReview[];
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
  attributes: CategoryAttributes;
  createdAt: string;
  updatedAt?: string;
}

// ----------------------------------------------------------------------
// API Requests & Responses
// ----------------------------------------------------------------------

export interface ProductFilters {
  category?: ProductCategory;
  nursery?: string;
  vendor?: string;
  minPrice?: number;
  maxPrice?: number;
  isPublished?: boolean;
  keyword?: string;
  sort?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface ProductsApiResponse {
  success: boolean;
  totalCount: number;
  filteredCount: number;
  resultsPerPage: number;
  count: number;
  products: IProduct[];
}

export interface SingleProductApiResponse {
  success: boolean;
  product: IProduct;
  message?: string;
}

export interface ProductReviewsApiResponse {
  success: boolean;
  reviews: IProductReview[];
  ratingsAverage?: number;
  ratingsQuantity?: number;
}

export interface GenericProductMutationResponse {
  success: boolean;
  message: string;
  product?: IProduct;
}
