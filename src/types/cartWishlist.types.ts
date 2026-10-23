// ======================================================================
// 🛒 CART TYPES & INTERFACES
// ======================================================================

export interface IGuestProduct {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images?: { url: string; public_id?: string }[];
  coverImage?: { url: string; public_id?: string };
  stock: number;
  slug?: string;
  category?: string;
  emoji?: string;
}

export interface IGuestCartItem {
  _id?: string;
  product: IGuestProduct;
  itemModel: string;
  quantity: number;
  nursery?: string;
}

export interface ICartProductPopulated {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: { url: string; public_id: string }[];
  coverImage?: { url: string; public_id: string };
  stock: number;
  slug: string;
  emoji?: string;
}

export interface ICartItem {
  product: ICartProductPopulated; // Populated from backend
  itemModel:
    | "Plant"
    | "Pot"
    | "Accessory"
    | "GardeningTool"
    | "PlantCare"
    | "SeedsBulbs"
    | "PlantStandsShelves"
    | "ArtificialDriedPlant";
  quantity: number;
  nursery: string;
  _id?: string;
}

export interface ICart {
  _id: string;
  user: string;
  items: ICartItem[];
  createdAt: string;
  updatedAt: string;
}

// API Responses
export interface CartFetchOrMutationResponse {
  success: boolean;
  cart: ICart;
  message?: string;
}

export interface CartRemoveItemResponse {
  success: boolean;
  message: string;
  cart: ICart;
}

export interface CartClearResponse {
  success: boolean;
  message: string;
  cart: ICart;
}

// ======================================================================
// 💚 WISHLIST TYPES & INTERFACES
// ======================================================================

export interface IWishlistProductPopulated {
  _id: string;
  name: string;
  price: number;
  images: { url: string; public_id: string }[];
  coverImage?: { url: string; public_id: string };
  stock: number;
  slug: string;
}

export interface IWishlistItem {
  product: IWishlistProductPopulated; // Dynamic populated from backend
  itemModel:
    | "Plant"
    | "Pot"
    | "Accessory"
    | "GardeningTool"
    | "PlantCare"
    | "SeedsBulbs"
    | "PlantStandsShelves"
    | "ArtificialDriedPlant";
  _id?: string;
}

export interface IWishlist {
  _id: string;
  user: string;
  items: IWishlistItem[]; // 👈 Array mapping updated to mirror updated backend model
  createdAt: string;
  updatedAt: string;
}

// API Responses
export interface WishlistResponse {
  success: boolean;
  message?: string;
  wishlist: IWishlist;
}

export interface WishlistClearResponse {
  success: boolean;
  message: string;
  wishlist: IWishlist;
}