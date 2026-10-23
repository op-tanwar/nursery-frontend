// ======================================================================
// Dashboard Type Definitions — Nursery & Admin
// Financial model: Net = Gross − Commission (paise-rounded)
// Fee rules: Plant 30% | Pot 25% | Accessory 20%
// ======================================================================

export type TimeframeFilter =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_year"
  | "lifetime"
  | "custom";

export type ProductCategory =
  | "Plant"
  | "Pot"
  | "Accessory"
  | "GardeningTool"
  | "PlantCare"
  | "SeedsBulbs"
  | "PlantStandsShelves"
  | "ArtificialDriedPlant";

export type OrderStatus =
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned"
  | "Refunded"
  | "Claimed";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface ICustomDateRange {
  startDate: string;
  endDate: string;
}

/** Platform fee rates by product category (0.3 = 30%) */
export interface ICommissionRates {
  Plant: number;
  Pot: number;
  Accessory: number;
  GardeningTool?: number;
  PlantCare?: number;
  SeedsBulbs?: number;
  PlantStandsShelves?: number;
  ArtificialDriedPlant?: number;
  [key: string]: number | undefined;
}

export const DEFAULT_COMMISSION_RATES: ICommissionRates = {
  Plant: 0.3,
  Pot: 0.25,
  Accessory: 0.2,
  GardeningTool: 0.2,
  PlantCare: 0.2,
  SeedsBulbs: 0.2,
  PlantStandsShelves: 0.2,
  ArtificialDriedPlant: 0.2,
};

/** Nursery-scoped period rollup */
export interface IPeriodMetrics {
  grossRevenue: number;
  commission: number;
  nurseryEarnings: number;
  ordersCount: number;
}

/** Platform-wide period rollup */
export interface IGlobalPeriodMetrics {
  grossGMV: number;
  commission: number;
  nurseryPayout: number;
  ordersCount: number;
}

export interface IInventorySummary {
  totalProducts: number;
  plants: number;
  pots: number;
  accessories: number;
  gardeningTools?: number;
  plantCare?: number;
  seedsBulbs?: number;
  plantStands?: number;
  artificialDriedPlants?: number;
  /** stock < 10 (includes out of stock) */
  lowStockCount: number;
  /** stock === 0 */
  outOfStockCount: number;
  /** stock >= 10 */
  healthyStockCount?: number;
  /** stock > 0 */
  inStockCount?: number;
}

export interface IDashboardMetrics {
  /** Total amount customers paid at checkout (item GMV) */
  grossRevenue: number;
  /** Platform fee deducted from gross */
  commissionDeducted: number;
  /** Exact nursery share: Gross − Commission */
  netPayablePayout: number;
  totalOrders: number;
  totalItemsSold?: number;
  /** Admin aliases for the same underlying figures */
  totalGrossGMV?: number;
  netPlatformCommissionRevenue?: number;
  netProductSales?: number;
  shippingCollected?: number;
  taxCollected?: number;
  users?: {
    customers: number;
    nurseries: number;
    admins: number;
  };
  inventorySummary: IInventorySummary;
}

export interface IPayoutInfo {
  /** Current week net earnings still accruing */
  weeklyPayable: number;
  /** Last week cycle awaiting Monday settlement */
  pendingPayout: number;
  /** Lifetime net already settled (excludes current + pending week) */
  paidAmount: number;
  upcomingSettlement?: number;
  /** ISO date YYYY-MM-DD */
  nextSettlementDate: string;
  /** Human label e.g. "Next payout on Monday, 27 Jul" */
  nextSettlementLabel?: string;
  status?: string;
  totalPaidOut?: number;
  pendingPayouts?: number;
  availableBalance?: number;
  hasNegativeBalance?: boolean;
}

export interface ITrendPoint {
  date: string;
  grossRevenue: number;
  netPayout: number;
  commission?: number;
  ordersCount?: number;
}

export interface ILowStockItem {
  _id: string;
  name: string;
  stock: number;
  price: number;
  type: ProductCategory;
  stockStatus?: StockStatus;
}

export interface ICategoryBreakdown {
  category: ProductCategory;
  commissionRate: number;
  grossRevenue: number;
  revenue?: number;
  orderCount: number;
  ordersCount?: number;
  commission: number;
  netEarnings: number;
}

