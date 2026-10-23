"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

// Redux Actions & Services
import { RootState } from "@/redux/store";
import { cartActionSuccess, setCartError, addToGuestCartAction } from "@/redux/slices/cartSlice";
import { cartService } from "@/services/cartWishlistService";
import { normalizeItemModel } from "@/utils/guestCart";

export interface SuggestionItem {
  id: string;
  slug?: string;
  type: string;
  name: string;
  price: number;
  emoji: string;
}

interface SuggestionsSectionProps {
  suggestions: SuggestionItem[];
}

export default function SuggestionsSection({ suggestions }: SuggestionsSectionProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Track active item loading state individually by storing targeted ID
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  if (!suggestions || suggestions.length === 0) return null;

  // 🛒 Add To Cart Handler using Redux and cartService
  const handleAddToCart = async (e: React.MouseEvent, item: SuggestionItem) => {
    e.preventDefault();
    e.stopPropagation();

    // Specific check: Agar same item request running hai, duplicate triggers ignore karein
    if (loadingItemId === item.id) return;
    setLoadingItemId(item.id);

    try {
      if (!isAuthenticated) {
        // 🛒 Guest Mode: add directly to localStorage and mirror to Redux
        const isImage = item.emoji?.startsWith("http") || item.emoji?.startsWith("/");
        const imageList = isImage ? [{ url: item.emoji }] : [];

        dispatch(
          addToGuestCartAction({
            product: {
              _id: item.id,
              name: item.name,
              price: item.price,
              images: imageList,
              coverImage: imageList[0],
              stock: 99,
              slug: item.slug || "",
              emoji: item.emoji,
            },
            quantity: 1,
            itemModel: normalizeItemModel(item.type),
          })
        );
        toast.success(`${item.name} added to cart!`);
      } else {
        const response = await cartService.addToCart(item.id, 1);

        if (response.success) {
          dispatch(
            cartActionSuccess({
              cart: response.cart,
              message: response.message,
            })
          );
          toast.success(response.message || `${item.name} added to cart!`);
        }
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || "Failed to add item to cart";
      dispatch(setCartError(errorMsg));
      toast.error(errorMsg);
    } finally {
      setLoadingItemId(null);
    }
  };


  return (
    <div className="mb-12 p-5 bg-brand-light/10 border border-brand-primary/20 rounded-2xl shadow-2xs">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">💡</span>
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-dark m-0">
          Frequently Bought Together (Recommended Pairs)
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
        {suggestions.map((sug) => {
          // Dynamic router mapping layer sync
          const lowerType = sug.type.toLowerCase();
          const routeType =
            lowerType === "pots"
              ? "pots"
              : lowerType === "accessories"
                ? "accessories"
                : "plants";

          // Fallback route token target
          const routeIdentifier = sug.slug || sug.id;
          const isRemoteImage =
            sug.emoji.startsWith("http") || sug.emoji.startsWith("/");
          const isAddingThisItem = loadingItemId === sug.id;

          return (
            <div
              key={sug.id}
              className="flex items-center justify-between gap-4 p-3 rounded-xl bg-panel border border-line hover:border-brand-primary/40 transition-all group"
            >
              <div
                className="flex items-center gap-3 cursor-pointer min-w-0"
                onClick={() =>
                  router.push(`/shop/${routeType}/${routeIdentifier}`)
                }
              >
                <div className="w-12 h-12 shrink-0 rounded-lg bg-brand-light/40 border border-line flex items-center justify-center text-2xl select-none relative overflow-hidden">
                  {isRemoteImage ? (
                    <Image
                      src={sug.emoji}
                      alt={sug.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span>{sug.emoji || "🌿"}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-foreground m-0 group-hover:text-brand-primary transition-colors line-clamp-1">
                    {sug.name}
                  </h4>
                  <span className="text-[11px] font-black text-brand-primary block mt-0.5">
                    ₹{sug.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isAddingThisItem} // ✅ Sirf wahi button disable hoga jis par click hua hai
                onClick={(e) => handleAddToCart(e, sug)}
                className="bg-brand-primary text-white text-[10px] font-bold border-none px-3 py-2 rounded-lg cursor-pointer hover:bg-brand-dark transition-colors whitespace-nowrap shadow-2xs shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAddingThisItem ? "Adding..." : "+ Add Item"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}