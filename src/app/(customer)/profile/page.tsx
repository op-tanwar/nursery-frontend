import type { Metadata } from "next";
import ProfilePageClient from "./ProfilePageClient";

export const metadata: Metadata = {
  title: "My Profile | Urban Nursery India",
  description: "Manage your Urban Nursery account — update your name, address, profile photo, and delivery preferences.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/profile" },
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}