export interface ITopSellingProduct {
  _id: string;
  name: string;
  itemType: ProductCategory;
  quantitySold: number;
  grossRevenue: number;
  nurseryEarnings?: number;
}

/** Single line item on a recent order (e.g. "2x Snake Plant") */
export interface IOrderLineItem {
  name: string;
  quantity: number;
  category: ProductCategory;
  unitPrice: number;
  lineGross: number;
  lineCommission: number;
  lineNet: number;
  label: string;
}

export interface IRecentOrder {
  orderId: string;
  customerName?: string;
  items?: IOrderLineItem[];
  itemsSummary?: string;
  paymentStatus: string;
  orderStatus: OrderStatus | string;
  createdAt: string | Date;
  /** Gross item total for this nursery / order */
  totalAmount: number;
  /** Platform commission deducted */
  adminCommission?: number;
  /** Net nursery payout for this order */
  nurseryEarnings?: number;
}

export interface ITopNursery {
  nurseryId: string;
  nurseryName: string;
  totalSalesValue: number;
  itemsSold?: number;
  commissionGenerated: number;
  platformCommissionGenerated?: number;
  netNurseryPayout: number;
}

export interface ISettlementInfo {
  currentWeekSettlement: number;
  lastWeekSettlement: number;
  status: string;
  nextSettlementDate: string;
  nextSettlementLabel?: string;
}

export interface INurseryDashboardData {
  filterApplied: string;
  commissionRates?: ICommissionRates;
  metrics: IDashboardMetrics;
  payouts: IPayoutInfo;
  periodMetrics?: {
    today: IPeriodMetrics;
    yesterday: IPeriodMetrics;
    thisWeek: IPeriodMetrics;
    lastWeek: IPeriodMetrics;
    thisMonth: IPeriodMetrics;
    lastMonth: IPeriodMetrics;
    lifetime: IPeriodMetrics;
    [yearKey: string]: IPeriodMetrics;
  };
  settlementInfo?: ISettlementInfo;
  inventory?: {
    totalProducts: number;
    plants: number;
    pots: number;
    accessories: number;
    lowStock: number;
    outOfStock: number;
    healthyStock?: number;
    items: ILowStockItem[];
  };
  categoryPerformance: ICategoryBreakdown[];
  categorySales?: ICategoryBreakdown[];
  statusDistribution: Record<string, number>;
  orderStatusDistribution?: Record<string, number>;
  lowStockItems: ILowStockItem[];
  topSellingProducts: ITopSellingProduct[];
  recentOrders: IRecentOrder[];
  trends: ITrendPoint[];
}

export interface IAdminDashboardData {
  filterApplied: string;
  commissionRates?: ICommissionRates;
  metrics: IDashboardMetrics;
  payouts: IPayoutInfo;
  periodMetrics?: {
    today: IGlobalPeriodMetrics;
    yesterday: IGlobalPeriodMetrics;
    thisWeek: IGlobalPeriodMetrics;
    lastWeek: IGlobalPeriodMetrics;
    thisMonth: IGlobalPeriodMetrics;
    lastMonth: IGlobalPeriodMetrics;
    lifetime: IGlobalPeriodMetrics;
    [yearKey: string]: IGlobalPeriodMetrics;
  };
  users: {
    customers: number;
    nurseries: number;
    admins: number;
  };
  topNurseries: ITopNursery[];
  categoryPerformance: ICategoryBreakdown[];
  statusDistribution: Record<string, number>;
  orderStatusDistribution?: Record<string, number>;
  lowStockItems: ILowStockItem[];
  topSellingProducts: ITopSellingProduct[];
  recentPlatformOrders: IRecentOrder[];
  recentOrders?: IRecentOrder[];
  trends: ITrendPoint[];
}

export interface INurseryDashboardResponse extends INurseryDashboardData {
  success: boolean;
}

export interface IAdminDashboardResponse extends IAdminDashboardData {
  success: boolean;
}

/** Safe INR formatter — never returns NaN */
export const formatINR = (value: number | null | undefined): string => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `₹${safe.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const formatCommissionPercent = (rate: number): string =>
  `${Math.round((rate || 0) * 100)}%`;

/** @deprecated Use ITopNursery */
export type IAdminTopNursery = ITopNursery;

/** @deprecated Use IRecentOrder */
export type IAdminRecentOrder = IRecentOrder;
