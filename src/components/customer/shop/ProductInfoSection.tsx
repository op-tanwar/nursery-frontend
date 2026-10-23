"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Star,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  Building2,
  Truck,
  Sun,
  Droplets,
  PawPrint,
  ShieldAlert,
  Sparkles,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Leaf,
  Scale,
  Calendar,
  Clock,
  Sprout,
  Flame,
} from "lucide-react";

// Redux Actions & Cart Service
import { RootState } from "@/redux/store";
import { cartActionSuccess, setCartError, addToGuestCartAction } from "@/redux/slices/cartSlice";
import { cartService } from "@/services/cartWishlistService";
import { normalizeItemModel } from "@/utils/guestCart";

interface ProductInfoSectionProps {
  id: string;
  type: string;
  category: string;
  name: string;
  rating: number;
  reviews: number;
  vendor: string | { name?: string; businessName?: string; _id?: string; id?: string; slug?: string; location?: string };
  vendorId?: string;
  vendorSlug?: string;
  nurseryId?: string;
  price: number;
  originalPrice: number | null;
  discountPercentage: number | null;
  description: string;
  descriptionOption?: {
    short: string;
    points: string[];
  };
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  item?: any;
}

export default function ProductInfoSection({
  id,
  type,
  category,
  name,
  rating,
  reviews,
  vendor,
  vendorId,
  vendorSlug,
  nurseryId,
  price,
  originalPrice,
  discountPercentage,
  description,
  descriptionOption,
  quantity,
  setQuantity,
  item,
}: ProductInfoSectionProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isNotified, setIsNotified] = useState(false);

  const isOutOfStock = typeof item?.stock === "number" && item.stock <= 0;

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsNotified(true);
    toast.success(`We will notify you as soon as ${name} is back in stock!`);
  };

  // Compute key specification highlight badges for at-a-glance recognition
  const quickHighlights: { label: string; icon: React.ReactNode; variant: string }[] = [];
  if (item) {
    if (item.lightRequirement) {
      quickHighlights.push({
        label: item.lightRequirement,
        icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
        variant: "bg-amber-50 text-amber-800 border-amber-200/70",
      });
    }
    if (item.wateringSchedule) {
      quickHighlights.push({
        label: item.wateringSchedule,
        icon: <Droplets className="w-3.5 h-3.5 text-blue-500" />,
        variant: "bg-blue-50 text-blue-800 border-blue-200/70",
      });
    }
    if (typeof item.isPetFriendly === "boolean") {
      quickHighlights.push({
        label: item.isPetFriendly ? "Pet Friendly" : "Keep Away From Pets",
        icon: item.isPetFriendly ? (
          <PawPrint className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
        ),
        variant: item.isPetFriendly
          ? "bg-emerald-50 text-emerald-800 border-emerald-200/70"
          : "bg-rose-50 text-rose-800 border-rose-200/70",
      });
    }
    if (item.maintenanceLevel) {
      quickHighlights.push({
        label: `${item.maintenanceLevel} Care`,
        icon: <Sparkles className="w-3.5 h-3.5 text-emerald-600" />,
        variant: "bg-emerald-50/70 text-emerald-800 border-emerald-200/60",
      });
    }
    if (item.material || item.specifications?.material) {
      quickHighlights.push({
        label: item.material || item.specifications.material,
        icon: <Layers className="w-3.5 h-3.5 text-amber-600" />,
        variant: "bg-amber-50/70 text-amber-800 border-amber-200/60",
      });
    }
    if (item.hasDrainageHole) {
      quickHighlights.push({
        label: "Drainage Hole Included",
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        variant: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
      });
    }
    if (item.warrantyMonths && Number(item.warrantyMonths) > 0) {
      quickHighlights.push({
        label: `${item.warrantyMonths} Mo. Warranty`,
        icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
        variant: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
      });
    }
    if (item.isOrganic) {
      quickHighlights.push({
        label: "100% Organic",
        icon: <Leaf className="w-3.5 h-3.5 text-emerald-600" />,
        variant: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
      });
    }
    if (item.volumeOrWeight) {
      quickHighlights.push({
        label: item.volumeOrWeight,
        icon: <Scale className="w-3.5 h-3.5 text-blue-500" />,
        variant: "bg-blue-50 text-blue-800 border-blue-200/70",
      });
    }
    if (item.sowingSeason) {
      const s = Array.isArray(item.sowingSeason) ? item.sowingSeason[0] : item.sowingSeason;
      if (s) {
        quickHighlights.push({
          label: `${s} Sowing`,
          icon: <Calendar className="w-3.5 h-3.5 text-lime-600" />,
          variant: "bg-lime-50 text-lime-800 border-lime-200/70",
        });
      }
    }
    if (item.germinationTime) {
      quickHighlights.push({
        label: item.germinationTime,
        icon: <Clock className="w-3.5 h-3.5 text-blue-500" />,
        variant: "bg-blue-50 text-blue-800 border-blue-200/70",
      });
    }
    if (item.tierCount && Number(item.tierCount) > 1) {
      quickHighlights.push({
        label: `${item.tierCount} Tiers`,
        icon: <Layers className="w-3.5 h-3.5 text-amber-600" />,
        variant: "bg-amber-50 text-amber-800 border-amber-200/70",
      });
    }
    if (item.specifications?.washable) {
      quickHighlights.push({
        label: "Washable",
        icon: <Droplets className="w-3.5 h-3.5 text-blue-500" />,
        variant: "bg-blue-50 text-blue-800 border-blue-200/70",
      });
    }
  }

  // 1. Resolve vendor display name safely
  const rawVendorName =
    (typeof vendor === "string" ? vendor : vendor?.name || vendor?.businessName) ||
    "Certified Nursery";

  const displayVendorName = String(rawVendorName).split(",")[0].trim() || "Certified Nursery";

  // 2. Resolve vendor link target (slug or ID)
  const vendorObj =
    typeof vendor === "object" && vendor !== null
      ? vendor
      : typeof item?.vendor === "object" && item?.vendor !== null
      ? item.vendor
      : typeof item?.nursery === "object" && item?.nursery !== null
      ? item.nursery
      : null;

  const targetVendorIdentifier =
    vendorSlug ||
    vendorObj?.slug ||
    vendorObj?.nurseryId ||
    vendorObj?._id ||
    vendorObj?.id ||
    vendorId ||
    nurseryId ||
    item?.vendorId ||
    item?.nurseryId ||
    (typeof vendor === "string" && vendor.trim() !== "" && vendor !== "undefined" ? vendor.trim() : null) ||
    (typeof item?.nursery === "string" && item.nursery.trim() !== "" && item.nursery !== "undefined"
      ? item.nursery.trim()
      : null) ||
    (displayVendorName && displayVendorName !== "Certified Nursery"
      ? displayVendorName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")
      : null);

  const vendorHref =
    targetVendorIdentifier && targetVendorIdentifier !== "undefined" ? `/vendor/${targetVendorIdentifier}` : null;

  // 🛒 Add To Cart Handler
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAddingToCart || isBuyingNow) return;

    setIsAddingToCart(true);
    try {
      if (!isAuthenticated) {
        // 🛒 Guest Mode: add directly to localStorage and mirror to Redux
        const imageList = item?.images?.length
          ? item.images
          : item?.coverImage
          ? [item.coverImage]
          : item?.emoji?.startsWith("http") || item?.emoji?.startsWith("/")
          ? [{ url: item.emoji }]
          : [];

        dispatch(
          addToGuestCartAction({
            product: {
              _id: id,
              name,
              price: originalPrice || price,
              discountPrice: originalPrice && originalPrice > price ? price : undefined,
              images: imageList,
              coverImage: item?.coverImage || imageList[0],
              stock: typeof item?.stock === "number" ? item.stock : 99,
              slug: item?.slug || "",
              category,
              emoji: item?.emoji,
            },
            quantity,
            itemModel: normalizeItemModel(type || category),
            nursery: nurseryId || vendorId || "",
          })
        );
        toast.success(`${quantity} × ${name} added to cart!`);
      } else {
        const response = await cartService.addToCart(id, quantity);
        if (response.success) {
          dispatch(cartActionSuccess({ cart: response.cart, message: response.message }));
          toast.success(response.message || `${quantity} × ${name} added to bag!`);
        }
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to add item to bag";
      dispatch(setCartError(errorMsg));
      toast.error(errorMsg);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ⚡ Buy Now Handler
  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAddingToCart || isBuyingNow) return;

    setIsBuyingNow(true);
    try {
      if (!isAuthenticated) {
        // 🛒 Guest Mode: add to guest cart and redirect to login preserving checkout path
        const imageList = item?.images?.length
          ? item.images
          : item?.coverImage
          ? [item.coverImage]
          : item?.emoji?.startsWith("http") || item?.emoji?.startsWith("/")
          ? [{ url: item.emoji }]
          : [];

        dispatch(
          addToGuestCartAction({
            product: {
              _id: id,
              name,
              price: originalPrice || price,
              discountPrice: originalPrice && originalPrice > price ? price : undefined,
              images: imageList,
              coverImage: item?.coverImage || imageList[0],
              stock: typeof item?.stock === "number" ? item.stock : 99,
              slug: item?.slug || "",
              category,
              emoji: item?.emoji,
            },
            quantity,
            itemModel: normalizeItemModel(type || category),
            nursery: nurseryId || vendorId || "",
          })
        );
        toast.success("Proceeding to checkout...");
        router.push("/login?redirect=/checkout");
      } else {
        const response = await cartService.addToCart(id, quantity);
        if (response.success) {
          dispatch(cartActionSuccess({ cart: response.cart, message: response.message }));
          toast.success("Proceeding to checkout...");
          router.push("/checkout");
        }
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to process direct checkout";
      dispatch(setCartError(errorMsg));
      toast.error(errorMsg);
    } finally {
      setIsBuyingNow(false);
    }
  };


  return (
    <div className="md:col-span-7 lg:col-span-7 flex flex-col bg-white p-2 rounded-2xl">
      {/* Category & Type Pills */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
          {type}
        </span>
        <span className="text-xs font-semibold text-slate-400">
          • {category}
        </span>
      </div>

      {/* Product Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 m-0 mb-3 leading-snug">
        {name}
      </h1>

      {/* Rating & Nursery Sub-header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-4 mb-5 text-xs">
        <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-slate-800">{rating}</span>
          <span className="text-slate-400 font-medium">({reviews} reviews)</span>
        </div>
        <span className="text-slate-200">|</span>
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Nursery:</span>
          {vendorHref ? (
            <Link
              href={vendorHref}
              className="font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2 transition-colors cursor-pointer"
            >
              {displayVendorName}
            </Link>
          ) : (
            <span className="font-semibold text-slate-800">
              {displayVendorName}
            </span>
          )}
        </div>
      </div>

      {/* Price Card */}
      <div className="mb-6 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-100">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            ₹{price.toLocaleString()}
          </span>
          {originalPrice && discountPercentage !== null && (
            <>
              <span className="text-base text-slate-400 line-through font-semibold">
                ₹{originalPrice.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {discountPercentage}% OFF
              </span>
            </>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
            + GST applicable at checkout
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 m-0 mt-3 font-medium">
          <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Includes free safe-transit packaging & state environmental cess.</span>
        </div>
      </div>

      {/* Quick Category Specifications Highlights */}
      {quickHighlights.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {quickHighlights.map((badge, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-2xs ${badge.variant}`}
            >
              {badge.icon}
              <span>{badge.label}</span>
            </span>
          ))}
        </div>
      )}

      {/* Description Box */}
      <div className="mb-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal m-0">
          {descriptionOption?.short || description}
        </p>
        {/* {descriptionOption?.points && descriptionOption.points.length > 0 && (
          <ul className="mt-3 space-y-1.5 m-0 pl-4">
            {descriptionOption.points.map((point, idx) => (
              <li key={idx} className="text-xs text-slate-600 font-medium leading-relaxed list-disc">
                {point}
              </li>
            ))}
          </ul>
        )} */}
      </div>

      {/* Inventory Lifecycle: In-Stock vs Out-of-Stock */}
      {isOutOfStock ? (
        <div className="mt-4 p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Temporarily Out of Stock
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            A fresh healthy batch is currently propagating at our verified partner greenhouse. Enter your email to be immediately alerted when stock arrives.
          </p>
          {isNotified ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>You will receive an email as soon as fresh units are potted!</span>
            </div>
          ) : (
            <form onSubmit={handleNotifyMe} className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-emerald-600"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer border-none"
              >
                Notify When Available
              </button>
            </form>
          )}
        </div>
      ) : (
        <>
          {/* Quantity Selector Layer */}
          <div className="flex flex-col gap-2 mb-6">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Quantity
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden h-11">
                <button
                  disabled={quantity <= 1 || isAddingToCart || isBuyingNow}
                  onClick={() => setQuantity((q) => q - 1)}
                  className="w-11 h-full flex items-center justify-center bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed border-none cursor-pointer transition-colors active:bg-slate-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-900 select-none">
                  {quantity}
                </span>
                <button
                  disabled={isAddingToCart || isBuyingNow}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-11 h-full flex items-center justify-center bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed border-none cursor-pointer transition-colors active:bg-slate-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-3 py-2 rounded-xl">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0 animate-pulse" />
                <span>High Demand: Stock moving fast</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              disabled={isAddingToCart || isBuyingNow}
              onClick={handleAddToCart}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white border-none h-12 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-emerald-900/10 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isAddingToCart ? "Adding to Bag..." : "Add to Cart"}</span>
            </button>

            <button
              type="button"
              disabled={isAddingToCart || isBuyingNow}
              onClick={handleBuyNow}
              className="w-full bg-slate-900 hover:bg-black text-white border-none h-12 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 fill-current text-amber-400" />
              <span>{isBuyingNow ? "Processing..." : "Buy Now"}</span>
            </button>
          </div>
        </>
      )}

    </div>
  );
}