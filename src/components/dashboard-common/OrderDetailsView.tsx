"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  ExternalLink,
  MapPin,
  Package,
  Phone,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import { orderService } from "@/services/orderService";
import { formatINR } from "@/types/dashboard.types";
import { getProductShopUrl } from "@/utils/productUrl";

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface OrderDetailsViewProps {
  orderId: string;
  variant: "nursery" | "admin";
}

const STATUS_STEPS: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered"];

export default function OrderDetailsView({ orderId, variant }: OrderDetailsViewProps) {
  const router = useRouter();
  const isAdmin = variant === "admin";
  const backHref = isAdmin ? "/admin/orders" : "/nursery/orders";

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await orderService.getOrderById(orderId);
      if (res && res.order) {
        setOrder(res.order);
      } else {
        setError("Order details not found or payload empty.");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to load order details.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handleCopyId = () => {
    if (!order?._id) return;
    navigator.clipboard.writeText(order._id);
    setCopied(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (nextStatus: string) => {
    const targetStatus = (nextStatus === "Completed" ? "Delivered" : nextStatus) as OrderStatus;
    if (!order || order.orderStatus === targetStatus) return;

    const confirmChange = window.confirm(
      `Are you sure you want to update Order #${order._id} status to "${targetStatus}"?`
    );
    if (!confirmChange) return;

    setIsUpdatingStatus(true);
    const toastId = toast.loading(`Updating order status to ${targetStatus}...`);

    try {
      if (isAdmin) {
        await orderService.updateAdminOrderStatus(order._id, { status: targetStatus });
      } else {
        await orderService.updateNurseryOrderStatus(order._id, { status: targetStatus });
      }

      setOrder((prev: any) => (prev ? { ...prev, orderStatus: targetStatus } : prev));
      toast.success(`Order status updated to ${targetStatus}`, { id: toastId });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to update order status.";
      toast.error(`Update failed: ${message}`, { id: toastId });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Processing":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Pending":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const currentStatusIndex = STATUS_STEPS.indexOf(
    (order?.orderStatus === "Completed" ? "Delivered" : order?.orderStatus) as OrderStatus
  );
  const isCancelled = order?.orderStatus === "Cancelled";

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 antialiased text-slate-800 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded-md" />
            <div className="h-3 w-32 bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-44 bg-white border border-slate-100 rounded-3xl p-6" />
            <div className="h-80 bg-white border border-slate-100 rounded-3xl p-6" />
          </div>
          <div className="space-y-6">
            <div className="h-56 bg-white border border-slate-100 rounded-3xl p-6" />
            <div className="h-56 bg-white border border-slate-100 rounded-3xl p-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto text-center space-y-6 antialiased text-slate-800">
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 sm:p-12 space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
          <h2 className="text-xl font-bold text-rose-900">Unable to Load Order Details</h2>
          <p className="text-sm text-rose-700 max-w-md mx-auto">{error || "Order not found."}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href={backHref}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition shadow-xs"
            >
              Back to Orders
            </Link>
            <button
              onClick={fetchOrderDetails}
              className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shipping = order.shippingInfo || order.shippingAddress || {};
  const customer = typeof order.user === "object" && order.user ? order.user : null;
  const customerName = shipping.name || shipping.fullName || customer?.name || "Customer";
  const customerEmail = customer?.email || shipping.email || "No email available";
  const customerPhone = shipping.phone || customer?.phone || "No phone provided";

  const orderItems = order.orderItems || [];
  const itemsPrice = order.itemsPrice ?? order.totals?.itemsSubtotal ?? 0;
  const shippingPrice = order.shippingPrice ?? order.totals?.shippingCost ?? 0;
  const taxPrice = order.taxPrice ?? order.totals?.taxAmount ?? 0;
  const totalPrice = order.totalPrice ?? order.totals?.grandTotal ?? itemsPrice + shippingPrice + taxPrice;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 antialiased text-slate-800 min-h-screen">
      {/* 🔝 HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
              title="Back to Orders"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Order Details
                </h1>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200">
                  <span>#{order._id}</span>
                  <button
                    onClick={handleCopyId}
                    className="p-0.5 hover:text-slate-900 transition cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Placed on{" "}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* 🎛️ STATUS ACTIONS */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <div className="relative">
              <select
                value={order.orderStatus === "Delivered" ? "Completed" : order.orderStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                className={`px-3 py-1.5 pr-8 text-xs font-bold rounded-xl border shadow-xs cursor-pointer outline-hidden appearance-none transition-all disabled:opacity-50 ${getStatusBadge(
                  order.orderStatus
                )}`}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed (Delivered)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-current opacity-60" />
            </div>
          </div>

          <button
            onClick={fetchOrderDetails}
            disabled={isLoading || isUpdatingStatus}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
            title="Refresh Order"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 🚀 ORDER PIPELINE TIMELINE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            Fulfillment Lifecycle
          </h2>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
              order.orderStatus
            )}`}
          >
            {order.orderStatus}
          </span>
        </div>

        {isCancelled ? (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">This order has been Cancelled.</p>
              <p className="text-rose-600">Stock and financial records are adjusted accordingly.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {STATUS_STEPS.map((step, index) => {
              const isPassed = currentStatusIndex >= index;
              const isCurrent = currentStatusIndex === index;

              return (
                <div
                  key={step}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                      : isPassed
                      ? "border-emerald-200 bg-emerald-50/20 text-emerald-800"
                      : "border-slate-100 bg-slate-50/50 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    )}
                    <span className="text-xs font-black uppercase tracking-wider">{step}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {step === "Pending" && "Payment received"}
                    {step === "Processing" && "Preparing & packed"}
                    {step === "Shipped" && "In courier transit"}
                    {step === "Delivered" && "Delivered to buyer"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📦 TWO COLUMN CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 👈 LEFT: ORDERED PRODUCTS LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  Ordered Items ({orderItems.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any product name or thumbnail to inspect its live marketplace listing.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {orderItems.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No line items found in this order.
                </p>
              ) : (
                orderItems.map((item: any, idx: number) => {
                  const populatedItem = typeof item.item === "object" && item.item ? item.item : null;
                  const productName = populatedItem?.name || item.name || `Product Item #${idx + 1}`;
                  const productPrice = Number(item.price ?? populatedItem?.price ?? 0);
                  const quantity = Number(item.quantity ?? 1);
                  const lineTotal = productPrice * quantity;

                  // Resolve product image
                  let imageUrl = "/images/plant-placeholder.png";
                  if (populatedItem?.coverImage?.url) {
                    imageUrl = populatedItem.coverImage.url;
                  } else if (populatedItem?.images?.[0]?.url) {
                    imageUrl = populatedItem.images[0].url;
                  } else if (item.coverImage?.url) {
                    imageUrl = item.coverImage.url;
                  } else if (item.images?.[0]?.url) {
                    imageUrl = item.images[0].url;
                  }

                  const categoryLabel = item.itemModel || populatedItem?.category || "Product";
                  const shopUrl = getProductShopUrl(item);

                  const nurseryInfo =
                    typeof item.nursery === "object" && item.nursery ? item.nursery : null;

                  return (
                    <div
                      key={item._id || idx}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-4">
                        {/* 🖼️ PRODUCT IMAGE */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center">
                          {shopUrl ? (
                            <Link
                              href={shopUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative w-full h-full block"
                              title={`View ${productName} on store`}
                            >
                              <Image
                                src={imageUrl}
                                alt={productName}
                                fill
                                sizes="80px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e: any) => {
                                  e.currentTarget.src =
                                    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=150&q=80";
                                }}
                              />
                            </Link>
                          ) : (
                            <Image
                              src={imageUrl}
                              alt={productName}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          )}
                        </div>

                        {/* 📝 PRODUCT DETAILS */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase tracking-wide">
                              {categoryLabel}
                            </span>
                            {item.status && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(
                                  item.status
                                )}`}
                              >
                                {item.status}
                              </span>
                            )}
                          </div>

                          {shopUrl ? (
                            <Link
                              href={shopUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors inline-flex items-center gap-1 group/link"
                            >
                              <span>{productName}</span>
                              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity text-emerald-600 shrink-0" />
                            </Link>
                          ) : (
                            <span className="text-sm font-bold text-slate-900">{productName}</span>
                          )}

                          <p className="text-xs text-slate-500 font-medium">
                            {formatINR(productPrice)} × {quantity} unit{quantity > 1 ? "s" : ""}
                          </p>

                          {isAdmin && nurseryInfo && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-emerald-600" />
                              <span className="font-semibold text-slate-700">
                                {nurseryInfo.name || "Nursery Partner"}
                              </span>
                              {nurseryInfo.email && (
                                <span className="text-slate-400">({nurseryInfo.email})</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 💰 ITEM SUBTOTAL */}
                      <div className="text-right sm:self-center shrink-0">
                        <p className="text-sm font-black text-slate-900">{formatINR(lineTotal)}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Subtotal</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 💳 FINANCIAL / PRICE BREAKDOWN */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Order Settlement Summary
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">{formatINR(itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping & Handling</span>
                <span className="font-bold text-slate-900">
                  {shippingPrice > 0 ? formatINR(shippingPrice) : "FREE"}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST / Taxes (18%)</span>
                <span className="font-bold text-slate-900">{formatINR(taxPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Amount</span>
                <span className="text-lg text-emerald-600 font-black">{formatINR(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 👉 RIGHT: CUSTOMER & DELIVERY INFO */}
        <div className="space-y-6">
          {/* 👤 CUSTOMER DETAILS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Customer Details</h3>
                <p className="text-[11px] text-slate-400">Account verified</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{customerName}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</p>
                <a
                  href={`mailto:${customerEmail}`}
                  className="font-medium text-emerald-600 hover:underline flex items-center gap-1.5 mt-0.5 break-all"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {customerEmail}
                </a>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
                <a
                  href={`tel:${customerPhone}`}
                  className="font-medium text-slate-800 hover:text-emerald-600 flex items-center gap-1.5 mt-0.5"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {customerPhone}
                </a>
              </div>
            </div>
          </div>

          {/* 📍 DELIVERY ADDRESS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delivery Address</h3>
                <p className="text-[11px] text-slate-400">Destination shipping profile</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p className="font-bold text-slate-900">{customerName}</p>
              <p className="text-slate-600 leading-relaxed">
                {shipping.address || "Street address not specified"}
              </p>
              <p className="text-slate-600">
                {[shipping.city, shipping.state, shipping.country]
                  .filter(Boolean)
                  .join(", ") || "Location details pending"}
              </p>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-bold">
                  PIN: {shipping.pinCode || shipping.zipCode || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* 💳 PAYMENT & SECURITY */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Payment Gateway</h3>
                <p className="text-[11px] text-slate-400">Razorpay Cryptographic Audit</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Gateway Provider</span>
                <span className="font-bold text-slate-800">Razorpay Online</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Payment Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  {order.paymentInfo?.status || "Paid / Captured"}
                </span>
              </div>

              {order.paymentInfo?.id && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Payment ID
                  </p>
                  <p className="font-mono text-slate-700 text-[11px] mt-0.5 break-all">
                    {order.paymentInfo.id}
                  </p>
                </div>
              )}

              {order.paymentInfo?.orderId && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Razorpay Order ID
                  </p>
                  <p className="font-mono text-slate-700 text-[11px] mt-0.5 break-all">
                    {order.paymentInfo.orderId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
