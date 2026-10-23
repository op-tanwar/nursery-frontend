"use client";

import React, { useEffect, useMemo, useState } from "react";
import DataTable, { ColumnConfig } from "@/components/dashboard-common/DataTable";
import { Eye, AlertTriangle, Loader2, Package, Layers, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { orderService } from "@/services/orderService";
import { setOrderLoading, setOrderError, setMyOrdersData } from "@/redux/slices/orderSlice";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

// ======================================================================
// 📑 TYPES & CONTRACT IMPLEMENTATION (DIRECT MATCHING WITH MONGOOSE SCHEMA)
// ======================================================================
export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface IProductImage {
  public_id: string;
  url: string;
}

export interface IBackendShippingInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

export interface IPopulatedItem {
  _id: string;
  name?: string;
  price?: number;
  images?: IProductImage[];
  coverImage?: IProductImage;
}

export interface IPopulatedNursery {
  _id: string;
  name?: string;
  email?: string;
}

export interface IBackendOrderItem {
  item: string | IPopulatedItem;
  price: number;
  quantity: number;
  itemModel: "Plant" | "Pot" | "Accessory";
  nursery: string | IPopulatedNursery;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Claimed";
  claim?: {
    isClaimed: boolean;
    claimType?: "Replacement" | "Refund";
    reason?: string;
    proofUrl?: string;
    status?: "Pending" | "Approved" | "Rejected";
    claimedAt?: string;
  };
}

export interface IOrder {
  _id: string;
  user: any;
  shippingInfo: IBackendShippingInfo;
  orderItems: IBackendOrderItem[];
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: OrderStatus;
  paymentInfo: {
    id: string;
    orderId: string;
    status: string;
  };
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderRecord {
  _id: string;
  idDisplay: string;
  user: string;
  userId: string;
  date: string;
  total: string;
  rawTotal: number;
  status: OrderStatus;
  products: {
    id: string;
    name: string;
    model: string;
    imageUrl: string | null;
    quantity: number;
    nurseryName: string;
    nurseryId: string;
  }[];
  itemCount: number;
}

export default function NurseryOrdersPage() {
  const dispatch = useAppDispatch();
  const { orders: reduxOrders, isLoading, error } = useAppSelector((state) => state.order) as any;
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadNurseryOrders = async () => {
    dispatch(setOrderLoading(true));
    dispatch(setOrderError(null));
    try {
      const response = await orderService.getNurseryOrders();
      const rawRecords = Array.isArray(response)
        ? response
        : response?.orders || response?.orders || [];
      dispatch(setMyOrdersData(rawRecords));
    } catch (err: any) {
      console.error("Nursery orders extraction error:", err);
      dispatch(
        setOrderError(
          err?.response?.data?.message || err?.message || "Failed to load nursery specific inventory contracts."
        )
      );
      toast.error("Failed to sync nursery ledger streams.");
    }
  };

  useEffect(() => {
    loadNurseryOrders();
  }, [dispatch]);

  const mappedOrders = useMemo<OrderRecord[]>(() => {
    if (!reduxOrders || !Array.isArray(reduxOrders)) return [];

    return (reduxOrders as IOrder[]).map((order) => {
      const targetId = order._id || "";
      const backendItems = order.orderItems || [];

      const normalizedProducts = backendItems.map((orderItem) => {
        const rawItem = orderItem.item;
        const rawNursery = orderItem.nursery;

        let productId = "Unknown ID";
        let productName = "Unnamed Product";
        let productImg: string | null = null;

        if (rawItem && typeof rawItem === "object") {
          productId = rawItem._id || productId;
          productName = rawItem.name || `Generic ${orderItem.itemModel}`;
          productImg = rawItem.coverImage?.url || rawItem.images?.[0]?.url || null;
        } else if (typeof rawItem === "string") {
          productId = rawItem;
        }

        let nurseryId = "Unknown Nursery ID";
        let nurseryName = "Primary Nursery";

        if (rawNursery && typeof rawNursery === "object") {
          nurseryId = rawNursery._id || nurseryId;
          nurseryName = rawNursery.name || "Nursery Partner";
        } else if (typeof rawNursery === "string") {
          nurseryId = rawNursery;
        }

        return {
          id: productId,
          name: productName,
          model: orderItem.itemModel,
          imageUrl: productImg,
          quantity: orderItem.quantity,
          nurseryName,
          nurseryId,
        };
      });

      const customerName =
        order.shippingInfo?.name ||
        (typeof order.user === "object" && order.user?.name) ||
        "Guest User";

      let extractedUserId = "N/A";
      if (order.user) {
        extractedUserId = typeof order.user === "object" ? order.user._id || "N/A" : order.user;
      }

      const totalRevenue = order.totalPrice ?? order.itemsPrice ?? 0;

      return {
        _id: targetId,
        idDisplay: targetId,
        user: customerName,
        userId: extractedUserId,
        date: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          : "Recent",
        total: `₹${totalRevenue.toLocaleString("en-IN")}`,
        rawTotal: totalRevenue,
        status: order.orderStatus || "Processing",
        products: normalizedProducts,
        itemCount: normalizedProducts.reduce((acc, curr) => acc + curr.quantity, 0),
      };
    });
  }, [reduxOrders]);

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    const targetStatus = (nextStatus === "Completed" ? "Delivered" : nextStatus) as OrderStatus;

    const confirmProceed = window.confirm(
      `Confirm shifting Order #${orderId} status pipeline to "${nextStatus}"?`
    );
    if (!confirmProceed) return;

    setUpdatingId(orderId);
    const resolveToast = toast.loading(`Updating fulfillment flow to ${nextStatus}...`);

    try {
      await orderService.updateNurseryOrderStatus(orderId, { status: targetStatus });

      const updatedArray: any = (reduxOrders as IOrder[]).map((ord) =>
        ord._id === orderId ? { ...ord, orderStatus: targetStatus } : ord
      );
      dispatch(setMyOrdersData(updatedArray));

      toast.success(`Pipeline status advanced to ${nextStatus}!`, { id: resolveToast });
    } catch (err: any) {
      const fallbackErrorMessage = err?.response?.data?.message || err.message || "Fulfillment update mutation rejected.";
      toast.error(`Update failed: ${fallbackErrorMessage}`, { id: resolveToast });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeStyles = (status: OrderStatus) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500/20";
      case "Processing":
      case "Shipped":
        return "bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500/20";
      case "Pending":
        return "bg-sky-50 text-sky-700 border-sky-200 focus:ring-sky-500/20";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500/20";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200 focus:ring-slate-500/20";
    }
  };

  const columns = useMemo<ColumnConfig<OrderRecord>[]>(() => [
    {
      header: "Identity References",
      accessorKey: "idDisplay",
      className: "font-mono text-left min-w-[150px] text-xs antialiased",
      cell: (row) => (
        <div className="flex flex-col gap-1.5 py-0.5">
          <div className="flex flex-col">
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
            <span className="bg-slate-100 font-bold text-slate-700 px-2 py-0.5 rounded-sm select-all inline-block w-fit">
              {row._id}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
              <User className="w-2.5 h-2.5" /> User ID
            </span>
            <span className="bg-stone-100 text-stone-600 font-medium px-2 py-0.5 rounded-sm select-all inline-block w-fit tracking-tight">
              {row.userId}
            </span>
          </div>
        </div>
      )
    },
    {
      header: "Products & Line Items",
      accessorKey: "products",
      className: "min-w-[340px] max-w-[450px]",
      cell: (row) => (
        <div className="flex flex-col gap-2.5 my-1">
          {row.products.map((prod, idx) => (
            <div key={`${prod.id}-${idx}`} className="flex items-start gap-3 border-b border-dashed border-slate-100 last:border-none pb-2 last:pb-0">
              <div className="relative w-9 h-9 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                {prod.imageUrl ? (
                  <Image
                    src={prod.imageUrl}
                    alt={prod.name}
                    fill
                    sizes="36px"
                    className="object-cover"
                    unoptimized={true}
                  />
                ) : (
                  <Package className="w-4 h-4 text-slate-400" />
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-900 text-xs truncate max-w-[280px]">
                  {prod.name} <span className="text-slate-400 font-normal">({prod.quantity}x)</span>
                </span>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[10px] text-slate-500 font-medium">
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-xs flex items-center gap-0.5 font-semibold">
                    <Layers className="w-2.5 h-2.5" /> {prod.model}
                  </span>
                  <span className="text-slate-400 font-mono">ID: {prod.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      header: "Customer Allocation",
      accessorKey: "user",
      className: "font-semibold text-slate-800 text-xs",
    },
    {
      header: "Contract Value",
      accessorKey: "total",
      className: "font-black text-slate-900 text-xs",
    },
    {
      header: "Timestamp",
      accessorKey: "date",
      className: "text-slate-500 text-xs",
    },
    {
      header: "Fulfillment Status",
      accessorKey: "status",
      cell: (row) => {
        const isCurrentRowUpdating = updatingId === row._id;
        const selectValue = row.status === "Delivered" ? "Completed" : row.status;

        return (
          <div className="flex items-center gap-2">
            {isCurrentRowUpdating ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-green-600" />
                <span>Syncing...</span>
              </div>
            ) : (
              <div className="relative inline-block">
                <select
                  value={selectValue}
                  onChange={(e) => handleStatusChange(row._id, e.target.value)}
                  disabled={updatingId !== null}
                  className={`px-2.5 py-1 pr-7 text-[11px] font-bold rounded-full border cursor-pointer outline-hidden appearance-none transition-all hover:shadow-xs focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusBadgeStyles(row.status)}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-current opacity-60" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "_id",
      className: "text-right",
      cell: (row) => {
        const targetId = row?._id || (row as any)?.orderId || (row as any)?.id;
        if (!targetId) return null;
        return (
          <Link
            href={`/nursery/orders/${targetId}`}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1 cursor-pointer font-medium shadow-2xs"
            title={`Inspect Order #${targetId}`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline text-[11px] px-0.5 font-semibold">Inspect</span>
          </Link>
        );
      },
    },
  ], [updatingId, reduxOrders]);

  const statusFilterOptions = ["Pending", "Processing", "Shipped", "Completed", "Cancelled"];

  return (
    <div className="flex flex-col gap-6 w-full antialiased text-slate-800 p-4 md:p-6 bg-background min-h-screen overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 m-0">Nursery Order Panel</h1>
          <p className="text-slate-500 text-xs sm:text-sm m-0 mt-1">
            Manage your store's specific live inventory allocation pipelines, track line items, and manage fulfillment status.
          </p>
        </div>
        <button
          type="button"
          onClick={loadNurseryOrders}
          disabled={isLoading}
          className="self-start sm:self-center px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-xs inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Loader2 className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Sync Stream
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <p className="m-0 font-medium">{error}</p>
        </div>
      )}

      {isLoading && mappedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-2xl gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-xs text-slate-400 font-medium">Extracting regional supplier ledger blocks...</span>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <DataTable<OrderRecord>
            data={mappedOrders}
            columns={columns}
            searchPlaceholder="Search customer allocation..."
            searchKey="user"
            filterKey="status"
            filterOptions={statusFilterOptions}
          />
        </div>
      )}
    </div>
  );
}