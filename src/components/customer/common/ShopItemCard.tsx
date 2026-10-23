"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

// Redux Actions, Selectors & Types
import { RootState } from "@/redux/store";
import { cartActionSuccess, setCartError, addToGuestCartAction } from "@/redux/slices/cartSlice";
import { wishlistToggleSuccess, setWishlistError } from "@/redux/slices/wishlistSlice";
import { cartService, wishlistService } from "@/services/cartWishlistService";
import { normalizeItemModel } from "@/utils/guestCart";
import { IWishlistItem } from "@/types/index";
import {
  isExplicitBestseller,
  getProductDiscountPercent,
  isProductLimitedStock,
  isProductNewArrival,
} from "@/utils/productBadge";

export interface ShopItemType {
  id: string;
  _id?: string;
  slug: string;
  type:
  | "plants"
  | "pots"
  | "accessories"
  | "gardening-tools"
  | "plant-care"
  | "seeds-bulbs"
  | "plant-stands-shelves"
  | "artificial-dried-plants";
  category: string;
  name: string;
  vendor: string | { name?: string; businessName?: string; _id?: string; id?: string; slug?: string; location?: string };
  vendorName?: string;
  vendorId?: string;
  vendorSlug?: string;
  nurseryId?: string;
  nursery?: any;
  businessName?: string;
  city?: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  badge: string;
  badgeColor: string;
  tag: string | null;
  emoji: string;
  isBestSeller?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  totalSales?: number;
  salesCount?: number;
  tags?: string[] | string;
  stock?: number;
  ratings?: number;
  reviewsCount?: number;
  numOfReviews?: number;
  discountPrice?: number;
  createdAt?: string;
}

