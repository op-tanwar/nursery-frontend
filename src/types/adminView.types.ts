/**
 * 1. Global Dashboard Metrics & Telemetry View
 * Target: Overview Cards, Quick Analytics Engine Charts
 */
export interface AdminStatsViewProps {
  onSectionNavigate: (targetView: "orders" | "users" | "applications") => void;
  onRefreshMetrics: () => Promise<void>;
}

/**
 * 2. User Directory Matrix Management View
 * Target: Customer profile handling, access controls, promotions/demotions
 */
export interface AdminUserViewProps {
  onViewUserDetails: (userId: string) => void;
  onPurgeUserNode: (userId: string) => Promise<void>;
  onRoleMutation: (userId: string, currentRole: "customer" | "admin") => Promise<void>;
}

/**
 * 3. Comprehensive Global Orders Ledger View
 * Target: Checkout pipelines tracking, updating logistics metrics, deletions
 */
export interface AdminOrdersViewProps {
  onSelectOrderLog: (orderId: string) => void;
  onUpdateLogisticsStatus: (orderId: string, nextStatus: "Pending" | "Processing" | "Completed") => Promise<void>;
  onPurgeOrderRecord: (orderId: string) => Promise<void>;
}

/**
 * 4. Vendor Onboarding Verification Processing View
 * Target: Reviewing documents, approving/rejecting storefront permissions
 */
export interface AdminNurseryApplicationsViewProps {
  onInspectApplication: (appId: string) => void;
  onProcessVerification: (
    appId: string,
    decision: { status: "Approved" | "Rejected"; rejectionReason?: string }
  ) => Promise<void>;
}

/**
 * 5. Dynamic Single Record Detail Modal / Drawer Panel View
 * Target: Reusable sheet injection context for deep metadata inspection
 * @template T - Target Entity Blueprint (e.g., UserRecord, OrderRecord)
 */
export interface AdminDetailDrawerProps<T> {
  entityId: string;
  dataSource: T | null;
  isOpen: boolean;
  onClosePanel: () => void;
  customActionsRenderer?: (data: T) => React.ReactNode;
}