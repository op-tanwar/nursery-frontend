import type { Metadata } from "next";
import CheckoutPageClient from "./CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout | Urban Nursery",
  description: "Complete your plant order. Enter delivery details, apply coupons, and pay securely via UPI, card, or net banking.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/checkout" },
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}