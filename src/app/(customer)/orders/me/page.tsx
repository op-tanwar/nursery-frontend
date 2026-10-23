import type { Metadata } from "next";
import OrdersPageClient from "./OrdersPageClient";

export const metadata: Metadata = {
  title: "My Orders | Urban Nursery India",
  description: "Track and manage all your Urban Nursery plant orders. View order status, delivery timeline, and reorder your favourite plants.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/orders/me" },
};

export default function MyOrdersPage() {
  return <OrdersPageClient />;
}