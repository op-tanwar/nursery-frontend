"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { MapPin, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import ShopItemCard, { ShopItemType } from "@/components/customer/common/ShopItemCard";
import { productService } from "@/services/productService";
import { determineProductTag } from "@/utils/productBadge";
import { useAppDispatch } from "@/redux/hooks";
import { openPincodeModal } from "@/redux/slices/uiSlice";

interface FeaturedSectionClientProps {
  category: "plants" | "pots";
  title: string;
  subtitle: string;
  viewAllHref: string;
  viewAllText: string;
  bgColor?: string;
  initialItems: ShopItemType[];
}

/**
 * 🌿 Standardized mapper for raw backend Product documents to UI ShopItemType
 */
function mapProductToShopItem(product: any, category: "plants" | "pots"): ShopItemType {
  const nurseryName =
    product.vendorName ||
    (typeof product.vendor === "string"
      ? product.vendor
      : product.vendor?.name || product.vendor?.businessName) ||
    product.businessName ||
    (typeof product.nursery === "string"
      ? product.nursery
      : product.nursery?.name || product.nursery?.businessName) ||
    "Urban Nursery";

  const nurseryLoc =
    (typeof product.vendor === "object"
      ? product.vendor?.location || product.vendor?.city
      : null) ||
    (typeof product.nursery === "object"
      ? product.nursery?.location || product.nursery?.city
      : null) ||
    product.city ||
    "Indore";

  const vendorId =
    product.vendorId ||
    (typeof product.vendor === "object"
      ? product.vendor?._id || product.vendor?.id
      : null) ||
    (typeof product.nursery === "object"
      ? product.nursery?._id || product.nursery?.id
      : null) ||
    (typeof product.nursery === "string" ? product.nursery : null);

  const vendorSlug =
    product.vendorSlug ||
    (typeof product.vendor === "object" ? product.vendor?.slug : null) ||
    (typeof product.nursery === "object" ? product.nursery?.slug : null) ||
    nurseryName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const calculatedStock = product.stock ?? 0;
  const generatedSlug =
    product.slug ||
    product.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  return {
    id: product._id || product.id,
    slug: generatedSlug,
    type: category,
    category: product.category || (category === "plants" ? "Plants" : "Pots"),
    name: product.name,
    vendor: `${nurseryName}, ${nurseryLoc || "Indore"}`,
    vendorName: nurseryName,
    vendorId: vendorId ? String(vendorId) : undefined,
    vendorSlug: vendorSlug ? String(vendorSlug) : undefined,
    nurseryId: product.nurseryId ? String(product.nurseryId) : undefined,
    price:
      product.discountPrice > 0 && product.discountPrice < product.price
        ? product.discountPrice
        : product.price || 0,
    originalPrice:
      product.discountPrice > 0 && product.discountPrice < product.price
        ? product.price || 0
        : null,
    rating: product.ratingsAverage || product.ratings || 4.8,
    reviews: product.ratingsQuantity || product.numOfReviews || 0,
    badge: calculatedStock > 0 ? (category === "plants" ? "Fresh Stock" : "Handmade") : "Out of Stock",
    badgeColor: category === "plants" ? "#15803d" : "#0369a1",
    tag: determineProductTag({
      ...product,
      stock: calculatedStock,
      ratings: product.ratingsAverage || product.ratings,
      reviewsCount: product.ratingsQuantity || product.numOfReviews,
    }),
    emoji:
      product.coverImage?.url ||
      product.images?.[0]?.url ||
      (category === "plants" ? "🌿" : "🏺"),
    isBestSeller: product.isBestSeller ?? product.isBestseller ?? true,
    isBestseller: product.isBestseller ?? product.isBestSeller ?? true,
    isFeatured: product.isFeatured ?? true,
    isNewArrival: product.isNewArrival,
    totalSales: product.totalSales ?? product.salesCount ?? product.sold,
    salesCount: product.salesCount ?? product.totalSales ?? product.sold,
    tags: product.tags,
    stock: calculatedStock,
    ratings: product.ratingsAverage || product.ratings,
    reviewsCount: product.ratingsQuantity || product.numOfReviews,
    discountPrice: product.discountPrice,
    createdAt: product.createdAt,
  };
}

