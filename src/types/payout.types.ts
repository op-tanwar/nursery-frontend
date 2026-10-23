export type PayoutStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";
export type PayoutMethod = "BANK_TRANSFER" | "UPI" | "MANUAL";

export interface IBankDetails {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  upiId?: string;
}

/** Immutable bank snapshot saved at time of payout request (audit trail) */
export interface IPayoutBankSnapshot {
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  accountHolderName?: string;
  upiId?: string;
}

export interface IPayoutSnapshot {
  grossEarnings: number;
  totalCommission: number;
  netEarnings: number;
  previouslyPaidOut: number;
  availableAtRequest: number;
}

export interface IPayoutRecord {
  _id: string;
  nursery: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: {
      url: string;
    };
  } | string;
  requestedAmount: number;
  /** Platform commission at time of request snapshot */
  commissionDeducted?: number;
  /** Net amount after commission deduction */
  netAmount?: number;
  status: PayoutStatus;
  payoutMethod?: PayoutMethod;
  requestedAt: string;
  processedAt?: string;
  utrNumber?: string;
  rejectionReason?: string;
  failureReason?: string;
  idempotencyKey?: string;
  snapshot?: IPayoutSnapshot;
  /** Immutable bank details captured at request time */
  bankDetailsSnapshot?: IPayoutBankSnapshot;
  processedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  /** Joined from NurseryProfile (admin list endpoint) */
  bankDetails?: IBankDetails | null;
  nurseryBusinessName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INurseryPayoutSummary {
  grossEarnings: number;
  totalCommission: number;
  netSales: number;
  totalPaidOut: number;
  pendingPayouts: number;
  availableBalance: number;
  hasNegativeBalance: boolean;
  totalOrdersCount: number;
  bankDetails?: IBankDetails | null;
  nurseryName: string;
  nextSettlementDate: string;
  nextSettlementLabel: string;
  status: "Available" | "Processing" | "NegativeBalance";
}

export interface INurseryPayoutSummaryResponse {
  success: boolean;
  summary: INurseryPayoutSummary;
}

export interface INurseryPayoutHistoryResponse {
  success: boolean;
  payouts: IPayoutRecord[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface ILedgerEntry {
  _id: string;
  nursery: string;
  entryType:
    | "COMMISSION_CHARGED"
    | "COMMISSION_REVERSED"
    | "PAYOUT_REQUESTED"
    | "PAYOUT_COMPLETED"
    | "PAYOUT_REJECTED";
  amount: number;
  direction: "CREDIT" | "DEBIT";
  description: string;
  orderId?: {
    _id: string;
    orderStatus: string;
    totalPrice: number;
    createdAt: string;
  };
  orderItemId?: string;
  payoutId?: string;
  metadata?: {
    itemModel?: string;
    itemName?: string;
    commissionRate?: number;
    lineGross?: number;
    quantity?: number;
    utrNumber?: string;
    adminNote?: string;
  };
  createdAt: string;
}

export interface ICommissionBreakdownResponse {
  success: boolean;
  ledgerEntries: ILedgerEntry[];
  reversalSummary: {
    totalCommissionReversed: number;
    cancellationCount: number;
  };
  pagination: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface IGlobalFinancials {
  grossGMV: number;
  platformCommission: number;
  nurseryPayoutPayable: number;
  totalCompletedPayouts: number;
  totalPendingPayouts: number;
  totalOrdersCount: number;
}

export interface IAdminPayoutsListResponse {
  success: boolean;
  payouts: IPayoutRecord[];
  globalFinancials: IGlobalFinancials;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
