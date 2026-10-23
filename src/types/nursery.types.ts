export interface NurseryStatsViewProps {
  onRefreshMetrics: () => Promise<void>;
  onSectionNavigate: (targetView: "inventory" | "orders") => void;
}

/**
 * ⚡ Multi-Product Core Inventory View Config Matrix
 * Supports absolute modular controls for Plants, Pots, and Accessories
 */
export interface NurseryInventoryViewProps {
  activeModule: "Plants" | "Pots" | "Accessories";
  onEditAssetDetails: (id: string, assetType: "plant" | "pot" | "accessory") => void;
  onPurgeAssetNode: (id: string, name: string, assetType: "plant" | "pot" | "accessory") => Promise<void>;
  onSyncStockUnits: (id: string, currentStock: number, assetType: "plant" | "pot" | "accessory") => Promise<void>;
}

export interface NurseryOrdersViewProps {
  onSelectOrderLog: (orderId: string) => void;
  onUpdateFulfillmentStatus: (
    orderId: string,
    nextStatus: "Placed" | "Processing" | "Shipped" | "Delivered"
  ) => Promise<void>;
}

export interface NurseryDetailDrawerProps<T> {
  entityId: string;
  dataSource: T | null;
  isOpen: boolean;
  onClosePanel: () => void;
  customActionsRenderer?: (data: T) => React.ReactNode;
}

// export interface INurseryApplyInput {
//   businessName: string;
//   businessEmail: string;
//   businessPhone: string;
//   businessAddress?: any; // ? लगाने से यह ऑप्शनल हो जाएगा
//   bankDetails?: any;     // ? लगाने से यह ऑप्शनल हो जाएगा
// }