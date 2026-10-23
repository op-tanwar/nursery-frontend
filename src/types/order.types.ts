export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface IProductImage {
  public_id: string;
  url: string;
}

export interface IProductReference {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: IProductImage[];
  coverImage?: IProductImage;
}

export interface ICartItem {
  product: IProductReference;
  quantity: number;
}

export interface IShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

// Backend Explicit Types (Direct Payload Matching)
export interface IBackendShippingInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

export interface IBackendOrderItem {
  item: string;
  productId?: string;
  price?: number;
  priceAtPurchase?: number;
  originalPrice?: number;
  discountPrice?: number;
  quantity: number;
  itemModel:
    | "Plant"
    | "Pot"
    | "Accessory"
    | "GardeningTool"
    | "PlantCare"
    | "SeedsBulbs"
    | "PlantStandsShelves"
    | "ArtificialDriedPlant";
  nursery?: string;
  status?: string;
  claim?: {
    isClaimed: boolean;
    status: string;
  };
}

export interface IOrder {
  _id: string;
  user: string;

  // App fallbacks compatibility architecture
  items: ICartItem[];
  shippingAddress: IShippingAddress;
  totals: {
    itemsSubtotal: number;
    taxAmount: number;
    shippingCost: number;
    grandTotal: number;
  };

  // Direct Network Keys Structure Realignment
  shippingInfo?: IBackendShippingInfo;
  paymentInfo?: {
    id: string;
    status: string;
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  };
  orderItems?: IBackendOrderItem[];
  itemsPrice?: number;
  taxPrice?: number;
  shippingPrice?: number;
  totalPrice?: number;

  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// Payload schema synced exactly with checkout network transaction format
export interface CreateOrderPayload {
  shippingInfo: IBackendShippingInfo;
  orderItems: IBackendOrderItem[];
  paymentInfo: {
    id: string;
    status: string;
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

export interface ClaimRequestPayload { orderId: string; itemId: string; reason: string; description?: string; }
export interface UpdateStatusPayload { status: OrderStatus; }

// Network API Responses Contracts
export interface OrderResponse { success: boolean; order: IOrder; }
export interface GetMyOrdersResponse { success: boolean; orders: IOrder[]; }
export interface AllOrdersResponse { success: boolean; count: number; orders: IOrder[]; }
export interface DashboardStatsResponse {
  success: boolean;
  stats: { totalOrders: number; totalRevenue: number; pendingOrders: number; deliveredOrders: number; graphData?: { month: string; sales: number }[] };
}
export interface OrderDetailsResponse { success: boolean; order: IOrder; }