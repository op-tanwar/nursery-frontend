import { cache } from "react";
import { api } from "@/config/api";
import {
  IProduct,
  ProductCategory,
  ProductFilters,
  ProductsApiResponse,
  SingleProductApiResponse,
  ProductReviewsApiResponse,
  GenericProductMutationResponse,
} from "@/types/product.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://nursery-backend-2rg3.onrender.com/api/v1";

/**
 * ⚡ Single-Request Deduplicated Product Fetcher (Zero Waterfall, SSR-Safe)
 * Wraps product-by-slug resolution in React.cache() so generateMetadata and
 * Server Component executions within the same SSR request share the identical network dispatch.
 * Accepts a scalar string slug for stable reference equality cache keying.
 */
export const getProductBySlug = cache(async (slug: string): Promise<IProduct | null> => {
  if (!slug || typeof slug !== "string") return null;
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return null;

  try {
    if (typeof fetch === "function") {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(normalizedSlug)}`, {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 60, tags: [`product-${normalizedSlug}`] },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) return null;

      const data = await res.json();
      const product = data?.product || (data?._id ? data : null);
      return (product as IProduct) || null;
    }

    const res: any = await api.get(`/products/${encodeURIComponent(normalizedSlug)}`);
    const data = res?.data ?? res;
    const product = data?.product || (data?._id ? data : null);
    return (product as IProduct) || null;
  } catch {
    return null;
  }
});

/**
 * 🌿 Centralized High-Performance Service for the Unified Polymorphic Product Catalog
 */
export const productService = {
  getProductBySlug,

  /**
   * Fetch paginated and filtered catalog across all categories or a specific category.
   * Supports safe regex keyword search, price range, nursery filter, and sorting.
   */
  getProducts: async (filters: ProductFilters = {}): Promise<ProductsApiResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : "/products";
    const res: any = await api.get(endpoint);
    return res?.data ?? res;
  },

  /**
   * Fetch products by category shorthand
   */
  getProductsByCategory: async (
    category: ProductCategory,
    filters: Omit<ProductFilters, "category"> = {}
  ): Promise<ProductsApiResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = queryString
      ? `/products/category/${category}?${queryString}`
      : `/products/category/${category}`;
    const res: any = await api.get(endpoint);
    return res?.data ?? res;
  },

  /**
   * Fetch single product by MongoDB ObjectId OR SEO-friendly slug.
   * Backend automatically resolves 301 redirects for historic/changed slugs.
   */
  getProductByIdOrSlug: async (idOrSlug: string): Promise<SingleProductApiResponse> => {
    const res: any = await api.get(`/products/${encodeURIComponent(idOrSlug)}`);
    return res?.data ?? res;
  },

  /**
   * Fetch products for a specific nursery / vendor
   */
  getProductsByNursery: async (
    nurseryId: string,
    filters: ProductFilters = {}
  ): Promise<ProductsApiResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = queryString
      ? `/products/nursery/${nurseryId}?${queryString}`
      : `/products/nursery/${nurseryId}`;
    const res: any = await api.get(endpoint);
    return res?.data ?? res;
  },

  /**
   * Create a new product (handles multipart FormData or JSON payload)
   */
  createProduct: async (
    productData: FormData | Record<string, any>
  ): Promise<GenericProductMutationResponse> => {
    const headers =
      productData instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };

    const res: any = await api.post("/products", productData, { headers });
    return res?.data ?? res;
  },

  /**
   * Update an existing product by ID
   */
  updateProduct: async (
    productId: string,
    productData: FormData | Record<string, any>
  ): Promise<GenericProductMutationResponse> => {
    const headers =
      productData instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };

    const res: any = await api.put(`/products/${productId}`, productData, { headers });
    return res?.data ?? res;
  },

  /**
   * Delete product by ID
   */
  deleteProduct: async (productId: string): Promise<GenericProductMutationResponse> => {
    const res: any = await api.delete(`/products/${productId}`);
    return res?.data ?? res;
  },

  /**
   * Add or update product review
   */
  submitProductReview: async (
    productId: string,
    reviewData: { rating: number; comment: string }
  ): Promise<ProductReviewsApiResponse> => {
    const res: any = await api.post(`/products/${productId}/review`, reviewData);
    return res?.data ?? res;
  },

  /**
   * Delete a review from a product
   */
  deleteProductReview: async (
    productId: string,
    reviewId: string
  ): Promise<GenericProductMutationResponse> => {
    const res: any = await api.delete(`/products/${productId}/review/${reviewId}`);
    return res?.data ?? res;
  },
};

export default productService;
