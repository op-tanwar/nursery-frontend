import type { Metadata } from "next";
import ResetPasswordPageClient from "./ResetPasswordPageClient";

export const metadata: Metadata = {
  title: "Reset Password | Urban Nursery",
  description: "Set a new secure password for your Urban Nursery account.",
};

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return <ResetPasswordPageClient params={params} />;
}