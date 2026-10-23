"use client";

import React, { useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { orderService } from "@/services/orderService";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setOrderLoading,
  setOrderError,
  setMyOrdersData,
} from "@/redux/slices/orderSlice";
import { IOrder, IBackendOrderItem, ICartItem } from "@/types/order.types";
import { getProductShopUrl } from "@/utils/productUrl";
import { ExternalLink } from "lucide-react";

export default function MyOrdersPage() {
  const dispatch = useAppDispatch();
  const { orders = [], isLoading, error } = useAppSelector((state) => state.order || { orders: [] });

  // Live Auth Slice for Pincode Extraction
  const { user } = useAppSelector((state) => state.auth || { user: null });
  const profile = (user as any)?.profile;
  const userPincode = profile?.shippingAddress?.pincode || profile?.pincode || "";

  // Strict reference tracker execution to prevent lifecycle race conditions
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;

    const fetchOrders = async () => {
      dispatch(setOrderLoading(true));
      try {
        const response = await orderService.getMyOrders() as any;
        console.log("Success Response Data:", response);

        let ordersPayload = null;

        if (response) {
          if (Array.isArray(response)) ordersPayload = response;
          else if (Array.isArray(response.orders)) ordersPayload = response.orders;
          else if (response.data && Array.isArray(response.data.orders)) ordersPayload = response.data.orders;
        }

        if (ordersPayload) {
          dispatch(setMyOrdersData(ordersPayload));
          hasFetched.current = true;
        } else {
          dispatch(setOrderError("No orders structure found in active state."));
        }

      } catch (err: any) {
        console.log("Caught Error Block Context:", err);

        let backupPayload = null;

        if (err?.orders && Array.isArray(err.orders)) {
          backupPayload = err.orders;
        } else if (err?.response?.data?.orders && Array.isArray(err.response.data.orders)) {
          backupPayload = err.response.data.orders;
        } else if (err?.data?.orders && Array.isArray(err.data.orders)) {
          backupPayload = err.data.orders;
        }

        if (backupPayload) {
          console.log("Recovered orders payload successfully from exception bounds.");
          dispatch(setMyOrdersData(backupPayload));
          hasFetched.current = true;
          return;
        }

        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load your orders due to handshake drop.";
        dispatch(setOrderError(errorMessage));
      }
    };

    fetchOrders();
  }, [dispatch]);

  // Derived conditional flags for clean performance
  const hasOrders = useMemo(() => orders && orders.length > 0, [orders]);

  // Helper to format date cleanly
  const formatDate = (dateString: string) => {
    if (!dateString) return "Recent";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Status color pill generator mapping backend payload stability keys
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Processing":
      case "Shipped":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-600 border-line";
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-12 pt-32 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="max-w-5xl mx-auto">

        {/* PREMIUM UNIFIED HERO SECTION */}
        <div className="rounded-3xl bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary text-white p-8 sm:p-12 mb-10 relative overflow-hidden shadow-xs">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,245,233,0.15),transparent_45%)]" />
          <div className="relative z-10 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-light bg-brand-light/10 px-3 py-1 rounded-full border border-brand-light/20 inline-block mb-4 select-none">
              📦 Purchase History {userPincode && `• Home Base: ${userPincode}`}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight m-0 mb-3 leading-[1.1]">
              {hasOrders ? "Your Green Journey" : "Your Garden Awaits"}
            </h1>
            <p className="m-0 text-slate-200 text-xs sm:text-sm leading-relaxed font-normal opacity-90">
              {hasOrders
                ? `Aapne ab tak total ${orders.length} orders place kiye hain. Track your live deliveries and botanicals dispatch.`
                : "Aapne abhi tak koi life-plant purchase nahi kiya. Certified nursery vendors se fresh stocks explore karein."}
            </p>
          </div>
        </div>

        {/* LOADING SHIMMER STATE */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="bg-panel border border-line rounded-xl p-6 space-y-4 animate-pulse">
                <div className="h-5 bg-line rounded w-1/3"></div>
                <div className="h-px bg-line w-full"></div>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-line rounded-lg"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-line rounded w-1/4"></div>
                    <div className="h-3 bg-line rounded w-1/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {error && !isLoading && (
          <div className="bg-rose-50/50 border border-rose-200 text-rose-800 rounded-xl p-5 text-sm flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
            <p className="m-0">{error}</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !error && !hasOrders && (
          <div className="text-center bg-panel border border-line rounded-2xl py-16 px-4 max-w-md mx-auto mt-12 shadow-xs">
            <div className="w-16 h-16 bg-brand-light text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              🌱
            </div>
            <h3 className="text-lg font-bold text-brand-dark m-0">No orders found</h3>
            <p className="text-sm text-muted-text mt-2 max-w-xs mx-auto leading-relaxed">
              Looks like your garden hasn't started growing yet. Start adding beautiful green life to your space!
            </p>
            <Link
              href="/shop"
              className="mt-6 px-5 py-2.5 bg-brand-primary hover:bg-brand-dark text-white text-sm font-medium rounded-lg transition-colors no-underline inline-block shadow-sm"
            >
              Explore Plants
            </Link>
          </div>
        )}

        {/* ORDERS LIST CONTAINER */}
        {!isLoading && hasOrders && (
          <div className="space-y-8">
            {orders.map((order: IOrder) => {
              const displayItems = order.orderItems || order.items || [];
              const shippingName = order.shippingInfo?.name || order.shippingAddress?.fullName || "Customer";
              const grandTotalValue = order.totalPrice ?? order.totals?.grandTotal ?? 0;

              return (
                <div
                  key={order._id}
                  className="bg-panel border border-line rounded-xl overflow-hidden shadow-xs hover:border-brand-primary/20 transition-all duration-200"
                >
                  {/* Top order summary card panel bar */}
                  <div className="bg-slate-50/70 border-b border-line px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-muted-text">
                    <div>
                      <span className="block uppercase tracking-wider text-[10px] text-slate-400 mb-0.5">Order Placed</span>
                      <span className="text-foreground text-sm font-semibold">{formatDate(order.createdAt)}</span>
                    </div>
                    <div>
                      <span className="block uppercase tracking-wider text-[10px] text-slate-400 mb-0.5">Total Amount</span>
                      <span className="text-brand-dark text-sm font-bold">₹{grandTotalValue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block uppercase tracking-wider text-[10px] text-slate-400 mb-0.5">Ship To</span>
                      <span className="text-foreground text-sm truncate block max-w-[150px]" title={shippingName}>
                        {shippingName}
                      </span>
                    </div>
                    <div className="flex flex-col items-start sm:items-end justify-center col-span-2 sm:col-span-1">
                      <span className="block uppercase tracking-wider text-[10px] text-slate-400 mb-1 sm:text-right w-full">Status</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(order.orderStatus)}`}>
                        {order.orderStatus || "Processing"}
                      </span>
                    </div>
                  </div>

                  {/* Order items listed row mapping */}
                  <div className="divide-y divide-line">
                    {displayItems.map((item: any, idx: number) => {
                      const isBackendItem = "item" in item;
                      const productTitle = isBackendItem ? item.item?.name : item.product?.name;
                      const productPrice = isBackendItem ? item.price : item.product?.price;
                      const productQty = item.quantity;

                      const coverImgUrl = isBackendItem ? item.item?.coverImage?.url : item.product?.coverImage?.url;
                      const fallbackImgUrl = isBackendItem ? item.item?.images?.[0]?.url : item.product?.images?.[0]?.url;
                      const imageUrl = coverImgUrl || fallbackImgUrl || "https://placehold.co/150x150?text=Plant";
                      const shopUrl = getProductShopUrl(item);

                      return (
                        <div key={item._id || idx} className="p-5 flex items-start gap-4 sm:gap-6 group">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-light rounded-lg overflow-hidden border border-line shrink-0 relative flex items-center justify-center">
                            {shopUrl ? (
                              <Link
                                href={shopUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative w-full h-full block"
                                title={`View ${productTitle || "product"} on store`}
                              >
                                <Image
                                  src={imageUrl}
                                  alt={productTitle || "Product Item Image"}
                                  fill
                                  sizes="(max-w-640px) 64px, 80px"
                                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                                  unoptimized={true}
                                />
                              </Link>
                            ) : (
                              <Image
                                src={imageUrl}
                                alt={productTitle || "Product Item Image"}
                                fill
                                sizes="(max-w-640px) 64px, 80px"
                                className="object-cover"
                                unoptimized={true}
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {shopUrl ? (
                              <Link
                                href={shopUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-foreground hover:text-brand-primary sm:text-base text-sm truncate m-0 transition-colors inline-flex items-center gap-1.5"
                              >
                                <span>{productTitle || "Premium Botanicals Item"}</span>
                                <ExternalLink className="w-3.5 h-3.5 opacity-60 hover:opacity-100 shrink-0" />
                              </Link>
                            ) : (
                              <h4 className="font-bold text-foreground sm:text-base text-sm truncate m-0 transition-colors">
                                {productTitle || "Premium Botanicals Item"}
                              </h4>
                            )}
                            <p className="text-xs text-muted-text mt-1 mb-0 flex items-center gap-3">
                              <span>Qty: <strong className="text-foreground font-semibold">{productQty}</strong></span>
                              <span className="w-1 h-1 rounded-full bg-line"></span>
                              <span>Price: <strong className="text-foreground font-semibold">₹{productPrice}</strong></span>
                            </p>
                            {item.nursery && (
                              <p className="text-[11px] text-brand-dark/70 font-medium bg-brand-light/60 inline-block px-2 py-0.5 rounded mt-2 mb-0">
                                🏡 Nursery ID: {typeof item.nursery === "object" ? (item.nursery._id || item.nursery.id) : item.nursery}
                              </p>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold text-foreground">
                              ₹{(productPrice * productQty).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer actions block panel */}
                  <div className="bg-slate-50/30 border-t border-line px-5 py-3 flex items-center justify-between text-xs text-muted-text">
                    <span className="font-mono text-[11px] tracking-tight">ID: {order._id || (order as any).orderId}</span>
                    {order._id || (order as any).orderId ? (
                      <Link
                        href={`/orders/${order._id || (order as any).orderId}`}
                        className="px-3.5 py-1.5 border border-line border-solid hover:border-brand-primary text-foreground hover:text-brand-primary bg-panel rounded-md font-medium transition-colors no-underline inline-block"
                      >
                        View Full Details
                      </Link>
                    ) : (
                      <span className="px-3.5 py-1.5 border border-line text-muted-text bg-panel rounded-md text-[11px] font-medium">
                        Unavailable
                      </span>
                    )}
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