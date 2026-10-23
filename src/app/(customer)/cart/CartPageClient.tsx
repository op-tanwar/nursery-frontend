"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Trash, Minus, Plus, ShoppingBag, ShieldCheck, Tag } from "lucide-react";
import PlantLoader from "@/components/customer/common/PlantLoader";
import { RootState } from "@/redux/store";
import {
  cartActionSuccess,
  setCartError,
  loadGuestCart,
  updateGuestCartQuantityAction,
  removeFromGuestCartAction,
} from "@/redux/slices/cartSlice";
import { cartService } from "@/services/cartWishlistService";
import { calculateCartTotals, getEffectivePrice, CategoryTaxConfig } from "@/utils/pricing";
import { taxService } from "@/services/taxService";

interface ProductImage {
  url: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  category?: string;
  stock: number;
  images?: ProductImage[];
  coverImage?: ProductImage;
}

interface CartItem {
  product: Product | null;
  quantity: number;
  itemModel?: string;
  category?: string;
}

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { cart } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const profile = useSelector((state: any) => state.auth?.user?.profile || state.profile?.profile);
  const userPincode = profile?.pincode || profile?.shippingAddress?.pincode || null;

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [taxMap, setTaxMap] = useState<Record<string, CategoryTaxConfig> | undefined>(undefined);

  useEffect(() => {
    const fetchFreshCart = async () => {
      try {
        if (!isAuthenticated) {
          // 🛒 Guest Cart Mode: Load from localStorage without triggering 401
          dispatch(loadGuestCart());
          return;
        }

        const response = await cartService.getMyCart();
        if (response?.success && response.cart) {
          dispatch(cartActionSuccess({ cart: response.cart }));
        }
      } catch (err) {
        console.error("Failed synchronization with cart server:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    const fetchCategoryTaxes = async () => {
      try {
        const res: any = await taxService.getAllTaxes();
        const list = res?.taxes || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(list) && list.length > 0) {
          const map: Record<string, CategoryTaxConfig> = {};
          list.forEach((t: any) => {
            map[t.category] = { taxPercentage: t.taxPercentage, isTaxInclusive: t.isTaxInclusive };
            if (t.itemModel) {
              map[t.itemModel] = { taxPercentage: t.taxPercentage, isTaxInclusive: t.isTaxInclusive };
            }
          });
          setTaxMap(map);
        }
      } catch (taxErr) {
        console.warn("Could not fetch dynamic category taxes, using statutory defaults:", taxErr);
      }
    };

    fetchFreshCart();
    fetchCategoryTaxes();
  }, [dispatch, isAuthenticated]);

  const items = useMemo(() => {
    return ((cart?.items || []) as CartItem[]).filter((i) => Boolean(i.product));
  }, [cart?.items]);

  // Authoritative paise-safe client calculation mirroring backend rules
  const totals = useMemo(() => {
    return calculateCartTotals(items, taxMap);
  }, [items, taxMap]);

  const handleQuantityChange = async (productId: string, currentQty: number, targetQty: number, maxStock: number) => {
    if (targetQty < 1 || processingId) return;
    if (targetQty > maxStock) {
      toast.error(`Only ${maxStock} units available in stock`);
      return;
    }

    if (!isAuthenticated) {
      dispatch(updateGuestCartQuantityAction({ productId, quantity: targetQty }));
      return;
    }

    setProcessingId(productId);
    try {
      const response = await cartService.updateCartQuantity(productId, targetQty);
      if (response?.success) {
        dispatch(cartActionSuccess({ cart: response.cart }));
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to update quantity";
      dispatch(setCartError(errorMsg));
      toast.error(errorMsg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveItem = async (productId: string, name: string) => {
    if (processingId || !cart) return;

    if (!isAuthenticated) {
      dispatch(removeFromGuestCartAction({ productId }));
      toast.success(`${name} removed from cart`);
      return;
    }

    setProcessingId(productId);

    const currentItems = cart.items || [];
    const localFilteredItems = currentItems.filter((item: any) => item.product?._id !== productId);

    const optimisticCart = {
      ...cart,
      _id: cart._id || "",
      user: cart.user || "",
      items: localFilteredItems,
    };

    dispatch(cartActionSuccess({ cart: optimisticCart }));

    try {
      const response = await cartService.removeFromCart(productId);
      if (response?.success && response.cart) {
        dispatch(cartActionSuccess({ cart: response.cart }));
        toast.success(`${name} removed from cart`);
      } else {
        dispatch(cartActionSuccess({ cart: optimisticCart }));
      }
    } catch (err: any) {
      const rollbackCart = {
        ...cart,
        _id: cart._id || "",
        user: cart.user || "",
        items: currentItems,
      };
      dispatch(cartActionSuccess({ cart: rollbackCart }));

      const errorMsg = err?.response?.data?.message || "Failed to remove item";
      dispatch(setCartError(errorMsg));
      toast.error(errorMsg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;

    if (!isAuthenticated) {
      toast("Please log in to proceed to checkout", { icon: "🔐" });
      router.push("/login?redirect=/checkout");
      return;
    }

    toast.loading("Preparing checkout order...", { id: "checkout-redirect", duration: 1000 });
    router.push("/checkout");
  };


  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hero">
        <PlantLoader fullScreen={false} text="Preparing your cart ..." />
      </div>
    );
  }

  const hasItems = items.length > 0;

  return (
    <main className="min-h-screen bg-hero text-foreground antialiased py-12 pt-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* DYNAMIC CART HERO SECTION */}
        <div className="rounded-3xl bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary text-white p-8 sm:p-12 mb-10 relative overflow-hidden shadow-xs">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,245,233,0.15),transparent_45%)]" />
          <div className="relative z-10 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-light bg-brand-light/10 px-3 py-1 rounded-full border border-brand-light/20 inline-block mb-4 select-none">
              🛒 Order Summary {userPincode && `• Delivering to ${userPincode}`}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight m-0 mb-3 leading-[1.1]">
              {hasItems ? "Review Your Green Selection" : "Your Cart Awaits"}
            </h1>
            <p className="m-0 text-slate-200 text-xs sm:text-sm leading-relaxed font-normal opacity-90">
              {hasItems
                ? `You have ${totals.itemsCount} items in your bag. Fresh botanical specimens packed securely for transit.`
                : "Explore our certified nursery collections to discover healthy plants for your home."
              }
            </p>
          </div>
        </div>

        {!hasItems ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-panel border border-line rounded-[24px] p-8 max-w-2xl mx-auto shadow-xs">
            <span className="text-7xl mb-6 select-none">🛒</span>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-text max-w-sm mb-8 text-sm leading-relaxed">
              Looks like you haven't added anything to your cart yet. Explore our catalog and find your perfect botanical match!
            </p>
            <Link
              href="/shop"
              className="bg-brand-primary text-white no-underline font-semibold py-3 px-8 rounded-xl transition-all duration-200 hover:bg-brand-dark shadow-sm active:scale-98 inline-flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" /> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT: ITEMS LIST */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item, index) => {
                if (!item.product) return null;

                const product = item.product;
                const effectivePrice = getEffectivePrice(product.price, product.discountPrice);
                const hasItemDiscount = Boolean(product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price);
                const itemSavings = hasItemDiscount ? (product.price - effectivePrice) * item.quantity : 0;

                const imgSource = product.images?.[0]?.url || product.coverImage?.url || "";
                const isImageUrl = imgSource.startsWith("http") || imgSource.startsWith("/");
                const isItemMutating = processingId === product._id;

                return (
                  <div
                    key={product._id || index}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-panel border border-line rounded-[20px] transition-all duration-200 hover:border-line/80 gap-4 relative ${
                      isItemMutating ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="h-20 w-20 relative rounded-xl bg-brand-light/40 flex-shrink-0 flex items-center justify-center overflow-hidden border border-line/40">
                        {isImageUrl ? (
                          <Image
                            src={imgSource}
                            alt={product.name}
                            fill
                            sizes="80px"
                            className="object-contain p-2"
                          />
                        ) : (
                          <span className="text-3xl select-none">📦</span>
                        )}
                      </div>
                      <div className="truncate">
                        <h3 className="text-base font-bold text-foreground truncate max-w-[200px] sm:max-w-xs m-0">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-text mt-1 capitalize m-0">
                          Category: <span className="text-foreground/80 font-medium">{item.itemModel || "Item"}</span>
                        </p>
                        
                        {/* Price Breakdown per Item */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-sm font-extrabold text-brand-primary">
                            ₹{effectivePrice.toLocaleString("en-IN")}
                          </span>
                          {hasItemDiscount && (
                            <>
                              <span className="text-xs text-muted-text line-through">
                                ₹{product.price.toLocaleString("en-IN")}
                              </span>
                              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Save ₹{(product.price - effectivePrice).toLocaleString("en-IN")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-none pt-3 sm:pt-0 border-line/40">

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-line rounded-xl bg-background overflow-hidden h-9 shadow-2xs">
                        <button
                          type="button"
                          disabled={item.quantity <= 1 || isItemMutating}
                          onClick={() => handleQuantityChange(product._id, item.quantity, item.quantity - 1, product.stock || 99)}
                          className="px-3 hover:bg-line/20 transition-colors border-none cursor-pointer text-foreground disabled:opacity-30 disabled:cursor-not-allowed h-full bg-transparent flex items-center justify-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold select-none text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= (product.stock || 99) || isItemMutating}
                          onClick={() => handleQuantityChange(product._id, item.quantity, item.quantity + 1, product.stock || 99)}
                          className="px-3 hover:bg-line/20 transition-colors border-none cursor-pointer text-foreground disabled:opacity-30 disabled:cursor-not-allowed h-full bg-transparent flex items-center justify-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right min-w-[80px]">
                        <p className="text-base font-extrabold text-foreground m-0">
                          ₹{(effectivePrice * item.quantity).toLocaleString("en-IN")}
                        </p>
                        {itemSavings > 0 && (
                          <p className="text-[10px] text-emerald-600 font-semibold m-0 mt-0.5">
                            Saved ₹{itemSavings.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>

                      {/* Delete Action */}
                      <button
                        type="button"
                        disabled={isItemMutating}
                        onClick={() => handleRemoveItem(product._id, product.name)}
                        className="p-2 text-muted-text hover:text-red-600 transition-colors border-none cursor-pointer bg-transparent rounded-lg active:scale-95 disabled:opacity-40"
                        title="Remove Item"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: COMPREHENSIVE SUMMARY CARD */}
            <div className="lg:col-span-4 bg-panel border border-line rounded-[24px] p-6 sticky top-6 shadow-xs space-y-5">
              <h2 className="text-lg font-bold text-foreground m-0 tracking-tight">Order Summary</h2>

              <div className="space-y-3 text-sm border-b border-line pb-4">
                {/* Original MRP */}
                <div className="flex justify-between text-muted-text">
                  <span>Original Price (MRP)</span>
                  <span className="text-foreground font-medium">₹{totals.originalTotal.toLocaleString("en-IN")}</span>
                </div>

                {/* Total Savings / Discount */}
                {totals.hasSavings && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Total Savings ({totals.savingsPercent}% off)
                    </span>
                    <span>-₹{totals.discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {/* Subtotal after discounts */}
                <div className="flex justify-between text-muted-text">
                  <span>Subtotal ({totals.itemsCount} items)</span>
                  <span className="text-foreground font-semibold">₹{totals.subtotal.toLocaleString("en-IN")}</span>
                </div>

                {/* Estimated Category Tax / GST */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-muted-text">
                    <span className="flex items-center gap-1.5">
                      <span>Estimated GST</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-1.5 py-0.5 rounded border border-emerald-200/50">
                        Category Slabs
                      </span>
                    </span>
                    <span className="text-foreground font-semibold">₹{totals.tax.toLocaleString("en-IN")}</span>
                  </div>

                  {/* Category-wise GST Breakdown */}
                  {totals.categoryTaxBreakdown.length > 0 && (
                    <div className="pl-2.5 border-l-2 border-slate-200/80 space-y-1 text-[11px] text-slate-500 py-0.5">
                      {totals.categoryTaxBreakdown.map((b) => (
                        <div key={b.category} className="flex justify-between items-center">
                          <span>
                            {b.category} ({b.taxRatePercentage}% GST{b.isTaxInclusive ? " incl." : ""})
                          </span>
                          <span className="font-medium text-slate-700">
                            {b.taxRatePercentage === 0 ? "Exempt (₹0)" : `₹${b.taxAmount.toLocaleString("en-IN")}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Shipping Fee */}
                <div className="flex justify-between text-muted-text">
                  <span>Delivery & Handling</span>
                  <span className="text-foreground font-medium">
                    {totals.shipping === 0 ? (
                      <span className="text-emerald-600 font-bold tracking-wide">FREE</span>
                    ) : (
                      `₹${totals.shipping.toLocaleString("en-IN")}`
                    )}
                  </span>
                </div>

                {totals.shipping > 0 && totals.subtotal < 500 && (
                  <div className="text-[11px] text-brand-primary bg-brand-light/30 p-2.5 rounded-xl font-medium border border-brand-primary/10">
                    💡 Add <b>₹{(500 - totals.subtotal).toLocaleString("en-IN")}</b> more to unlock <b>FREE Delivery</b>!
                  </div>
                )}
              </div>

              {/* Final Payable Amount */}
              <div className="flex justify-between items-baseline pt-1">
                <div>
                  <span className="text-base font-bold text-foreground block">Final Payable Amount</span>
                  <span className="text-[11px] text-muted-text">Includes all taxes and delivery</span>
                </div>
                <span className="text-2xl font-black text-brand-primary">
                  ₹{totals.grandTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                type="button"
                disabled={processingId !== null || items.length === 0}
                onClick={handleProceedToCheckout}
                className="w-full bg-brand-primary text-white font-semibold py-3.5 rounded-xl border-none cursor-pointer text-sm tracking-wide transition-colors duration-200 hover:bg-brand-dark active:scale-[0.99] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Proceed to Checkout
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-text pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Secure Payment • Razorpay Verified</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}