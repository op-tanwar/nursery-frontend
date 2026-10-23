"use client";

import React, { useEffect, useState, useMemo, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  ExternalLink,
  MapPin,
  Package,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  Copy,
  Check,
  RefreshCw,
  Star,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { orderService } from "@/services/orderService";
import { returnReplacementService } from "@/services/returnReplacementService";
import { formatINR } from "@/types/dashboard.types";
import { getProductShopUrl } from "@/utils/productUrl";
import WriteReviewModal from "@/components/customer/orders/WriteReviewModal";
import ReturnReplacementModal from "@/components/customer/orders/ReturnReplacementModal";
import { useAppSelector } from "@/redux/hooks";

interface PageProps {
  id?: string;
  orderId?: string;
  initialOrder?: any | null;
  params?: Promise<{ id?: string; orderId?: string }>;
}

const STATUS_STEPS = ["Pending", "Processing", "Shipped", "Delivered"];

export default function OrderDetailsClient({
  id: propId,
  orderId: propOrderId,
  initialOrder,
  params,
}: PageProps) {
  const urlParams = useParams<{ id?: string; orderId?: string }>();
  const resolvedParams = params ? use(params) : null;
  const orderId =
    propId ||
    propOrderId ||
    resolvedParams?.id ||
    resolvedParams?.orderId ||
    urlParams?.id ||
    urlParams?.orderId ||
    "";

  const { user } = useAppSelector((state) => state.auth || { user: null });

  const [order, setOrder] = useState<any | null>(initialOrder || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialOrder);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Review Modal state
  const [reviewProduct, setReviewProduct] = useState<{
    id: string;
    name: string;
    itemModel?: string;
    imageUrl?: string;
  } | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<string>>(new Set());

  // Return / Replacement Modal state
  const [returnItem, setReturnItem] = useState<any | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
  const [returnedItemStatusMap, setReturnedItemStatusMap] = useState<Record<string, string>>({});
  const [returnedItemDataMap, setReturnedItemDataMap] = useState<
    Record<string, { status: string; adminNotes?: string; requestType?: string }>
  >({});

  const isWithin24HoursOfDelivery = (order: any): boolean => {
    if (order?.orderStatus !== "Delivered") return false;
    const deliveryDate = order?.deliveredAt ? new Date(order.deliveredAt) : new Date(order?.updatedAt);
    const diffInHours = (Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  const openReturnReplacementModal = (item: any) => {
    setReturnItem(item);
    setIsReturnModalOpen(true);
  };

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await orderService.getOrderById(orderId);
      if (res && res.order) {
        setOrder(res.order);

        // Fetch any existing return/replacement requests for this order
        try {
          const reqRes = await returnReplacementService.getOrderRequests(orderId);
          if (reqRes?.requests && Array.isArray(reqRes.requests)) {
            const statusMap: Record<string, string> = {};
            const dataMap: Record<string, any> = {};
            reqRes.requests.forEach((r: any) => {
              if (r.itemId) {
                const key = String(r.itemId);
                statusMap[key] = r.status || "Pending";
                dataMap[key] = {
                  status: r.status || "Pending",
                  adminNotes: r.adminNotes || "",
                  requestType: r.requestType || "Return",
                };
              }
            });
            setReturnedItemStatusMap(statusMap);
            setReturnedItemDataMap(dataMap);
          }
        } catch {
          // silent fallback
        }
      } else {
        setError("Order details could not be located in database.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to load order information.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (order && (order._id === orderId || order.id === orderId)) {
      return;
    }
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // 🔄 Cross-Portal Live Status Synchronization (Refetch on window focus)
  useEffect(() => {
    const handleFocus = () => {
      if (orderId) {
        fetchOrderDetails();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [orderId]);

  const handleCopyId = () => {
    const idToCopy = order?._id || order?.id || orderId;
    if (!idToCopy) return;
    navigator.clipboard.writeText(idToCopy);
    setCopied(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
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

  const openReviewModal = (item: any) => {
    const productObj =
      typeof item?.product === "object" && item?.product !== null
        ? item.product
        : typeof item?.item === "object" && item?.item !== null
        ? item.item
        : typeof item?.plant === "object" && item?.plant !== null
        ? item.plant
        : null;

    const productId =
      productObj?._id ||
      productObj?.id ||
      (typeof item?.product === "string" ? item.product : null) ||
      (typeof item?.item === "string" ? item.item : null) ||
      (typeof item?.plant === "string" ? item.plant : null) ||
      item?._id ||
      item?.id ||
      "";

    const productName =
      item?.product?.name ||
      productObj?.name ||
      item?.name ||
      "Plant Item";

    const itemModel =
      item?.itemModel ||
      item?.category ||
      productObj?.category ||
      productObj?.itemModel ||
      "Plant";

    let imageUrl = "/images/plant-placeholder.png";
    if (productObj?.coverImage?.url) {
      imageUrl = productObj.coverImage.url;
    } else if (productObj?.images?.[0]?.url) {
      imageUrl = productObj.images[0].url;
    } else if (typeof productObj?.image === "string") {
      imageUrl = productObj.image;
    } else if (item?.coverImage?.url) {
      imageUrl = item.coverImage.url;
    } else if (item?.images?.[0]?.url) {
      imageUrl = item.images[0].url;
    }

    setReviewProduct({
      id: productId,
      name: productName,
      itemModel,
      imageUrl,
    });
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmitted = (productId: string) => {
    setReviewedProductIds((prev) => new Set(prev).add(productId));
  };

  const currentStatusIndex = STATUS_STEPS.indexOf(
    (order?.orderStatus === "Completed" ? "Delivered" : order?.orderStatus) || "Processing"
  );
  const isCancelled = order?.orderStatus === "Cancelled";

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-6 antialiased animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
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
      <div className="max-w-3xl mx-auto w-full px-4 py-16 text-center space-y-6 antialiased">
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 sm:p-12 space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
          <h2 className="text-xl font-bold text-rose-900">Order Not Found</h2>
          <p className="text-sm text-rose-700 max-w-md mx-auto">
            {error || "We couldn't retrieve the details for this order."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/orders/me"
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition shadow-xs"
            >
              Back to My Orders
            </Link>
            <button
              onClick={fetchOrderDetails}
              className="px-5 py-2.5 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🛡️ Defensive Guards against Undefined / Null Fields
  const shipping = order?.shippingInfo || order?.shippingAddress || {};
  const customer = typeof order?.user === "object" && order?.user ? order.user : null;
  const customerName =
    order?.shippingAddress?.fullName ||
    shipping.name ||
    shipping.fullName ||
    customer?.name ||
    user?.name ||
    "Customer";
  const customerEmail = customer?.email || shipping.email || user?.email || "";
  const customerPhone = shipping.phone || customer?.phone || "No phone provided";

  const safeOrderItems: any[] = Array.isArray(order?.orderItems)
    ? order.orderItems
    : Array.isArray(order?.items)
    ? order.items
    : [];

  const itemsPrice =
    order?.itemsPrice ?? order?.subtotal ?? order?.totals?.itemsSubtotal ?? 0;
  const shippingPrice =
    order?.shippingPrice ?? order?.shippingCost ?? order?.totals?.shippingCost ?? 0;
  const taxPrice =
    order?.taxPrice ?? order?.taxAmount ?? order?.totals?.taxAmount ?? 0;
  const totalPrice =
    order?.totalAmount ??
    order?.totalPrice ??
    order?.totals?.grandTotal ??
    (itemsPrice + shippingPrice + taxPrice);

  const streetAddress =
    order?.shippingAddress?.street ||
    shipping.street ||
    shipping.address ||
    "Street address not specified";

  const pinCode =
    order?.shippingAddress?.pinCode ||
    shipping.pinCode ||
    shipping.postalCode ||
    shipping.zipCode ||
    "N/A";

  const rawPaymentStatus = order?.paymentInfo?.status || order?.paymentStatus || "Paid";
  const paymentStatus =
    String(rawPaymentStatus).toLowerCase() === "captured" || String(rawPaymentStatus).toLowerCase() === "paid"
      ? "Paid"
      : rawPaymentStatus;

  // Derive Category-wise Tax Breakdown safely
  const categoryTaxBreakdown = useMemo(() => {
    const map: Record<
      string,
      { rate: number; taxableAmount: number; taxAmount: number; isInclusive: boolean }
    > = {};

    safeOrderItems.forEach((item: any) => {
      const cat = item?.taxCategory || item?.itemModel || item?.category || "Plants";
      const rate = Number(item?.taxRatePercentage ?? (item?.taxAmount ? 18 : 0));
      const taxAmt = Number(item?.taxAmount ?? 0);
      const price = Number(item?.price ?? item?.product?.price ?? 0);
      const qty = Number(item?.quantity ?? 1);
      const taxable = price * qty;
      const isInclusive = Boolean(item?.isTaxInclusive);

      if (!map[cat]) {
        map[cat] = { rate, taxableAmount: 0, taxAmount: 0, isInclusive };
      }
      map[cat].taxableAmount += taxable;
      map[cat].taxAmount += taxAmt;
    });

    return Object.entries(map).map(([category, val]) => ({
      category,
      taxRatePercentage: val.rate,
      taxableAmount: val.taxableAmount,
      taxAmount: val.taxAmount,
      isTaxInclusive: val.isInclusive,
    }));
  }, [safeOrderItems]);

  const displayOrderId = order?._id || order?.id || orderId;

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-24 space-y-8 antialiased text-slate-800">
      {/* 🔝 TOP NAVIGATION & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 rounded-3xl bg-gradient-to-br from-brand-dark via-[#0f3d21] to-brand-primary text-white p-8 sm:p-12 mb-10 relative overflow-hidden shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/orders/me"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
              title="Back to My Orders"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Order Details
                </h1>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200">
                  <span>#{displayOrderId}</span>
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
              <p className="text-xs text-slate-200 mt-0.5">
                Placed on{" "}
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recent"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
              order?.orderStatus || "Processing"
            )}`}
          >
            {order?.orderStatus || "Processing"}
          </span>
          <Link
            href="/shop"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      {/* 🚀 ORDER LIFECYCLE TRACKER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            Delivery Progress
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {order?.deliveredAt
              ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}`
              : "Standard Green Courier"}
          </span>
        </div>

        {isCancelled ? (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">This order was cancelled.</p>
              <p className="text-rose-600">
                If you were charged, a refund is processed to your original payment method.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
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
                    {step === "Pending" && "Order placed"}
                    {step === "Processing" && "Packed at nursery"}
                    {step === "Shipped" && "Out for delivery"}
                    {step === "Delivered" && "Delivered to you"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📦 CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 👈 LEFT: ORDERED ITEMS & REVIEW CTA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  Ordered Botanical Products ({safeOrderItems.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any product to view its store page or share your feedback.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {safeOrderItems.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No line items found in this order record.
                </p>
              ) : (
                (order?.items || order?.orderItems || safeOrderItems)?.map((item: any, idx: number) => {
                  const productObj =
                    typeof item?.product === "object" && item?.product !== null
                      ? item.product
                      : typeof item?.item === "object" && item?.item !== null
                      ? item.item
                      : typeof item?.plant === "object" && item?.plant !== null
                      ? item.plant
                      : null;

                  const productName =
                    item?.product?.name ||
                    productObj?.name ||
                    item?.name ||
                    `Plant Item #${idx + 1}`;

                  const productPrice = Number(
                    item?.price ?? item?.product?.price ?? productObj?.price ?? 0
                  );
                  const quantity = Number(item?.quantity ?? 1);
                  const lineTotal = productPrice * quantity;

                  const productId =
                    productObj?._id ||
                    productObj?.id ||
                    (typeof item?.product === "string" ? item.product : null) ||
                    (typeof item?.item === "string" ? item.item : null) ||
                    (typeof item?.plant === "string" ? item.plant : null) ||
                    item?._id ||
                    item?.id ||
                    `item-${idx}`;

                  const hasReviewed = productId ? reviewedProductIds.has(productId) : false;

                  // Resolve image URL defensively
                  let imageUrl = "/images/plant-placeholder.png";
                  if (productObj?.coverImage?.url) {
                    imageUrl = productObj.coverImage.url;
                  } else if (productObj?.images?.[0]?.url) {
                    imageUrl = productObj.images[0].url;
                  } else if (typeof productObj?.image === "string") {
                    imageUrl = productObj.image;
                  } else if (item?.coverImage?.url) {
                    imageUrl = item.coverImage.url;
                  } else if (item?.images?.[0]?.url) {
                    imageUrl = item.images[0].url;
                  } else if (typeof item?.image === "string") {
                    imageUrl = item.image;
                  }

                  const categoryLabel =
                    item?.itemModel ||
                    item?.category ||
                    productObj?.category ||
                    productObj?.itemModel ||
                    "Plant";

                  const shopUrl = getProductShopUrl(item);

                  // Resolve vendor/nursery info defensively
                  const itemNursery = item?.nursery || productObj?.nursery;
                  const itemVendorObj =
                    typeof itemNursery === "object" && itemNursery !== null ? itemNursery : null;
                  const itemVendorName =
                    itemVendorObj?.businessName ||
                    itemVendorObj?.name ||
                    (typeof item?.nurseryName === "string" ? item.nurseryName : null) ||
                    null;
                  const rawVendorId =
                    itemVendorObj?.slug ||
                    itemVendorObj?.nurseryId ||
                    itemVendorObj?._id ||
                    (typeof itemNursery === "string" &&
                    itemNursery.trim() !== "" &&
                    itemNursery !== "undefined"
                      ? itemNursery.trim()
                      : null) ||
                    productObj?.nurseryId ||
                    productObj?.nursery ||
                    null;
                  const itemVendorIdentifier =
                    rawVendorId && rawVendorId !== "undefined" ? rawVendorId : null;

                  return (
                    <div
                      key={item?._id || idx}
                      className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-4">
                        {/* 🖼️ PRODUCT THUMBNAIL (CLICKABLE TO SHOP) */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center">
                          {shopUrl ? (
                            <Link
                              href={shopUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative w-full h-full block"
                              title={`View ${productName} in new tab`}
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

                        {/* 📝 PRODUCT INFO */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 uppercase tracking-wide">
                            {categoryLabel}
                          </span>

                          <div>
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
                              <span className="text-sm font-bold text-slate-900">
                                {productName}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 font-medium">
                            {formatINR(productPrice)} × {quantity} unit
                            {quantity > 1 ? "s" : ""}
                          </p>

                          {/* 🏡 SOLD BY VENDOR LINK */}
                          {itemVendorName && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                              <span>Sold by:</span>
                              {itemVendorIdentifier ? (
                                <Link
                                  href={`/vendor/${itemVendorIdentifier}`}
                                  className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
                                >
                                  {itemVendorName}
                                </Link>
                              ) : (
                                <span className="font-semibold text-slate-700">{itemVendorName}</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 💰 ITEM TOTAL & REVIEW / RETURN BUTTONS */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-black text-slate-900">
                            {formatINR(lineTotal)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Subtotal</p>
                        </div>

                        {/* Actions Row: Review & Return/Replacement */}
                        <div className="flex flex-wrap items-center gap-2 justify-end">
                          {/* ⭐ WRITE REVIEW BUTTON */}
                          {hasReviewed ? (
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              Reviewed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openReviewModal(item)}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Leave a product review"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              Write Review
                            </button>
                          )}

                          {/* 🔄 RETURN / REPLACEMENT BUTTON OR STATUS-SYNCHRONIZED BADGE */}
                          {(() => {
                            const effectiveItemId = (
                              item?._id ||
                              item?.id ||
                              (typeof item?.item === "string" ? item.item : item?.item?._id) ||
                              productObj?._id ||
                              productObj?.id ||
                              `item-${idx}`
                            ).toString();

                            const claimData =
                              returnedItemDataMap[effectiveItemId] ||
                              (productObj?._id ? returnedItemDataMap[productObj._id.toString()] : undefined);

                            const itemClaimStatus = item?.claim?.isClaimed
                              ? item?.claim?.status || "Pending"
                              : claimData?.status ||
                                returnedItemStatusMap[effectiveItemId] ||
                                (productObj?._id ? returnedItemStatusMap[productObj._id.toString()] : undefined);

                            const isReturnRequested = Boolean(itemClaimStatus);

                            if (isReturnRequested) {
                              if (itemClaimStatus === "Approved") {
                                return (
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 shadow-2xs">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>
                                        {claimData?.requestType === "Replacement"
                                          ? "Replacement Approved"
                                          : "Return Approved"}
                                      </span>
                                    </span>
                                    {claimData?.adminNotes && (
                                      <span
                                        className="text-[10px] text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md max-w-[200px] truncate"
                                        title={claimData.adminNotes}
                                      >
                                        Admin: {claimData.adminNotes}
                                      </span>
                                    )}
                                  </div>
                                );
                              }

                              if (itemClaimStatus === "Rejected") {
                                return (
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-300 bg-rose-50 text-rose-800 shadow-2xs">
                                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Claim Declined</span>
                                    </span>
                                    {claimData?.adminNotes && (
                                      <span
                                        className="text-[10px] text-rose-800 bg-rose-100/60 px-2 py-0.5 rounded-md max-w-[200px] truncate"
                                        title={claimData.adminNotes}
                                      >
                                        Reason: {claimData.adminNotes}
                                      </span>
                                    )}
                                  </div>
                                );
                              }

                              if (itemClaimStatus === "Completed") {
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-blue-300 bg-blue-50 text-blue-800 shadow-2xs">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Claim Completed</span>
                                  </span>
                                );
                              }

                              // Pending
                              return (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-amber-300 bg-amber-50 text-amber-800 shadow-2xs">
                                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Return Requested (Pending Review)</span>
                                </span>
                              );
                            }

                            if (isWithin24HoursOfDelivery(order)) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => openReturnReplacementModal(item)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Request Return / Replacement</span>
                                </button>
                              );
                            }

                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 💳 ORDER PRICE BREAKDOWN */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Payment & Cost Breakdown
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">{formatINR(itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping & Plant Courier</span>
                <span className="font-bold text-slate-900">
                  {shippingPrice > 0 ? formatINR(shippingPrice) : "FREE"}
                </span>
              </div>
              {/* Dynamic Category GST Breakdown */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span>GST / Taxes</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-1.5 py-0.5 rounded border border-emerald-200/50">
                      Category Rates
                    </span>
                  </span>
                  <span className="font-bold text-slate-900">{formatINR(taxPrice)}</span>
                </div>

                {categoryTaxBreakdown.length > 0 && (
                  <div className="pl-2.5 border-l-2 border-slate-200/80 space-y-1 text-[11px] text-slate-500 py-0.5">
                    {categoryTaxBreakdown.map((b: any) => (
                      <div key={b.category} className="flex justify-between items-center">
                        <span>
                          {b.category} ({b.taxRatePercentage}% GST
                          {b.isTaxInclusive ? " incl." : ""})
                        </span>
                        <span className="font-medium text-slate-700">
                          {b.taxRatePercentage === 0
                            ? "Exempt (₹0)"
                            : formatINR(b.taxAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Amount Paid</span>
                <span className="text-lg text-emerald-600 font-black">
                  {formatINR(totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 👉 RIGHT: SHIPPING & PAYMENT DETAILS */}
        <div className="space-y-6">
          {/* 📍 DELIVERY ADDRESS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delivery Address</h3>
                <p className="text-[11px] text-slate-400">Destination shipping profile</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p className="font-bold text-slate-900 text-sm">{customerName}</p>
              <p className="text-slate-600 leading-relaxed">{streetAddress}</p>
              <p className="text-slate-600">
                {[
                  order?.shippingAddress?.city || shipping.city,
                  order?.shippingAddress?.state || shipping.state,
                  order?.shippingAddress?.country || shipping.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "India"}
              </p>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-bold">
                  PIN: {pinCode}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href={`tel:${customerPhone}`} className="hover:text-emerald-600 font-medium">
                  {customerPhone}
                </a>
              </div>
              {customerEmail && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{customerEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* 💳 PAYMENT DETAILS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Payment Information</h3>
                <p className="text-[11px] text-slate-400">Verified Payment Gateway</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Method</span>
                <span className="font-bold text-slate-800">Online Gateway</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Payment Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  {paymentStatus}
                </span>
              </div>

              {order?.paymentInfo?.id && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Payment ID
                  </p>
                  <p className="font-mono text-slate-700 text-[11px] mt-0.5 break-all">
                    {order.paymentInfo.id}
                  </p>
                </div>
              )}

              {order?.paidAt && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500 font-medium">Paid Timestamp</span>
                  <span className="text-slate-700 font-semibold">
                    {new Date(order.paidAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 💬 HELP & SUPPORT BOX */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-900">Need Help with this Order?</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              If you received a damaged plant or have questions regarding fulfillment, our plant
              care team is here to assist.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Link href="/support" className="text-xs font-bold text-emerald-600 hover:underline">
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 WRITE REVIEW MODAL */}
      <WriteReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewProduct(null);
        }}
        product={reviewProduct}
        defaultAuthor={user?.name || customerName}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* 🔄 RETURN / REPLACEMENT MODAL */}
      <ReturnReplacementModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setReturnItem(null);
        }}
        order={order}
        item={returnItem}
        onSuccess={(reqData) => {
          const idKey = (
            returnItem?._id ||
            returnItem?.id ||
            returnItem?.item?._id ||
            returnItem?.item ||
            reqData?.itemId ||
            ""
          ).toString();

          if (idKey) {
            setReturnedItemStatusMap((prev) => ({
              ...prev,
              [idKey]: reqData?.status || "Pending",
            }));
          }
          fetchOrderDetails();
        }}
      />
    </div>
  );
}
