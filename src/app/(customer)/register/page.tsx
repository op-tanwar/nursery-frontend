import { Suspense } from "react";
import type { Metadata } from "next";
import AuthPageClient from "@/components/customer/auth/AuthPageClient";

export const metadata: Metadata = {
  title: "Create Account | Urban Nursery",
  description: "Join Urban Nursery to discover plants from local certified nurseries. Sign up for same-day delivery and a personalised plant wishlist.",
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageClient />
    </Suspense>
  );
}

