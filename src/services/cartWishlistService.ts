import { api } from "@/config/api";
import {
  CartFetchOrMutationResponse,
  CartRemoveItemResponse,
  CartClearResponse,
  WishlistResponse,
  WishlistClearResponse
} from "@/types/index";

export const cartService = {
  getMyCart: async (): Promise<CartFetchOrMutationResponse> => {
    const res: any = await api.get("/shop/cart");
    return res?.data ?? res;
  },

  addToCart: async (productId: string, quantity: number): Promise<CartFetchOrMutationResponse> => {
    const res: any = await api.post("/shop/cart", { productId, quantity });
    return res?.data ?? res;
  },

  updateCartQuantity: async (productId: string, quantity: number): Promise<CartFetchOrMutationResponse> => {
    const res: any = await api.put("/shop/cart", { productId, quantity });
    return res?.data ?? res;
  },

  removeFromCart: async (productId: string): Promise<CartRemoveItemResponse> => {
    const res: any = await api.delete(`/shop/cart/${productId}`);
    return res?.data ?? res;
  },

  syncCart: async (guestCartItems: { product: string; quantity: number }[]): Promise<CartFetchOrMutationResponse> => {
    const res: any = await api.post("/shop/cart/sync", { guestCartItems });
    return res?.data ?? res;
  },

  // 🧹 Naya: Backend router.route("/cart").delete(clearMyCart) ke liye
  clearCart: async (): Promise<CartClearResponse> => {
    const res: any = await api.delete("/shop/cart");
    return res?.data ?? res;
  },
};

export const wishlistService = {
  getMyWishlist: async (): Promise<WishlistResponse> => {
    const res: any = await api.get("/shop/wishlist");
    return res?.data ?? res;
  },

  // 💡 Updated payload key to match backend: { productId } instead of { plantId }
  toggleWishlistItem: async (productId: string): Promise<WishlistResponse> => {
    const res: any = await api.post("/shop/wishlist", { productId });
    return res?.data ?? res;
  },

  // 🧹 Naya: Backend router.route("/wishlist").delete(clearMyWishlist) ke liye
  clearWishlist: async (): Promise<WishlistClearResponse> => {
    const res: any = await api.delete("/shop/wishlist");
    return res?.data ?? res;
  },
};