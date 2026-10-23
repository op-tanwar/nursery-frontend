"use client";

import React, { useState } from "react";
import Sidebar, { MenuItem } from "@/components/dashboard-common/Sidebar";
import Navbar from "@/components/dashboard-common/Navbar";
import { LayoutDashboard, ShoppingBag, Leaf, Users, Settings, Wallet, Mail, Building2, Percent, BadgePercent, RotateCcw } from "lucide-react";
import AdminFooter from "@/components/dashboard-common/Footer";
const SUPER_ADMIN_MENU: MenuItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Returns / Claims", href: "/admin/return-replacement-requests", icon: RotateCcw },
  { name: "Bulk Orders", href: "/admin/bulk-orders", icon: Building2 },
  { name: "Vendor Payouts", href: "/admin/payouts", icon: Wallet },
  { name: "Inventory", href: "/admin/inventory", icon: Leaf },
  { name: "Users & Vendors", href: "/admin/users", icon: Users },
  { name: "Nursery Request", href: "/admin/nursery-applications", icon: Users },
  { name: "Subscribers", href: "/admin/newsletter-subscribers", icon: Mail },
  { name: "Reviews", href: "/admin/reviews", icon: Users },
  { name: "Blogs", href: "/admin/blogs", icon: Users },
  { name: "Tax Settings", href: "/admin/tax-settings", icon: Percent },
  { name: "Product Commission", href: "/admin/product-commission", icon: BadgePercent },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} menuItems={SUPER_ADMIN_MENU} logoHref="/admin" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuTrigger={() => setSidebarOpen(true)} panelTitle="Admin Panel" roleLabel="System Controller" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-background">
          {children}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}