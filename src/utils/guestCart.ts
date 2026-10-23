/**
 * ======================================================================
 * 🛒 PLANTO GUEST CART (LOCALSTORAGE) & POST-LOGIN SYNC ENGINE
 * ======================================================================
 * Manages client-side unauthenticated cart lifecycle:
 * 1. Safe localStorage access (SSR & Hydration safe).
 * 2. Mirrors database cart structure (ICart & ICartItem) for seamless UI rendering.
 * 3. Enforces inventory stock boundaries & caps.
 * 4. Automatic post-authentication cart synchronization & migration to MongoDB.
 * ======================================================================
 */

import { ICart, ICartItem } from "@/types/cartWishlist.types";
import { cartService } from "@/services/cartWishlistService";

export const GUEST_CART_STORAGE_KEY = "planto_guest_cart";

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

/**
 * Normalizes item category/type into valid backend itemModel enum:
 * "Plant" | "Pot" | "Accessory" | "GardeningTool" | "PlantCare" |
 * "SeedsBulbs" | "PlantStandsShelves" | "ArtificialDriedPlant"
 */
export function normalizeItemModel(typeOrCategory?: string): string {
  if (!typeOrCategory) return "Plant";
  const clean = String(typeOrCategory).toLowerCase().replace(/[^a-z]/g, "");

  if (clean.includes("pot") || clean.includes("planter")) return "Pot";
  if (clean.includes("accessor")) return "Accessory";
  if (clean.includes("tool") || clean.includes("garden")) return "GardeningTool";
  if (clean.includes("care") || clean.includes("fertiliz") || clean.includes("soil")) return "PlantCare";
  if (clean.includes("seed") || clean.includes("bulb")) return "SeedsBulbs";
  if (clean.includes("stand") || clean.includes("shelv")) return "PlantStandsShelves";
  if (clean.includes("artific") || clean.includes("dried")) return "ArtificialDriedPlant";

  return "Plant";
}

/**
 * Reads guest cart items array from localStorage safely.
 */
export function getGuestCart(): IGuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item: any) => {
      const prodId = item?.product?._id || item?.product?.id;
      return Boolean(prodId && Number(item?.quantity) > 0);
    });
  } catch (err) {
    console.error("Error reading guest cart from localStorage:", err);
    return [];
  }
}

/**
 * Persists guest cart items array to localStorage and broadcasts custom change event.
 */
export function saveGuestCart(items: IGuestCartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("planto_cart_updated"));
  } catch (err) {
    console.error("Error saving guest cart to localStorage:", err);
  }
}

/**
 * Clears guest cart from localStorage and broadcasts change event.
 */
export function clearGuestCart(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    window.dispatchEvent(new Event("planto_cart_updated"));
  } catch (err) {
    console.error("Error clearing guest cart from localStorage:", err);
  }
}

/**
 * Converts guest cart items array into full ICart structure compatible
 * with all existing cart components, totals calculations, and Redux state.
 */
