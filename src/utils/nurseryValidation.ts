/**
 * ======================================================================
 * 🛡️ NURSERY / VENDOR ACTIVE STATUS VALIDATOR
 * ======================================================================
 * Centralized, shared helper function to evaluate nursery / vendor active status.
 * Safely handles:
 * - Populated NurseryProfile objects ({ isActive, status, approvalStatus, isBlocked })
 * - Linked User objects ({ isActive, status, isBlocked })
 * - String vendor IDs or status tokens
 * - Undefined / null / partial references (defaults to active unless explicitly suspended/blocked)
 * ======================================================================
 */

export interface INurseryStatusCandidate {
  _id?: string;
  id?: string;
  isActive?: boolean;
  active?: boolean;
  isBlocked?: boolean;
  isSuspended?: boolean;
  status?: string;
  approvalStatus?: string;
  verificationStatus?: string;
  nursery?: any;
}

/**
 * 🌿 Returns true if a nursery/vendor is active and approved for commerce.
 * Returns false ONLY when explicitly deactivated, suspended, blocked, or rejected.
 */
export function isNurseryActive(nursery: INurseryStatusCandidate | string | null | undefined): boolean {
  if (!nursery) {
    // Platform direct or unspecified nursery safely defaults to active
    return true;
  }

  // 1. String token evaluation
  if (typeof nursery === "string") {
    const clean = nursery.trim().toLowerCase();
    if (clean === "suspended" || clean === "inactive" || clean === "blocked" || clean === "rejected") {
      return false;
    }
    // Plain ObjectId or businessName string defaults to active
    return true;
  }

  // 2. Direct boolean flags
  if (
    nursery.isActive === false ||
    nursery.active === false ||
    nursery.isBlocked === true ||
    nursery.isSuspended === true
  ) {
    return false;
  }

  // 3. String status flags (case-insensitive)
  const status = String(nursery.status || "").trim().toLowerCase();
  if (status === "suspended" || status === "inactive" || status === "blocked") {
    return false;
  }

  // 4. Approval status flags
  const approval = String(nursery.approvalStatus || "").trim().toLowerCase();
  if (approval === "rejected" || approval === "suspended" || approval === "blocked") {
    return false;
  }

  // 5. Nested linked user evaluation (if populated under nursery.nursery or nursery.user)
  if (typeof nursery.nursery === "object" && nursery.nursery !== null) {
    if (!isNurseryActive(nursery.nursery)) {
      return false;
    }
  }

  return true;
}
