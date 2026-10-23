"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, X, LucideIcon } from "lucide-react";

// Flexible schema interface structure for polymorphic operations
export interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  menuItems: MenuItem[]; // Dynamic arrays configuration data pipeline
  logoHref?: string;
  panelTitle?: string;
}

export default function Sidebar({
  isOpen,
  setIsOpen,
  menuItems,
  logoHref = "/admin",
  panelTitle = "Urban Nursery Panel"
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* 🌑 Mobile Backdrop Blur Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 md:hidden ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* 🗂️ Main Navigation Drawer Panel */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 md:sticky md:top-0 h-screen w-[260px] bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 shrink-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
        }`}>

        {/* Sidebar Frame Header Branding */}
        <div className="h-[68px] px-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <Link href="/" className="no-underline flex justify-center items-center" onClick={() => setIsOpen(false)}>
            <Image
              src="/images/logo-new.png"
              alt="Urban Nursery Logo"
              width={200}
              height={70}
              className="object-contain h-20 w-auto brightness-[2] contrast-125 saturate-125 -ml-[15px] transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </Link>
          {/* <Link href="/">
              <Image
                src="/images/logo-new.png"
                alt="Urban Nursery Logo"
                width={110}
                height={36}
                priority
                className="object-contain w-auto h-auto transition-all duration-300 opacity-100 mix-blend-multiply drop-shadow-md"
              />
            </Link> */}

          {/* Close Trigger Button — Mobile Only */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 rounded-lg border-none bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation Nav Links Pipeline */}
        <nav className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-semibold no-underline transition-all duration-200 group ${isActive
                  ? "bg-green-600 text-white shadow-md shadow-green-600/10"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Drawer Bottom Exit Nodes */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-1.5 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-semibold text-slate-400 hover:bg-slate-800/60 hover:text-white no-underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>
    </>
  );
}