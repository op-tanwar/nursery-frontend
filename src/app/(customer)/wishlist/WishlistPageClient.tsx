"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import PlantLoader from "@/components/customer/common/PlantLoader";
import { RootState } from "@/redux/store";
import { cartActionSuccess, setCartError } from "@/redux/slices/cartSlice";
import { wishlistToggleSuccess, setWishlistError, clearWishlistData } from "@/redux/slices/wishlistSlice";
import { cartService, wishlistService } from "@/services/cartWishlistService";
import { StarRating } from "@/components/customer/common/ShopItemCard";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { wishlist } = useSelector((state: RootState) => state.wishlist);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Sync with DB architecture on mount
  useEffect(() => {
    const fetchFreshWishlist = async () => {
      try {
        if (wishlistService.getMyWishlist) {
          const response = await wishlistService.getMyWishlist();
          if (response?.success) {
            dispatch(wishlistToggleSuccess({ wishlist: response.wishlist }));
          }
        }
      } catch (err) {
        console.error("Failed synchronization with wishlist server:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchFreshWishlist();
  }, [dispatch]);

  // Safely extracting array matching your multi-product schema
  const currentWishlist = wishlist as any;
  const wishlistItems = currentWishlist?.items || currentWishlist?.plants || (Array.isArray(wishlist) ? wishlist : []);
  const wishlistCount = wishlistItems.length;
  const hasItems = wishlistCount > 0;

  const handleRemoveFromWishlist = async (id: string, name: string) => {
    setProcessingId(id);
    try {
      // Backend controller will now return populated wishlist data
      const response = await wishlistService.toggleWishlistItem(id);
      if (response.success) {
        dispatch(wishlistToggleSuccess({ wishlist: response.wishlist, message: response.message }));
        toast.success(`${name} removed from wishlist`);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to update wishlist";
      dispatch(setWishlistError(errorMsg));
      toast.error(errorMsg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMoveToCart = async (id: string, name: string) => {
    setProcessingId(id);
    try {
      const cartResponse = await cartService.addToCart(id, 1);
      if (cartResponse.success) {
        dispatch(cartActionSuccess({ cart: cartResponse.cart }));

        const wishlistResponse = await wishlistService.toggleWishlistItem(id);
        if (wishlistResponse.success) {
          dispatch(wishlistToggleSuccess({ wishlist: wishlistResponse.wishlist }));
        }
        toast.success(`Successfully moved ${name} to Cart!`);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to move item to cart";
      dispatch(setCartError(errorMsg));
      toast.error(errorMsg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleClearWholeWishlist = async () => {
    if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
      setIsClearingAll(true);
      try {
        const response = await wishlistService.clearWishlist();
        if (response.success) {
          dispatch(clearWishlistData());
          toast.success(response.message || "Wishlist cleared successfully!");
        }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || "Failed to clear wishlist";
        dispatch(setWishlistError(errorMsg));
        toast.error(errorMsg);
      } finally {
        setIsClearingAll(false);
      }
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hero" >
        {/* <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div> */}
        <PlantLoader fullScreen={false} text="Preparing your wishlist..." />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-hero text-foreground overflow-x-hidden font-sans py-12 pt-32 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* PREMIUM WISHLIST HERO SECTION */}
        <div className="rounded-3xl bg-gradient-to-br from-brand-dark via-[#114225] to-brand-primary text-white p-8 sm:p-12 mb-10 relative overflow-hidden shadow-xs">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,245,233,0.15),transparent_45%)]" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-light bg-brand-light/10 px-3 py-1 rounded-full border border-brand-light/20 inline-block mb-4 select-none">
                💚 Curated Collection • {wishlistCount} {wishlistCount === 1 ? "Item" : "Items"}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight m-0 mb-3 leading-[1.1]">
                {hasItems ? "Your Green Favorites" : "Saved For Later"}
              </h1>
              <p className="m-0 text-slate-200 text-xs sm:text-sm leading-relaxed font-normal opacity-90">
                {hasItems
                  ? "Aapke pasandida premium plants aur custom hand-picked tools ek hi jagah par hain. Inhe apne space ka hissa banane ke liye bas ek click door hain."
                  : "Apne flat ya office desktop ke liye best standard plants explore karein, aur dil aane par unhe yahan save karne ke liye heart tap karein."
                }
              </p>
            </div>

            {hasItems && (
              <div className="md:pt-2 self-start md:self-auto">
                <button
                  type="button"
                  disabled={isClearingAll}
                  onClick={handleClearWholeWishlist}
                  className="whitespace-nowrap bg-white/10 hover:bg-red-600 text-white border border-white/20 hover:border-red-600 font-semibold py-2.5 px-5 rounded-xl text-xs tracking-wide transition-all duration-200 disabled:opacity-50 active:scale-95 shadow-sm"
                >
                  {isClearingAll ? "Clearing..." : "🧹 Clear Entire Wishlist"}
                </button>
              </div>
            )}
          </div>
        </div>

        {!hasItems ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-panel border border-line rounded-[24px] p-8 max-w-2xl mx-auto shadow-xs">
            <span className="text-7xl mb-6 select-none animate-pulse">💚</span>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-text max-w-sm mb-8 text-sm leading-relaxed">
              Tap the heart icon on your favorite items while browsing, and they’ll show up here waiting for you.
            </p>
            <Link
              href="/shop"
              className="bg-brand-primary text-white no-underline font-semibold py-3 px-8 rounded-xl transition-all duration-200 hover:bg-brand-dark shadow-sm active:scale-98 inline-flex items-center"
            >
              Explore Green Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((wItem: any) => {
              if (!wItem) return null;

              // Dynamic extraction fallback mapping check
              const item = wItem.product || wItem.plant || (wItem.name ? wItem : null);
              if (!item) return null;

              const itemId = item._id || item.id || wItem._id || wItem.id;

              // Backend Schema handles images array, coverImage, or dynamic string URLs
              const itemImgSrc = Array.isArray(item.images) && item.images.length > 0
                ? (item.images[0].url || item.images[0])
                : (item.coverImage?.url || item.emoji || item.image || null);

              const isImageUrl = typeof itemImgSrc === "string" && (itemImgSrc.startsWith("http") || itemImgSrc.startsWith("/"));
              const isMutating = processingId === itemId || isClearingAll;
              const itemSlug = item.slug || item.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-");

              const modelToShopType: Record<string, string> = {
                plant: "plants",
                pot: "pots",
                accessory: "accessories",
                gardeningtool: "gardening-tools",
                plantcare: "plant-care",
                seedsbulbs: "seeds-bulbs",
                plantstandsshelves: "plant-stands-shelves",
                artificialdriedplant: "artificial-dried-plants",
              };
              const modelKey = String(wItem.itemModel || "").toLowerCase().replace(/[\s_-]/g, "");
              const itemType =
                item.type?.toLowerCase() ||
                modelToShopType[modelKey] ||
                "plants";

              return (
                <div
                  key={itemId}
                  className={`group bg-panel border border-line rounded-[20px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(21,128,61,0.08)] relative ${isMutating ? "pointer-events-none opacity-70" : ""}`}
                >
                  {/* Card Image Wrapper */}
                  <div className="h-[200px] relative bg-gradient-to-br from-brand-light/40 to-brand-light/80 flex items-center justify-center overflow-hidden border-b border-line/10">
                    {" "}
                    {isImageUrl ? (
                      <div className="relative w-full h-full p-4">
                        <Image
                          src={itemImgSrc}
                          alt={item.name || "Product Image"}
                          fill
                          sizes="(max-w-[768px]) 50vw, 25vw"
                          className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <span className="text-6xl select-none transition-transform duration-300 group-hover:scale-115">
                        {itemImgSrc || "🌿"}
                      </span>
                    )}
                    {item.stock === 0 && (
                      <span className="absolute inset-0 bg-background/80 text-red-500 font-bold text-xs flex items-center justify-center tracking-wide uppercase select-none backdrop-blur-xs">
                        Out of Stock
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => handleRemoveFromWishlist(itemId, item.name)}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-red-50 hover:text-red-500 text-muted-text border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-all duration-200 shadow-xs z-10 disabled:opacity-50 active:scale-90"
                      title="Remove from Wishlist"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Product Details Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="inline-block text-[10px] font-semibold py-[2px] px-[8px] bg-brand-light/30 text-brand-primary rounded-full mb-2 uppercase tracking-wider select-none">
                        {item.category || wItem.itemModel || "Green Item"}
                      </span>
                      <h3 className="m-0 mb-1 text-base font-bold text-foreground leading-snug truncate">
                        <Link href={`/shop/${itemType}/${itemSlug}`} className="text-foreground no-underline hover:text-brand-primary transition-colors">
                          {item.name}
                        </Link>
                      </h3>

                      <div className="flex items-center gap-1 mt-1 mb-3">
                        <StarRating rating={item.rating || 5} />
                        <span className="text-xs text-muted-text">({item.reviews || 0})</span>
                      </div>

                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-lg font-extrabold text-brand-primary">
                          ₹{item.price?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>

                    {/* Actions buttons footer */}
                    <div className="space-y-2 mt-auto">
                      <button
                        type="button"
                        disabled={item.stock === 0 || isMutating}
                        onClick={() => handleMoveToCart(itemId, item.name)}
                        className="w-full bg-brand-primary text-white font-semibold py-2.5 rounded-xl border-none cursor-pointer text-xs tracking-wide transition-all duration-200 hover:bg-brand-dark active:scale-[0.98] disabled:bg-brand-primary/40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-1.5"
                      >
                        {processingId === itemId ? "Moving..." : <>🛒 Move to Cart</>}
                      </button>

                      <Link
                        href={`/shop/${itemType}/${itemSlug}`}
                        className="block text-center w-full bg-background hover:bg-line/20 border border-line text-foreground font-semibold py-2.5 rounded-xl no-underline text-xs tracking-wide transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}