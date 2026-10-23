import { ShopItemType } from "@/components/customer/common/ShopItemCard";
import { INurseryProfile } from "./nurseryProfile.types";

export interface IVendorStats {
  lifetimeRating: number;
  totalReviews: number;
  totalSales: number;
  productsCount: number;
  responseRate: string;
}

export interface IRatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface IVendorDetails {
  id: string;
  nurseryId: string;
  name: string;
  businessName?: string;
  slug: string;
  avatar: string;
  coverImage: string;
  verified: boolean;
  joinedDate: string;
  location: string;
  bio: string;
  description?: string;
  rating?: number;
  stats: IVendorStats;
  ratingBreakdown: IRatingBreakdown;
  products: ShopItemType[];
}

export interface IVendorPublicResponse {
  success: boolean;
  vendor: IVendorDetails;
  message?: string;
}

export interface IVendorAdminDetail {
  profile: INurseryProfile;
  inventorySummary: {
    totalProducts: number;
    plantsCount: number;
    potsCount: number;
    accessoriesCount: number;
    gardeningToolsCount: number;
    plantCareCount: number;
    seedsBulbsCount: number;
    plantStandsCount: number;
    artificialDriedPlantsCount: number;
    plants: any[];
    pots: any[];
    accessories: any[];
    gardeningTools: any[];
    plantCare: any[];
    seedsBulbs: any[];
    plantStands: any[];
    artificialDriedPlants: any[];
  };
  ordersSummary: {
    totalOrders: number;
    totalGrossRevenue: number;
  };
}

export interface IVendorAdminDetailResponse {
  success: boolean;
  vendor: IVendorAdminDetail;
  message?: string;
}
