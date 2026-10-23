"use client";

import React, { use } from "react";
import { useParams } from "next/navigation";
import OrderDetailsView from "@/components/dashboard-common/OrderDetailsView";

interface PageProps {
  params?: Promise<{ orderId: string }>;
}

export default function NurseryOrderDetailsPage({ params }: PageProps) {
  const urlParams = useParams<{ orderId?: string }>();
  const resolvedParams = params ? use(params) : null;
  const orderId = resolvedParams?.orderId || urlParams?.orderId || "";

  return <OrderDetailsView orderId={orderId} variant="nursery" />;
}
