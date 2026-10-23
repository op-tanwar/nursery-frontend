import { z } from "zod";

const indianPinCodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit PIN code.");

export const nurseryApplySchema = z.object({
  businessName: z.string().min(3, "Business name must be at least 3 characters").trim(),
  businessEmail: z.string().email("Invalid business email address").trim().toLowerCase(),
  businessPhone: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  city: z.string().min(2, "City name is too short").trim(),
  address: z.string().min(10, "Please provide a more detailed address").trim(),
  pinCode: indianPinCodeSchema,
});

export type TNurseryApplyFormValues = z.infer<typeof nurseryApplySchema>;