export default function FeaturedSectionClient({
  category,
  title,
  subtitle,
  viewAllHref,
  viewAllText,
  bgColor = "bg-[#f8fdf9]",
  initialItems,
}: FeaturedSectionClientProps) {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<ShopItemType[]>(initialItems || []);
  const [pincode, setPincode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch best-sellers for active pincode
  const fetchProductsForPincode = useCallback(
    async (pin: string | null) => {
      if (!pin) {
        setItems(initialItems || []);
        return;
      }

      setIsLoading(true);
      try {
        const res = await productService.getFeaturedProducts({
          category,
          pincode: pin,
          limit: 8,
        });

        const rawList =
          res?.products ||
          (category === "plants" ? res?.plants : res?.pots) ||
          (Array.isArray(res) ? res : []);

        if (Array.isArray(rawList) && rawList.length > 0) {
          const mapped = rawList.map((p) => mapProductToShopItem(p, category));
          setItems(mapped);
        } else {
          // If no local products serviceable for this pincode
          setItems([]);
        }
      } catch (err) {
        console.warn(`[FeaturedSectionClient] Failed to fetch featured ${category} for ${pin}:`, err);
        // Fallback gracefully to initial SSR items
        setItems(initialItems || []);
      } finally {
        setIsLoading(false);
      }
    },
    [category, initialItems]
  );

  // Hydration-safe localStorage check on mount
  useEffect(() => {
    const savedPin = typeof window !== "undefined" ? localStorage.getItem("hyperlocal_pincode") : null;
    if (savedPin && /^\d{6}$/.test(savedPin)) {
      setPincode(savedPin);
      fetchProductsForPincode(savedPin);
    }
  }, [fetchProductsForPincode]);

  // Reactive listener for live pincode changes without page reload
  useEffect(() => {
    const handlePincodeEvent = (e: any) => {
      const newPin = e?.detail !== undefined ? e.detail : localStorage.getItem("hyperlocal_pincode");
      if (newPin && /^\d{6}$/.test(newPin)) {
        setPincode(newPin);
        fetchProductsForPincode(newPin);
      } else {
        setPincode(null);
        setItems(initialItems || []);
      }
    };

    window.addEventListener("pincode-changed", handlePincodeEvent);
    window.addEventListener("storage", handlePincodeEvent);

    return () => {
      window.removeEventListener("pincode-changed", handlePincodeEvent);
      window.removeEventListener("storage", handlePincodeEvent);
    };
  }, [fetchProductsForPincode, initialItems]);

  const displayedItems = useMemo(() => items.slice(0, 8), [items]);

  return (
    <>
      <section className={`py-16 md:py-20 px-4 sm:px-6 ${bgColor} transition-colors duration-300`}>
        <div className="w-full max-w-[1200px] mx-auto">
          {/* Header Block with Dynamic Pincode Context */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">

                <span className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-bold text-emerald-700 tracking-[0.06em] uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {subtitle} • Bestsellers
                </span>
              </div>

              <h2 className="text-[clamp(24px,3.5vw,38px)] font-black m-0 tracking-[-0.02em] text-slate-900 leading-tight">
                {title}
              </h2>
            </div>

            <Link
              href={viewAllHref}
              className="bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white py-2.5 px-5 sm:px-6 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 hidden md:inline-flex items-center gap-2 shadow-xs no-underline "
            >
              <span>{viewAllText}</span>
            </Link>
          </div>

          {/* Loading Shimmer Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex flex-col bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-xs"
                >
                  <div className="w-full aspect-square bg-slate-100/90" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                    <div className="h-4 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="h-5 w-16 bg-slate-200 rounded" />
                      <div className="h-8 w-20 bg-slate-200 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedItems.length > 0 ? (
            /* Product Cards Grid */
            <div >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedItems.map((item, i) => (
                  <ShopItemCard key={item.id || item._id || i} item={item} index={i} />
                ))}
              </div>
              <div className="flex justify-center items-center">
                <Link
                  href={viewAllHref}
                  className="bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white py-2.5 px-5 sm:px-6 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 md:hidden mt-4 inline-flex items-center gap-2 shadow-xs no-underline "
                >
                  <span>{viewAllText}</span>
                </Link>
              </div>
            </div>

          ) : (
            /* Clean Empty State with Action CTA */
            <div className="text-center py-14 px-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                {category === "plants" ? "🌱" : "🏺"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 m-0 mb-1">
                  No {category === "plants" ? "live plants" : "pots"} currently serviceable in {pincode}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto m-0 leading-relaxed">
                  Live botanicals require certified nurseries within delivery radius to guarantee arrival alive. Try changing your pincode or browse our Pan-India catalog.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => dispatch(openPincodeModal())}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Change Delivery Pincode
                </button>
                <Link
                  href={viewAllHref}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition no-underline"
                >
                  Browse Pan-India Catalog
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
