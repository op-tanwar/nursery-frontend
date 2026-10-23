import React from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/customer/common/navbar/Navbar";

// ⚡ PERF: Footer is below-fold — code-split so it doesn't inflate initial JS/TBT
const Footer = dynamic(() => import("@/components/customer/common/Footer"));

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: Readonly<CustomerLayoutProps>) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background relative">
      <Navbar />
      <main className="flex-grow w-full flex flex-col">{children}</main>
      <Footer />
      {/* PincodeModal is owned by Navbar (controlled state) — avoid duplicate mount */}
    </div>
  );
}