export function formatGuestCartToICart(items: IGuestCartItem[]): ICart {
  const formattedItems: ICartItem[] = items.map((item) => {
    const prodId = String(item.product._id || (item.product as any).id || "");
    const images = item.product.images?.length
      ? item.product.images.map((img) => ({ url: img.url, public_id: img.public_id || "" }))
      : item.product.coverImage
      ? [{ url: item.product.coverImage.url, public_id: item.product.coverImage.public_id || "" }]
      : item.product.emoji?.startsWith("http") || item.product.emoji?.startsWith("/")
      ? [{ url: item.product.emoji, public_id: "" }]
      : [];

    const coverImage = item.product.coverImage
      ? { url: item.product.coverImage.url, public_id: item.product.coverImage.public_id || "" }
      : images[0];

    return {
      _id: item._id || prodId,
      product: {
        _id: prodId,
        name: item.product.name,
        price: Number(item.product.price) || 0,
        discountPrice:
          item.product.discountPrice !== undefined && item.product.discountPrice !== null
            ? Number(item.product.discountPrice)
            : undefined,
        images,
        coverImage,
        stock: typeof item.product.stock === "number" ? item.product.stock : 99,
        slug: item.product.slug || "",
        emoji: item.product.emoji,
      },
      itemModel: (normalizeItemModel(item.itemModel) as any),
      quantity: Math.max(1, Number(item.quantity) || 1),
      nursery: item.nursery || "",
    };
  });

  return {
    _id: "guest-cart-session",
    user: "guest",
    items: formattedItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Adds an item to the guest cart in localStorage, respecting stock limits.
 */
export function addToGuestCart(itemData: {
  product: IGuestProduct;
  quantity: number;
  itemModel?: string;
  nursery?: string;
}): { cart: ICart; message: string; isNew: boolean } {
  const items = getGuestCart();
  const prodId = String(itemData.product._id || (itemData.product as any).id || "");
  const maxStock = typeof itemData.product.stock === "number" ? itemData.product.stock : 99;
  const requestedQty = Math.max(1, Number(itemData.quantity) || 1);

  const existingIndex = items.findIndex((i) => {
    const id = i.product._id || (i.product as any).id;
    return String(id) === prodId;
  });

  let isNew = false;
  let message = "";

  if (existingIndex > -1) {
    const existing = items[existingIndex];
    const newQty = existing.quantity + requestedQty;

    if (newQty > maxStock) {
      existing.quantity = maxStock;
      message = `Added to cart (capped at maximum stock: ${maxStock} units)`;
    } else {
      existing.quantity = newQty;
      message = `${requestedQty} × ${itemData.product.name} added to cart!`;
    }

    // Refresh metadata (price, stock, images)
    existing.product = {
      ...existing.product,
      ...itemData.product,
      _id: prodId,
      stock: maxStock,
    };
    if (itemData.itemModel) existing.itemModel = itemData.itemModel;
    if (itemData.nursery) existing.nursery = itemData.nursery;
  } else {
    isNew = true;
    const finalQty = Math.min(requestedQty, maxStock);
    items.push({
      _id: prodId,
      product: {
        ...itemData.product,
        _id: prodId,
        stock: maxStock,
      },
      quantity: finalQty,
      itemModel: itemData.itemModel || "Plant",
      nursery: itemData.nursery || "",
    });
    message = `${finalQty} × ${itemData.product.name} added to cart!`;
  }

  saveGuestCart(items);
  return { cart: formatGuestCartToICart(items), message, isNew };
}

/**
 * Updates item quantity in guest cart.
 */
export function updateGuestCartQuantity(
  productId: string,
  quantity: number
): { cart: ICart; message?: string } {
  const items = getGuestCart();
  const targetIndex = items.findIndex((i) => {
    const id = i.product._id || (i.product as any).id;
    return String(id) === String(productId);
  });

  if (targetIndex > -1) {
    const item = items[targetIndex];
    const maxStock = typeof item.product.stock === "number" ? item.product.stock : 99;
    const clampedQty = Math.min(Math.max(1, quantity), maxStock);
    item.quantity = clampedQty;
    saveGuestCart(items);
  }

  return { cart: formatGuestCartToICart(items) };
}

/**
 * Removes item from guest cart.
 */
export function removeFromGuestCart(productId: string): { cart: ICart; message: string } {
  const items = getGuestCart();
  const filtered = items.filter((i) => {
    const id = i.product._id || (i.product as any).id;
    return String(id) !== String(productId);
  });
  saveGuestCart(filtered);
  return { cart: formatGuestCartToICart(filtered), message: "Item removed from cart" };
}

/**
 * Executes post-login/register cart merge:
 * 1. Checks if guest cart contains items in localStorage.
 * 2. If items exist, syncs them to MongoDB via cartService.syncCart.
 * 3. Clears localStorage guest cart upon successful sync.
 * 4. Refreshes Redux state with merged backend cart.
 * 5. If no guest items, fetches the user's latest DB cart.
 */
export async function syncCartOnAuthSuccess(dispatch: any): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const guestItems = getGuestCart();
    if (guestItems && guestItems.length > 0) {
      const payload = guestItems.map((item) => ({
        product: String(item.product._id || (item.product as any).id),
        quantity: item.quantity,
      }));

      const syncResponse = await cartService.syncCart(payload);
      if (syncResponse?.success && syncResponse.cart) {
        clearGuestCart();
        dispatch({
          type: "cart/cartActionSuccess",
          payload: { cart: syncResponse.cart, message: "Cart synchronized successfully" },
        });
        return;
      }
    }

    // If no guest items or fallback, fetch existing user cart
    const freshCart = await cartService.getMyCart();
    if (freshCart?.success && freshCart.cart) {
      dispatch({
        type: "cart/cartActionSuccess",
        payload: { cart: freshCart.cart },
      });
    }
  } catch (error) {
    console.error("Cart synchronization on auth failure:", error);
    // Non-blocking fallback to attempt cart load
    try {
      const fallbackCart = await cartService.getMyCart();
      if (fallbackCart?.success && fallbackCart.cart) {
        dispatch({
          type: "cart/cartActionSuccess",
          payload: { cart: fallbackCart.cart },
        });
      }
    } catch (fallbackErr) {
      console.warn("Fallback cart fetch after auth error failed:", fallbackErr);
    }
  }
}

/**
 * Safe redirect resolver respecting redirect query params (e.g. ?redirect=/checkout).
 * Prevents open redirects by enforcing relative root-anchored paths.
 */
export function getPostAuthRedirectUrl(userRole: string): string {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const redirectParam = params.get("redirect");
    if (
      redirectParam &&
      redirectParam.startsWith("/") &&
      !redirectParam.startsWith("//") &&
      !redirectParam.toLowerCase().includes("javascript:")
    ) {
      return redirectParam;
    }
  }

  if (userRole === "admin") return "/admin";
  if (userRole === "nursery") return "/nursery";
  return "/";
}