interface ShopItemCardProps {
  item: ShopItemType;
  index: number;
}

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`text-xs leading-none ${s <= Math.floor(rating) ? "text-amber-400" : "text-slate-200"
            }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ShopItemCard({ item, index }: ShopItemCardProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  // Local Loading States
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // 💚 Redux Multi-Product Wishlist Matching Layer
  const { wishlist } = useSelector((state: RootState) => state.wishlist);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const wishlistItems = wishlist?.items || [];

  // Strict Object Validation Layer
  const isWishlisted = wishlistItems.some((wItem: any) => {
    if (!wItem) return false;
    const targetProductId = wItem.product?._id || wItem.product?.id || wItem.product;
    return String(targetProductId) === String(item.id);
  });

  // 1. Resolve vendor display name safely
  const rawVendorName =
    item.vendorName ||
    (typeof item.vendor === "string" ? item.vendor : item.vendor?.name || item.vendor?.businessName) ||
    item.businessName ||
    (typeof item.nursery === "string" ? item.nursery : item.nursery?.name || item.nursery?.businessName) ||
    "Certified Nursery";

  const displayVendorName = String(rawVendorName).split(",")[0].trim() || "Certified Nursery";

  // 2. Resolve vendor link target (slug or ID)
  const vendorObj =
    typeof item.vendor === "object" && item.vendor !== null
      ? item.vendor
      : typeof item.nursery === "object" && item.nursery !== null
        ? item.nursery
        : null;

  const vendorIdentifier =
    item.vendorSlug ||
    vendorObj?.slug ||
    vendorObj?.nurseryId ||
    vendorObj?._id ||
    vendorObj?.id ||
    item.vendorId ||
    item.nurseryId ||
    (typeof item.vendor === "string" && item.vendor.trim() !== "" && item.vendor !== "undefined"
      ? item.vendor.trim()
      : null) ||
    (typeof item.nursery === "string" && item.nursery.trim() !== "" && item.nursery !== "undefined"
      ? item.nursery.trim()
      : null) ||
    (displayVendorName && displayVendorName !== "Certified Nursery"
      ? displayVendorName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")
      : null);

  const vendorHref = vendorIdentifier && vendorIdentifier !== "undefined" ? `/vendor/${vendorIdentifier}` : null;

  const isImageUrl = item.emoji.startsWith("http") || item.emoji.startsWith("/");
  const itemSlug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const handleSessionStorageSet = () => {
    if (typeof window !== "undefined" && item.id) {
      sessionStorage.setItem(`shop_item_id_${itemSlug}`, item.id);
    }
  };

  // 🛒 Add To Cart Execution handler
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart) return;
    setIsAddingToCart(true);

    try {
      if (!isAuthenticated) {
        // 🛒 Guest Mode: add directly to localStorage and mirror to Redux
        const imageList = item.emoji?.startsWith("http") || item.emoji?.startsWith("/")
          ? [{ url: item.emoji }]
          : [];

        dispatch(
          addToGuestCartAction({
            product: {
              _id: item.id || item._id || "",
              name: item.name,
              price: item.originalPrice || item.price,
              discountPrice: item.originalPrice && item.originalPrice > item.price ? item.price : undefined,
              images: imageList,
              coverImage: imageList[0],
              stock: (item as any).stock ?? 99,
              slug: item.slug || "",
              category: item.category,
              emoji: item.emoji,
            },
            quantity: 1,
            itemModel: normalizeItemModel(item.type || item.category),
            nursery: item.nurseryId || item.vendorId || "",
          })
        );
        toast.success(`${item.name} added to cart!`);
      } else {
        const response = await cartService.addToCart(item.id, 1);
        if (response.success) {
          dispatch(cartActionSuccess({ cart: response.cart, message: response.message }));
          toast.success(response.message || `${item.name} added to cart!`);
        }
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to add item to cart";
      dispatch(setCartError(errorMsg));
      toast.error(errorMsg);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // 💚 Wishlist Toggle Execution handler
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isTogglingWishlist) return;
    setIsTogglingWishlist(true);

    try {
      const response = await wishlistService.toggleWishlistItem(item.id);
      if (response.success) {
        dispatch(wishlistToggleSuccess({ wishlist: response.wishlist, message: response.message }));
        toast.success(
          response.message || (isWishlisted ? "Removed from wishlist" : "Added to wishlist!")
        );
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to update wishlist";
      dispatch(setWishlistError(errorMsg));
      toast.error(errorMsg);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <div
      onClick={() => {
        handleSessionStorageSet();
        router.push(`/shop/${item.type.toLowerCase()}/${itemSlug}`);
      }}
      className="group relative flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10 hover:border-emerald-600/30"
    >
      {/* 2-LAYER IMAGE CANVAS (COVER BG + ZERO CROP IMAGE) */}
      <div className="relative w-full aspect-square overflow-hidden bg-slate-100 flex items-center justify-center border-b border-slate-100">

        {isImageUrl ? (
          <>
            {/* ⚡ PERF: Lightweight CSS backdrop glow uses browser-cached image instead of duplicate Next.js Image pipeline */}
            <div
              className="absolute inset-0 pointer-events-none scale-125 bg-cover bg-center blur-md opacity-25"
              style={{ backgroundImage: `url(${item.emoji})` }}
              aria-hidden="true"
            />

            {/* LAYER 2: Crisp Hero Image (Zero Crop, 100% Visible) */}
            <div className="relative z-1 w-full h-full p-4 flex items-center justify-center">
              <Image
                src={item.emoji}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105 drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)]"
                priority={index < 4}
              />
            </div>
          </>
        ) : (
          <span className="text-[76px] select-none transition-transform duration-300 group-hover:scale-110 drop-shadow-md z-1">
            {item.emoji}
          </span>
        )}

        {/* DETERMINISTIC QUALIFICATION BADGE OVERLAY */}
        {(() => {
          const isBestseller = isExplicitBestseller(item);
          const discountPercent = getProductDiscountPercent(item);
          const hasSignificantDiscount = discountPercent >= 10;
          const isLimited = isProductLimitedStock(item);
          const isNew = isProductNewArrival(item);

          // 1. Strict qualification: Bestseller badge
          if (isBestseller) {
            return (
              <span className="absolute top-2.5 left-2.5 z-10 rounded-full bg-emerald-700/90 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white shadow-sm">
                Bestseller
              </span>
            );
          }

          // 2. Contextual low stock badge
          if (isLimited) {
            return (
              <span className="absolute top-2.5 left-2.5 z-10 rounded-full bg-purple-600/90 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white shadow-sm">
                Limited
              </span>
            );
          }

          // 3. Contextual discount badge
          if (hasSignificantDiscount) {
            return (
              <span className="absolute top-2.5 left-2.5 z-10 rounded-full bg-amber-500/90 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white shadow-sm">
                {discountPercent}% OFF
              </span>
            );
          }

          // 4. Contextual new arrival badge
          if (isNew) {
            return (
              <span className="absolute top-2.5 left-2.5 z-10 rounded-full bg-teal-600/90 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white shadow-sm">
                New
              </span>
            );
          }

          // 5. Explicit custom tag (if specified and not legacy blanket value)
          if (item.tag && item.tag !== "Bestseller" && item.tag !== "Limited") {
            return (
              <span className="absolute top-2.5 left-2.5 z-10 rounded-full bg-sky-600/90 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white shadow-sm">
                {item.tag}
              </span>
            );
          }

          // Render nothing if no badge criteria is met
          return null;
        })()}

        {/* BOTTOM DISCOUNT BADGE OVERLAY (Shown only when top badge is not already displaying discount) */}
        {(() => {
          const isBestseller = isExplicitBestseller(item);
          const isLimited = isProductLimitedStock(item);
          const discountPercent = getProductDiscountPercent(item);
          const isTopDiscountBadge = !isBestseller && !isLimited && discountPercent >= 10;

          if (!isTopDiscountBadge && item.originalPrice && item.originalPrice > item.price) {
            return (
              <span className="absolute bottom-3 left-3 text-[10px] font-black text-white bg-red-500 py-0.5 px-2 rounded-full tracking-wider z-10 shadow-sm">
                -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
              </span>
            );
          }
          return null;
        })()}

        {/* WISHLIST HEART BUTTON */}
        <button
          type="button"
          disabled={isTogglingWishlist}
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer text-sm transition-all duration-200 z-10 shadow-sm hover:bg-white hover:scale-110 hover:shadow-md active:scale-90 disabled:opacity-70"
        >
          <span className={`leading-none ${isTogglingWishlist ? "animate-pulse" : ""}`}>
            {isWishlisted ? "❤️" : "🤍"}
          </span>
        </button>
      </div>

      {/* METADATA CONTENT DECK */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 relative bg-white z-1">
        {/* CATEGORY BADGE */}
        <div>
          <span
            className="inline-block text-[10px] font-bold py-1 px-2.5 rounded-md mb-2 tracking-wide uppercase"
            style={{
              backgroundColor: `${item.badgeColor}15`,
              color: item.badgeColor,
            }}
          >
            {item.category}
          </span>
        </div>

        {/* PRODUCT TITLE */}
        <h3 className="m-0 mb-1 text-[15px] sm:text-[16px] font-bold text-slate-900 leading-snug font-sans line-clamp-1 group-hover:text-emerald-700 transition-colors">
          {item.name}
        </h3>

        {/* VENDOR LINK LAYER */}
        <p className="m-0 mb-2.5 text-xs text-slate-500 font-sans">
          by{" "}
          {vendorHref ? (
            <Link
              href={vendorHref}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="text-emerald-700 font-semibold hover:underline hover:text-emerald-800 transition-colors inline-block cursor-pointer relative z-10"
            >
              {displayVendorName}
            </Link>
          ) : (
            <span className="text-slate-600 font-medium inline-block">
              {displayVendorName}
            </span>
          )}
        </p>

        {/* REVIEWS & RATING */}
        <div className="flex items-center gap-1.5 mb-4">
          <StarRating rating={item.rating} />
          <span className="text-[11px] font-medium text-slate-500 font-sans">
            {item.rating} <span className="text-slate-400">({item.reviews})</span>
          </span>
        </div>

        {/* FOOTER: PRICE & ACTION */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                ₹{item.price.toLocaleString()}
              </span>
              {item.originalPrice && (
                <span className="text-xs line-through text-slate-400 font-medium">
                  ₹{item.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">+ GST at checkout</span>
          </div>

          {/* ADD TO CART ACTION BAR */}
          <button
            type="button"
            disabled={isAddingToCart}
            onClick={handleAddToCart}
            className="bg-emerald-700 text-white border-none rounded-xl py-2 px-3.5 sm:py-2.5 sm:px-4 text-xs font-bold cursor-pointer transition-all duration-200 hover:bg-emerald-800 hover:shadow-md hover:shadow-emerald-700/20 active:scale-95 relative z-10 shrink-0 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}