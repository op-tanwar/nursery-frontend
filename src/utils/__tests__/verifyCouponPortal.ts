import { couponFormSchema } from "../../app/admin/coupons/types";
import { COUPON_ENDPOINTS } from "../../services/couponService";

function runCouponPortalAudit() {
  console.log("===============================================================");
  console.log("🎟️ STARTING ADMIN COUPON PORTAL & SCHEMA AUDIT");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, label: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${label}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${label}`);
      failed++;
    }
  }

  // 1. Endpoint Configuration Audit
  console.log("1️⃣ Endpoint Configuration Audit:");
  assert(
    COUPON_ENDPOINTS.BASE === "/coupons",
    "COUPON_ENDPOINTS.BASE is '/coupons'"
  );
  assert(
    COUPON_ENDPOINTS.VALIDATE === "/promotions/coupon/validate",
    "COUPON_ENDPOINTS.VALIDATE is '/promotions/coupon/validate'"
  );

  // 2. Zod Form Validation: Valid Percentage Coupon
  console.log("\n2️⃣ Zod Form Schema Validation Tests:");
  const validPercentagePayload = {
    code: "FESTIVE25",
    discountType: "percentage" as const,
    discountValue: 25,
    minOrderValue: 999,
    maxDiscountAmount: 300,
    usageLimit: 50,
    startDate: "2026-11-01",
    endDate: "2026-12-01",
    isActive: true,
  };

  const validResult = couponFormSchema.safeParse(validPercentagePayload);
  assert(validResult.success, "Valid percentage coupon schema parses successfully");

  // 3. Zod Form Validation: Percentage > 100% (Should fail)
  const invalidPercentPayload = {
    ...validPercentagePayload,
    discountValue: 120,
  };
  const invalidPercentResult = couponFormSchema.safeParse(invalidPercentPayload);
  assert(!invalidPercentResult.success, "Percentage > 100% is rejected by schema");

  // 4. Zod Form Validation: Percentage without maxDiscountAmount (Should fail)
  const missingCapPayload = {
    ...validPercentagePayload,
    maxDiscountAmount: undefined,
  };
  const missingCapResult = couponFormSchema.safeParse(missingCapPayload);
  assert(!missingCapResult.success, "Percentage without maxDiscountAmount is rejected");

  // 5. Zod Form Validation: Valid Flat Coupon
  const validFlatPayload = {
    code: "WELCOME150",
    discountType: "flat" as const,
    discountValue: 150,
    minOrderValue: 499,
    maxDiscountAmount: undefined,
    usageLimit: null,
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    isActive: true,
  };
  const validFlatResult = couponFormSchema.safeParse(validFlatPayload);
  assert(validFlatResult.success, "Valid flat discount coupon parses without maxDiscountAmount");

  // 6. Zod Form Validation: Invalid Dates (endDate <= startDate)
  const invalidDatePayload = {
    ...validPercentagePayload,
    startDate: "2026-12-15",
    endDate: "2026-11-01",
  };
  const invalidDateResult = couponFormSchema.safeParse(invalidDatePayload);
  assert(!invalidDateResult.success, "endDate before startDate is rejected");

  // 7. Zod Form Validation: Code too short (< 3 chars)
  const shortCodePayload = {
    ...validPercentagePayload,
    code: "AB",
  };
  const shortCodeResult = couponFormSchema.safeParse(shortCodePayload);
  assert(!shortCodeResult.success, "Code < 3 characters is rejected");

  // 8. Code with invalid special characters (Should fail)
  const specialCharsPayload = {
    ...validPercentagePayload,
    code: "DISCOUNT@50",
  };
  const specialCharsResult = couponFormSchema.safeParse(specialCharsPayload);
  assert(!specialCharsResult.success, "Code with '@' special character is rejected");

  console.log("\n===============================================================");
  console.log(`📊 AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runCouponPortalAudit();
