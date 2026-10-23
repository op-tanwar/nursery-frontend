import type { Metadata } from "next";
import WishlistPageClient from "./WishlistPageClient";

export const metadata: Metadata = {
  title: "My Wishlist | Urban Nursery India",
  description: "Your saved plants and pots from Urban Nursery. Move wishlist items to cart and get same-day local delivery.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/wishlist" },
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}