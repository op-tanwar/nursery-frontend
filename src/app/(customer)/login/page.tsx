import { Suspense } from "react";
import type { Metadata } from "next";
import AuthPageClient from "@/components/customer/auth/AuthPageClient";

export const metadata: Metadata = {
  title: "Login or Sign Up | Urban Nursery",
  description: "Sign in to your Urban Nursery account to track orders, manage your wishlist, and access your local plant marketplace.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageClient />
    </Suspense>
  );
}