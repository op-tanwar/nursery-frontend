export type ReviewStatus = "pending" | "approved" | "flagged" | "rejected";

export interface IAdminReviewItem {
  _id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productCategory: string;
  productImage?: string;
  productRatingsAverage?: number;
  productRatingsQuantity?: number;
  rating: number;
  comment: string;
  status: ReviewStatus;
  isVerifiedBuyer: boolean;
  createdAt: string;
  user: {
    _id?: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface IAdminReviewStats {
  totalReviews: number;
  pendingReviews: number;
  flaggedReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  avgRating: number;
}

export interface IAdminReviewsResponse {
  success: boolean;
  reviews: IAdminReviewItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: IAdminReviewStats;
}

export interface ReviewFilterParams {
  page?: number;
  limit?: number;
  status?: "all" | ReviewStatus;
  rating?: "all" | number | string;
  search?: string;
  sortBy?: "createdAt:desc" | "createdAt:asc" | "rating:desc" | "rating:asc";
}

export interface ReviewStatusMutationResponse {
  success: boolean;
  message: string;
  review?: any;
  product?: {
    _id: string;
    name: string;
    ratingsAverage: number;
    ratingsQuantity: number;
  };
}
