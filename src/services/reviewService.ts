import { api } from "@/config/api";
import {
  IAdminReviewsResponse,
  ReviewFilterParams,
  ReviewStatus,
  ReviewStatusMutationResponse,
} from "@/types/review.types";

export const reviewService = {
  /**
   * Fetch global paginated review feed with metrics & filters
   */
  getAdminGlobalReviews: async (
    params: ReviewFilterParams = {}
  ): Promise<IAdminReviewsResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", String(params.page));
    if (params.limit) searchParams.append("limit", String(params.limit));
    if (params.status && params.status !== "all") {
      searchParams.append("status", params.status);
    }
    if (params.rating && params.rating !== "all") {
      searchParams.append("rating", String(params.rating));
    }
    if (params.search && params.search.trim()) {
      searchParams.append("search", params.search.trim());
    }
    if (params.sortBy) {
      searchParams.append("sortBy", params.sortBy);
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/admin/reviews?${queryString}` : "/admin/reviews";

    const res: any = await api.get(endpoint);
    return res?.data ?? res;
  },

  /**
   * Update review status (approve, flag, reject, pending)
   */
  updateReviewStatus: async (
    reviewId: string,
    status: ReviewStatus
  ): Promise<ReviewStatusMutationResponse> => {
    const res: any = await api.patch(`/admin/reviews/${reviewId}/status`, { status });
    return res?.data ?? res;
  },

  /**
   * Permanently delete a review from product
   */
  deleteAdminReview: async (
    reviewId: string
  ): Promise<ReviewStatusMutationResponse> => {
    const res: any = await api.delete(`/admin/reviews/${reviewId}`);
    return res?.data ?? res;
  },

  /**
   * Bulk update status for multiple reviews
   */
  bulkUpdateReviewStatus: async (
    reviewIds: string[],
    status: ReviewStatus
  ): Promise<{ success: boolean; message: string; updatedCount: number }> => {
    const res: any = await api.patch("/admin/reviews/bulk-status", {
      reviewIds,
      status,
    });
    return res?.data ?? res;
  },
};

export default reviewService;
