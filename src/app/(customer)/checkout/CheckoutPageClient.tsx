"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { ShoppingBag, CreditCard, Truck, ShieldCheck, Tag } from "lucide-react";
import toast from "react-hot-toast";

import { paymentService } from "@/services/paymentService";
import { cartService } from "@/services/cartWishlistService";
import { clearCartData } from "@/redux/slices/cartSlice";
import {
  startPaymentProcess,
  setRazorpayOrderSuccess,
  setPaymentVerificationStatus,
  setPaymentFailure
} from "@/redux/slices/paymentSlice";
import { calculateCartTotals, getEffectivePrice, CategoryTaxConfig } from "@/utils/pricing";
import { taxService } from "@/services/taxService";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);

  const cartState = useAppSelector((state) => state.cart);
  const cart = cartState?.cart || { items: [] };
  const rawCartItems = cart?.items || [];
  const cartItems = useMemo(() => {
    return rawCartItems.filter((item: any) => Boolean(item?.product));
  }, [rawCartItems]);

  const { isProcessing } = useAppSelector((state) => state.payment);
  const { user } = useAppSelector((state) => state.auth || { user: null });
  const profile = user ? (user as any).profile : null;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: ""
  });

  const [taxMap, setTaxMap] = useState<Record<string, CategoryTaxConfig> | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    const loadRazorpayScript = () => {
      if ((window as any).Razorpay) return;
      if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onerror = () => toast.error("Unable to load Razorpay payment gateway script.");
        document.body.appendChild(script);
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
        console.warn("Checkout tax fetch error, using statutory defaults:", taxErr);
      }
    };

    loadRazorpayScript();
    fetchCategoryTaxes();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || profile?.phone || "",
        address: prev.address || profile?.shippingAddress?.address || profile?.address || "",
        city: prev.city || profile?.shippingAddress?.city || profile?.city || "",
        state: prev.state || profile?.shippingAddress?.state || profile?.state || "",
        zipCode: prev.zipCode || profile?.shippingAddress?.pincode || profile?.pincode || ""
      }));
    }
  }, [user, profile]);

  // Authoritative paise-safe client calculation mirroring backend rules
  const totals = useMemo(() => {
    return calculateCartTotals(cartItems as any, taxMap);
  }, [cartItems, taxMap]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!(window as any).Razorpay) {
      toast.error("Razorpay SDK is not ready yet. Please refresh the page and try again.");
      return;
    }

    dispatch(startPaymentProcess());
    const toastId = toast.loading("Initializing secure payment session...");

    try {
      const cleanName = formData.fullName.replace(/\r?\n|\r/g, " ").trim();

      const explicitShippingFormat = {
        name: cleanName,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: "India",
        pinCode: formData.zipCode.trim()
      };

      // 🔒 ZERO TRUST ON PRICES: Send ONLY product IDs and quantities!
      // The server will fetch fresh prices directly from MongoDB.
      const serverOrderItems = cartItems.map((item: any) => ({
        productId: String(item.product?._id || item.product?.id),
        quantity: Math.max(1, Number(item.quantity) || 1),
        itemModel: item.itemModel || item.product?.itemModel || "Plant",
      }));

      const gatewayPayload = {
        orderItems: serverOrderItems,
        shippingInfo: explicitShippingFormat,
      };

      const responseData: any = await paymentService.initializeRazorpayOrder(gatewayPayload as any);

      const razorpayOrder = responseData?.order || responseData;

      if (!razorpayOrder || !razorpayOrder.id) {
        throw new Error(responseData?.message || "Failed to initialize payment gateway order from server.");
      }

      dispatch(setRazorpayOrderSuccess(razorpayOrder));
      toast.dismiss(toastId);

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: razorpayOrder.amount, // Authoritative paise calculated strictly on server
        currency: razorpayOrder.currency || "INR",
        name: "Urban Nursery",
        description: `Order checkout for ${totals.itemsCount} botanical item(s)`,
        order_id: razorpayOrder.id,
        theme: { color: "#15803d" },
        prefill: {
          name: cleanName,
          email: formData.email.trim(),
          contact: formData.phone.trim()
        },
        handler: async function (response) {
          const verifyToastId = toast.loading("Verifying payment and confirming order...");
          try {
            // 🔒 Cryptographic Verification & Snapshot Persistence
            const verificationPayload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              shippingInfo: explicitShippingFormat,
              orderItems: serverOrderItems,
              paymentInfo: {
                id: response.razorpay_payment_id,
                status: "captured",
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              }
            };

            await paymentService.verifyCryptographicSignature(verificationPayload as any);

            // Clear Cart from server and local client store
            try {
              await cartService.clearCart();
            } catch (cartApiErr) {
              console.error("Cart clear exception:", cartApiErr);
            }
            dispatch(clearCartData());

            dispatch(setPaymentVerificationStatus(true));
            toast.success("Order Placed Successfully! 🎉", { id: verifyToastId });

            router.push("/orders/me");
          } catch (verifyErr: any) {
            console.error("Order verification exception:", verifyErr);
            const errorMessage = verifyErr?.message || verifyErr?.response?.data?.message || "Order verification failed.";
            toast.error(errorMessage, { id: verifyToastId });
            dispatch(setPaymentFailure(errorMessage));
          }
        }
      };

      const razorpayWindowInstance = new (window as any).Razorpay(options);
      razorpayWindowInstance.on("payment.failed", function (response: any) {
        dispatch(setPaymentFailure(response.error?.description || "Payment cancelled."));
        toast.error(response.error?.description || "Payment was cancelled or failed.");
      });

      razorpayWindowInstance.open();

    } catch (err: any) {
      console.error("Checkout execution error:", err);
      const catchMsg = err?.message || "Payment initialization failed.";
      toast.dismiss(toastId);
      toast.error(catchMsg);
      dispatch(setPaymentFailure(catchMsg));
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground py-12 md:py-20 antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-brand-dark via-[#114225] to-brand-primary text-white p-8 sm:p-10 mb-10 relative overflow-hidden shadow-xs">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,245,233,0.15),transparent_45%)]" />
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight m-0 mb-2">Secure Checkout</h1>
            <p className="m-0 text-slate-200 text-xs sm:text-sm max-w-md opacity-90 leading-relaxed">
              Complete your delivery address and finalize your verified payment to complete your order.
            </p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-panel border border-line rounded-3xl p-8 max-w-md mx-auto">
            <span className="text-6xl mb-4 block select-none">🛒</span>
            <h2 className="text-xl font-bold mb-2">No items to checkout</h2>
            <p className="text-muted-text text-sm mb-6">Your shopping cart is currently empty.</p>
            <Link href="/shop" className="bg-brand-primary text-white no-underline font-semibold py-2.5 px-6 rounded-xl text-sm transition-all hover:bg-brand-dark inline-block">
              Return To Shop
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-panel border border-line rounded-2xl p-6 md:p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6 border-b border-line pb-4">
                  <Truck className="w-5 h-5 text-brand-primary" />
                  <h2 className="text-lg font-bold m-0 tracking-tight">Delivery Address</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      disabled={isProcessing}
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-background border border-line rounded-xl text-sm text-foreground focus:outline-none focus:border-brand-primary/60 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      disabled={isProcessing}
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 bg-background border border-line rounded-xl text-sm text-foreground focus:outline-none focus:border-brand-primary/60 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      disabled={isProcessing}
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      className="w-full px-4 py-3 bg-background border border-line rounded-xl text-sm text-foreground focus:outline-none focus:border-brand-primary/60 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      required
                      disabled={isProcessing}
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Flat/House No., Colony, Street"
                      className="w-full px-4 py-3 bg-background border border-line rounded-xl text-sm text-foreground focus:outline-none focus:border-brand-primary/60 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      disabled={isProcessing}
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Indore"
                      className="w-full px-4 py-3 bg-background border border-line rounded-xl text-sm text-foreground focus:outline-none focus:border-brand-primary/60 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">State</label>
                      <input
                        type="text"
                        name="state"
                        required
                        disabled={isProcessing}
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="MP"
                        className="w-full px-4 py-3 bg-background border border-line rounded-xl text-sm text-foreground focus:outline-none focus:border-brand-primary/60 transition-colors disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Zip Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        disabled={isProcessing}
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="452001"
                        className="w-full px-4 py-3 bg-background border border-line rounded-xl text-sm text-foreground focus:outline-none focus:border-brand-primary/60 transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-panel border border-line rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-4 border-b border-line pb-3">
                  <CreditCard className="w-5 h-5 text-brand-primary" />
                  <h2 className="text-base font-bold m-0 tracking-tight">Payment Authorization</h2>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-brand-primary bg-brand-light/10">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
                    <div>
                      <p className="m-0 text-sm font-bold text-slate-900">Razorpay Verified Gateway Checkout</p>
                      <p className="m-0 text-xs text-muted-text mt-0.5">Supports Credit/Debit cards, UPI (GPay, PhonePe, Paytm), and NetBanking.</p>
                    </div>
                  </div>
                  <span className="text-xl select-none">💳</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 lg:sticky lg:top-[90px] space-y-4">
              <div className="bg-panel border border-line rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4 border-b border-line pb-3">
                  <ShoppingBag className="w-[18px] h-[18px] text-slate-500" />
                  <h3 className="text-base font-bold m-0">Order Summary ({totals.itemsCount} items)</h3>
                </div>

                <div className="max-h-64 overflow-y-auto mb-4 space-y-3 pr-1 divide-y divide-line/40">
                  {cartItems.map((item: any) => {
                    if (!item || !item.product) return null;

                    const product = item.product;
                    const effectivePrice = getEffectivePrice(product.price, product.discountPrice);
                    const hasItemDiscount = Boolean(product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price);
                    const productId = product._id || product.id;

                    return (
                      <div key={productId} className="flex items-center justify-between gap-4 text-sm pt-3 first:pt-0">
                        <div className="flex items-center gap-3 truncate">
                          <div className="h-12 w-12 relative rounded-lg bg-background flex-shrink-0 border border-line/40 overflow-hidden flex items-center justify-center">
                            {product.images?.[0]?.url || product.coverImage?.url ? (
                              <Image
                                src={product.images?.[0]?.url || product.coverImage?.url}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                                unoptimized={true}
                              />
                            ) : (
                              <span className="text-lg">📦</span>
                            )}
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-foreground truncate m-0 max-w-[160px]">{product.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-muted-text">Qty: {item.quantity}</span>
                              {hasItemDiscount && (
                                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">
                                  Save ₹{(product.price - effectivePrice) * item.quantity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-foreground m-0">
                            ₹{(effectivePrice * item.quantity).toLocaleString("en-IN")}
                          </p>
                          {hasItemDiscount && (
                            <p className="text-[11px] text-muted-text line-through m-0">
                              ₹{(product.price * item.quantity).toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 text-sm border-t border-line pt-4 mb-4">
                  <div className="flex justify-between text-muted-text">
                    <span>Original Price (MRP)</span>
                    <span className="text-foreground font-medium">₹{totals.originalTotal.toLocaleString("en-IN")}</span>
                  </div>

                  {totals.hasSavings && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" /> Total Savings
                      </span>
                      <span>-₹{totals.discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-text">
                    <span>Subtotal</span>
                    <span className="text-foreground font-medium">₹{totals.subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {/* Category-wise GST breakdown */}
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

                  <div className="flex justify-between text-muted-text">
                    <span>Delivery Fee</span>
                    <span className="text-foreground font-medium">
                      {totals.shipping === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `₹${totals.shipping.toLocaleString("en-IN")}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-6 border-t border-line pt-4">
                  <div>
                    <span className="text-base font-bold text-foreground block">Final Payable</span>
                    <span className="text-[11px] text-muted-text">All taxes & fees included</span>
                  </div>
                  <span className="text-2xl font-black text-brand-primary">₹{totals.grandTotal.toLocaleString("en-IN")}</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-brand-primary text-white font-semibold py-3.5 rounded-xl border-none cursor-pointer text-sm tracking-wide transition-colors duration-200 hover:bg-brand-dark active:scale-[0.99] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? "Processing Payment..." : `Pay ₹${totals.grandTotal.toLocaleString("en-IN")} & Place Order`}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-text pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Secure 256-bit SSL Encrypted Transaction</span>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}