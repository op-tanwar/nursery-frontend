import { z } from "zod";
import { ICoupon, DiscountType, CouponStats } from "@/services/couponService";

export type { ICoupon, DiscountType, CouponStats };

export const couponFormSchema = z
  .object({
    code: z
      .string({ message: "Coupon code is required" })
      .min(3, "Code must be at least 3 characters")
      .max(20, "Code cannot exceed 20 characters")
      .regex(/^[A-Za-z0-9_-]+$/, "Only alphanumeric characters, dashes, and underscores allowed"),
    discountType: z.enum(["percentage", "flat"], {
      message: "Please select discount model",
    }),
    discountValue: z
      .number({ message: "Must be a valid number" })
      .positive("Discount value must be greater than 0"),
    minOrderValue: z
      .number({ message: "Must be a valid number" })
      .min(0, "Minimum order cannot be negative"),
    maxDiscountAmount: z
      .number({ message: "Must be a valid number" })
      .positive("Max discount must be greater than 0")
      .optional()
      .nullable(),
    usageLimit: z
      .number({ message: "Must be a valid number" })
      .int("Must be an integer")
      .positive("Usage limit must be at least 1")
      .optional()
      .nullable(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.discountType === "percentage") {
        return data.discountValue > 0 && data.discountValue <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount must be between 1% and 100%",
      path: ["discountValue"],
    }
  )
  .refine(
    (data) => {
      if (data.discountType === "percentage") {
        return (
          data.maxDiscountAmount !== undefined &&
          data.maxDiscountAmount !== null &&
          data.maxDiscountAmount > 0
        );
      }
      return true;
    },
    {
      message: "Max discount amount is required for percentage discounts",
      path: ["maxDiscountAmount"],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export type CouponFormData = z.infer<typeof couponFormSchema>;

export type StatusFilter = "all" | "active" | "expired" | "inactive";
export type DiscountFilter = "all" | "percentage" | "flat";
