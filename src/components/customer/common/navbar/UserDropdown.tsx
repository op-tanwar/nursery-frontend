"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { User, LayoutDashboard, Store, UserCircle, Package, LogOut } from "lucide-react";

interface UserDropdownProps {
  readonly user: any;
  readonly userMenuOpen: boolean;
  readonly setUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readonly handleLogout: () => void;
  readonly textClass: string;
}

export default function UserDropdown({
  user,
  userMenuOpen,
  setUserMenuOpen,
  handleLogout,
  textClass,
}: UserDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setUserMenuOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setUserMenuOpen((prev) => !prev)}
        className={`cursor-pointer p-1.5 border-none flex items-center justify-center rounded-full hover:bg-slate-100 relative z-50 ${userMenuOpen ? "text-green-600 bg-slate-100" : textClass
          }`}
      >
        <User className="w-5 h-5" />
      </button>

      {userMenuOpen && (
        <div className="absolute right-0 mt-3.5 min-w-[240px] z-[110] origin-top-right bg-white border border-slate-200/80 rounded-xl p-1.5 flex flex-col gap-0.5 shadow-xl transition-all duration-200">
          <div className="px-4 py-3 mb-1 border-b border-slate-100 flex flex-col gap-0.5">
            <p className="text-sm font-bold text-slate-900 tracking-tight truncate m-0">
              {user?.name || "Urban Nursery User"}
            </p>
            <p className="text-[11.5px] font-medium text-slate-500 tracking-wide truncate m-0">
              {user?.email || "user@urbannursery.com"}
            </p>
          </div>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-semibold text-slate-700 rounded-lg no-underline hover:bg-green-600/5 hover:text-green-600 transition-all group"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          {user?.role === "nursery" && (
            <Link
              href="/nursery"
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-semibold text-slate-700 rounded-lg no-underline hover:bg-green-600/5 hover:text-green-600 transition-all group"
            >
              <Store className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
              <span>My Nursery</span>
            </Link>
          )}

          <Link
            href="/profile"
            onClick={() => setUserMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-slate-700 rounded-lg no-underline hover:bg-green-600/5 hover:text-green-600 transition-all group"
          >
            <UserCircle className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
            <span>My Profile</span>
          </Link>

          <Link
            href="/orders/me"
            onClick={() => setUserMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-slate-700 rounded-lg no-underline hover:bg-green-600/5 hover:text-green-600 transition-all group"
          >
            <Package className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
            <span>My Orders</span>
          </Link>

          <div className="h-px bg-slate-100 my-1 mx-2" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-semibold text-red-600 bg-transparent border-none w-full text-left rounded-lg cursor-pointer hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}