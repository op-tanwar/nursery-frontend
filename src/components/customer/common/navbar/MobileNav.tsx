"use client";

import Link from "next/link";
import { ChevronDown, LayoutDashboard, Store, UserCircle, Package, LogOut, User } from "lucide-react";
import { NAV_LINKS, MEGA_MENU_DATA } from "./DesktopNav";

interface MobileNavProps {
  readonly menuOpen: boolean;
  readonly setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readonly mobileShopOpen: boolean;
  readonly setMobileShopOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readonly mounted: boolean;
  readonly isAuthenticated: boolean;
  readonly user: any;
  readonly handleLogout: () => void;
}

export default function MobileNav({
  menuOpen,
  setMenuOpen,
  mobileShopOpen,
  setMobileShopOpen,
  mounted,
  isAuthenticated,
  user,
  handleLogout,
}: MobileNavProps) {
  return (
    <div
      className={`absolute top-[68px] left-0 right-0 w-full bg-white border-b border-slate-100 md:hidden transition-all duration-300 ease-in-out shadow-lg origin-top ${menuOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      style={{
        willChange: "transform, opacity",
        visibility: menuOpen ? "visible" : "hidden",
      }}
    >
      <div className="flex flex-col max-h-[calc(100vh-68px)] overflow-y-auto">
        {NAV_LINKS.map((link) => (
          <div key={link.label} className="w-full border-b border-slate-100">
            {link.hasDropdown ? (
              <>
                <button
                  type="button"
                  onClick={() => setMobileShopOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-5 py-4 text-[16px] font-medium text-slate-800 bg-transparent border-none cursor-pointer hover:bg-slate-50"
                >
                  <span>{link.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${mobileShopOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <div
                  className={`bg-slate-50/70 overflow-hidden transition-all duration-200 ${mobileShopOpen ? "max-h-[700px] border-t border-slate-100 p-4 flex flex-col gap-4" : "max-h-0"
                    }`}
                >
                  <Link
                    href="/shop"
                    onClick={() => setMenuOpen(false)}
                    className="text-[14.5px] font-bold text-green-600 no-underline px-2"
                  >
                    Browse All Shop
                  </Link>

                  {MEGA_MENU_DATA.map((col) => (
                    <div key={col.title} className="flex flex-col gap-1.5 px-2">
                      <span className="text-[12px] font-black uppercase tracking-wider text-slate-400">
                        {col.title}
                      </span>
                      {col.items.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setMenuOpen(false)}
                          className="block py-1.5 text-[14px] font-medium text-slate-600 no-underline hover:text-green-600"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-5 py-4 text-[16px] font-medium no-underline text-slate-800 hover:bg-slate-50 transition-colors"
              >
                {link.label}
              </Link>
            )}
          </div>
        ))}

        <div className="flex flex-col gap-2 my-4 px-5">
          {!mounted ? (
            <div className="w-full h-[44px] bg-slate-100 animate-pulse rounded-xl" />
          ) : isAuthenticated ? (
            <div className="flex flex-col gap-0.5">
              <div className="px-4 pt-1 pb-3 border-b border-slate-100 mb-1">
                <p className="text-[15px] font-bold text-slate-800 m-0 truncate">{user?.name || "Urban Nursery User"}</p>
                <p className="text-[12px] text-slate-500 m-0 mt-[2px] truncate">{user?.email || ""}</p>
              </div>

              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold text-slate-700 hover:bg-slate-50 no-underline"
                >
                  <LayoutDashboard className="w-5 h-5 text-slate-400" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              {user?.role === "nursery" && (
                <Link
                  href="/nursery"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold text-slate-700 hover:bg-slate-50 no-underline"
                >
                  <Store className="w-5 h-5 text-slate-400" />
                  <span>My Nursery</span>
                </Link>
              )}

              <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-slate-700 hover:bg-slate-50 no-underline">
                <UserCircle className="w-5 h-5 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link href="/orders/me" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-slate-700 hover:bg-slate-50 no-underline">
                <Package className="w-5 h-5 text-slate-400" />
                <span>My Orders</span>
              </Link>

              <button type="button" onClick={handleLogout} className="w-full mt-2 py-3 rounded-xl text-[15px] font-semibold text-red-500 bg-red-50 hover:bg-red-100/70 transition-colors border-none flex items-center justify-center gap-2 cursor-pointer">
                <LogOut className="w-[18px] h-[18px]" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full py-3 rounded-xl text-[15px] font-semibold text-white cursor-pointer bg-green-600 hover:bg-green-700 transition-colors border-none flex items-center justify-center gap-2 no-underline"
            >
              <User className="w-[18px] h-[18px]" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}