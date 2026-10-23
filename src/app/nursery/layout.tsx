"use client";

import React, { useState } from "react";
import Sidebar, { MenuItem } from "@/components/dashboard-common/Sidebar";
import Navbar from "@/components/dashboard-common/Navbar";
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,      // <-- Added for Payouts
  Package,
  Sprout,
  FolderHeart,
  Droplets,
  Wrench,
  Layers,
  Flower2,
  Sparkles,
  Settings2,
  Upload,
  RotateCcw,
} from "lucide-react";
import AdminFooter from "@/components/dashboard-common/Footer";

// 🌿 Clean and Typed Navigation Menu Matrix Mapping
const NURSERY_MERCHANT_MENU: MenuItem[] = [
  // --- 1. Dashboard & Sales ---
  { name: "My Storefront", href: "/nursery", icon: LayoutDashboard },
  { name: "Incoming Orders", href: "/nursery/orders", icon: ShoppingCart },
  { name: "Returns / Replacements", href: "/nursery/return-replacement-requests", icon: RotateCcw },
  { name: "Payouts", href: "/nursery/payouts", icon: Wallet },

  // --- 2. Inventory & Catalog ---
  { name: "Plants Ingestion", href: "/nursery/plants", icon: Package },
  { name: "Seeds & Bulbs", href: "/nursery/seeds-bulbs", icon: Sprout },
  { name: "Pots & Planters", href: "/nursery/pots", icon: FolderHeart },
  { name: "Plant Care", href: "/nursery/plant-care", icon: Droplets },
  { name: "Gardening Tools", href: "/nursery/gardening-tools", icon: Wrench },
  { name: "Plant Stands", href: "/nursery/plant-stands-and-shelves", icon: Layers },
  { name: "Artificial Plants", href: "/nursery/artificial-dried-plants", icon: Flower2 },
  { name: "Accessories", href: "/nursery/accessories", icon: Sparkles },

  // --- 3. Settings & Admin ---
  { name: "My Nursery", href: "/nursery/my-nursery", icon: Settings2 },
  { name: "Upload Documents", href: "/nursery/upload-documents", icon: Upload },
];

export default function NurseryLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Primary Navigation Sidebar Layer */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        menuItems={NURSERY_MERCHANT_MENU}
        logoHref="/nursery"
      />

      {/* Viewport Core Content Pipeline */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar
          onMenuTrigger={() => setSidebarOpen(true)}
          panelTitle="Nursery Dashboard"
          roleLabel="Nursery Merchant"
        />

        {/* Main Content Node Execution Wrapper */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50/50">
          {children}
        </main>

        {/* Global Footer Tracking Panel Component */}
        <AdminFooter />
      </div>
    </div>
  );
}