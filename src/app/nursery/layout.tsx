"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar, { MenuItem } from "@/components/dashboard-common/Sidebar";
import Navbar from "@/components/dashboard-common/Navbar";
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
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
  AlertTriangle,
  AlertCircle,
  Clock,
} from "lucide-react";
import AdminFooter from "@/components/dashboard-common/Footer";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setMyNurseryProfileData } from "@/redux/slices/nurseryProfileSlice";
import { nurseryProfileService } from "@/services/nurseryProfileService";

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
  { name: "Plant Stands", href: "/nursery/plant-stands-shelves", icon: Layers },
  { name: "Artificial Plants", href: "/nursery/artificial-dried-plants", icon: Flower2 },
  { name: "Accessories", href: "/nursery/accessories", icon: Sparkles },

  // --- 3. Settings & Admin ---
  { name: "My Nursery", href: "/nursery/my-nursery", icon: Settings2 },
  { name: "Upload Documents", href: "/nursery/upload-documents", icon: Upload },
];

export default function NurseryLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { myProfile } = useAppSelector((state) => state.nurseryProfile);

  useEffect(() => {
    let isMounted = true;
    if (!myProfile) {
      nurseryProfileService
        .getMyNurseryProfile()
        .then((res) => {
          if (isMounted && res.success && res.profile) {
            dispatch(setMyNurseryProfileData(res.profile));
          }
        })
        .catch(() => {
          // Graceful fallback if offline or session initializing
        });
    }
    return () => {
      isMounted = false;
    };
  }, [myProfile, dispatch]);

  const isSuspendedOrInactive =
    myProfile &&
    (myProfile.isActive === false || myProfile.approvalStatus !== "Approved");

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

        {/* 🚨 Nursery Status Alert Banner (Shown if Suspended, Inactive, or Unapproved) */}
        {isSuspendedOrInactive && (
          <div className="px-4 sm:px-6 md:px-8 pt-4 shrink-0">
            {myProfile?.approvalStatus === "Rejected" ? (
              <div className="flex items-start sm:items-center justify-between gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl shadow-xs">
                <div className="flex items-start sm:items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-900 m-0">
                      Nursery Application Rejected
                    </h4>
                    <p className="text-xs text-rose-700 m-0 mt-0.5">
                      {myProfile.rejectionReason || "Compliance verification failed."} None of your products are visible on the public storefront.
                    </p>
                  </div>
                </div>
                <Link
                  href="/nursery/upload-documents"
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shrink-0 transition"
                >
                  Re-upload Docs
                </Link>
              </div>
            ) : myProfile?.approvalStatus === "Pending" ? (
              <div className="flex items-start sm:items-center justify-between gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl shadow-xs">
                <div className="flex items-start sm:items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-900 m-0">
                      Onboarding Approval Pending
                    </h4>
                    <p className="text-xs text-amber-700 m-0 mt-0.5">
                      Your vendor onboarding is currently under administrative review. Your products will automatically become visible on the public marketplace once approved.
                    </p>
                  </div>
                </div>
                <Link
                  href="/nursery/upload-documents"
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shrink-0 transition"
                >
                  View Status
                </Link>
              </div>
            ) : myProfile?.isActive === false ? (
              <div className="flex items-start sm:items-center justify-between gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl shadow-xs">
                <div className="flex items-start sm:items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-red-900 m-0">
                      Nursery Storefront Suspended / Inactive
                    </h4>
                    <p className="text-xs text-red-700 m-0 mt-0.5">
                      Your nursery has been deactivated or suspended by administration. None of your products are visible or purchasable anywhere on the public storefront.
                    </p>
                  </div>
                </div>
                <Link
                  href="/nursery/contact-admin-support"
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shrink-0 transition"
                >
                  Contact Admin
                </Link>
              </div>
            ) : null}
          </div>
        )}

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
