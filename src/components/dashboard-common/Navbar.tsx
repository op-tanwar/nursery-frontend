"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  UserCircle,
  Menu,
  LogOut,
  User,
  Settings,
  ChevronDown,
  ShieldCheck,
  Headphones,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/slices/authSlice";

interface NavbarProps {
  onMenuTrigger: () => void;
  panelTitle?: string;
  roleLabel?: string;
}

export default function Navbar({
  onMenuTrigger,
  panelTitle = "Urban Nursery Panel",
  roleLabel = "System Controller",
}: NavbarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or ESC key press
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Clean Logout Action
  const handleLogout = () => {
    setIsDropdownOpen(false);

    // Clear auth cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    dispatch(logout());
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  // Helper for Profile Path based on user role
  const handleProfileNavigation = () => {
    setIsDropdownOpen(false);
    if (user?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/nursery/my-nursery");
    }
  };

  // Helper for Support / Settings Navigation based on role
  const handleSupportOrSettingsNavigation = () => {
    setIsDropdownOpen(false);
    if (user?.role === "nursery") {
      router.push("/nursery/contact-admin-support");
    } else {
      router.push("/admin/settings");
    }
  };

  return (
    <header className="h-[68px] w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 md:px-8 flex items-center justify-between shrink-0 relative z-40 transition-all">
      {/* Left Frame: Sidebar Switcher & Search Bar */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={onMenuTrigger}
          className="md:hidden flex items-center justify-center p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl cursor-pointer active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Open context navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Search Bar */}
        <div className="hidden sm:flex items-center relative w-[220px] md:w-[280px] lg:w-[320px]">
          <Search className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search metrics or dashboard..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/80 text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        {/* Mobile Header Title */}
        <div className="sm:hidden font-bold text-slate-900 tracking-tight text-base select-none">
          {panelTitle}
        </div>
      </div>

      {/* Right Frame: Actions & Profile Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* System Alert Trigger */}
        <button
          type="button"
          className="p-2 border border-transparent hover:border-slate-200 bg-transparent hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer relative transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
        </button>

        <div className="w-px h-6 bg-slate-200 hidden sm:block" />

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-2.5 p-1.5 rounded-2xl border transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${isDropdownOpen
              ? "bg-slate-100/80 border-slate-300 shadow-xs"
              : "bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200"
              }`}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            {/* Desktop User Meta */}
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 leading-none truncate max-w-[140px]">
                {user?.name || "Merchant Admin"}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 mt-1 tracking-wider uppercase flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                {roleLabel}
              </span>
            </div>

            {/* Avatar Container */}
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200/80 shrink-0 overflow-hidden relative shadow-xs">
              {user?.avatar && !imageError ? (
                <img
                  src={user.avatar}
                  alt={user?.name || "User Profile"}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <UserCircle className="w-5 h-5 text-slate-500" />
              )}
            </div>

            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-emerald-600" : ""
                }`}
            />
          </button>

          {/* Floating Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-2xl border border-slate-200/90 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              {/* Header profile card info */}
              <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 mx-2 rounded-xl mb-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shrink-0 overflow-hidden">
                  {user?.avatar && !imageError ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || "User Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.name || "Merchant Admin"}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {user?.email || "admin@urbannursery.com"}
                  </p>
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md tracking-wider uppercase mt-1 w-fit">
                    {roleLabel}
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="px-2 py-1 space-y-0.5">
                {/* Dynamic Profile Link */}
                <button
                  type="button"
                  onClick={handleProfileNavigation}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all border-none cursor-pointer group text-left"
                >
                  <User className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  <span>
                    {user?.role === "admin" ? "Admin Panel" : "My Nursery Profile"}
                  </span>
                </button>

                {/* Role-Based Contact Support / Settings Link */}
                <button
                  type="button"
                  onClick={handleSupportOrSettingsNavigation}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all border-none cursor-pointer group text-left"
                >
                  {user?.role === "nursery" ? (
                    <>
                      <Headphones className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      <span>Contact Admin Support</span>
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      <span>Account Settings</span>
                    </>
                  )}
                </button>
              </div>

              <div className="my-1.5 border-t border-slate-100 mx-2" />

              {/* Logout Action */}
              <div className="px-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50/80 rounded-xl transition-all border-none cursor-pointer group text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                  <span>Logout Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}