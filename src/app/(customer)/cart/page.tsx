import type { Metadata } from "next";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
  title: "Your Cart | Urban Nursery",
  description: "Review your plant cart, apply coupon codes, and proceed to checkout for same-day local delivery.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/cart" },
};

export default function CartPage() {
  return <CartPageClient />;
}