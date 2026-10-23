"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Menu, X, Heart, MapPin } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout, hydrateAuth } from "@/redux/slices/authSlice";
import { setCartData, setCartError, setCartLoading, loadGuestCart } from "@/redux/slices/cartSlice";
import { setWishlistData, setWishlistError, setWishlistLoading } from "@/redux/slices/wishlistSlice";
import { wishlistService, cartService } from "@/services/cartWishlistService";
import toast from "react-hot-toast";

import PincodeModal from "@/components/customer/common/PincodeModal";
import DesktopNav from "./DesktopNav";
import UserDropdown from "./UserDropdown";
import MobileNav from "./MobileNav";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentPincode, setCurrentPincode] = useState<string | null>(null);
  const [showPincodeModal, setShowPincodeModal] = useState(false);

  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const authState = useAppSelector((state) => state.auth || { user: null, isAuthenticated: false });
  const { user, isAuthenticated } = authState;

  const wishlistState = useAppSelector((state) => state.wishlist || { wishlist: null });
  const cartState = useAppSelector((state) => state.cart || { cart: null });

  const wishlistCount = wishlistState.wishlist?.items?.length || 0;
  const cartCount = cartState.cart?.items?.length || 0;

  const isAuthRoute = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (!isAuthRoute) {
      dispatch(hydrateAuth());
    }
    setMounted(true);
    const savedPincode = localStorage.getItem("hyperlocal_pincode");
    if (savedPincode) {
      setCurrentPincode(savedPincode);
    }
  }, [dispatch, isAuthRoute]);

  useEffect(() => {
    if (!mounted || isAuthRoute) return;

    if (!isAuthenticated) {
      // 🛒 Guest Cart Mode: Load localStorage cart items into Redux state
      dispatch(loadGuestCart());
      return;
    }

    const fetchNavbarData = async () => {
      dispatch(setCartLoading(true));
      dispatch(setWishlistLoading(true));

      // ⚡ PERF: Parallelize cart and wishlist fetching to halve initial network latency
      const [cartResult, wishlistResult] = await Promise.allSettled([
        cartService.getMyCart(),
        wishlistService.getMyWishlist(),
      ]);

      if (cartResult.status === "fulfilled" && cartResult.value?.success && cartResult.value.cart) {
        dispatch(setCartData(cartResult.value.cart));
      } else if (cartResult.status === "rejected") {
        dispatch(setCartError((cartResult.reason as any)?.message || "Failed to load cart items"));
      }

      if (wishlistResult.status === "fulfilled" && wishlistResult.value?.success && wishlistResult.value.wishlist) {
        dispatch(setWishlistData(wishlistResult.value.wishlist));
      } else if (wishlistResult.status === "rejected") {
        dispatch(setWishlistError((wishlistResult.reason as any)?.message || "Failed to load wishlist items"));
      }
    };

    fetchNavbarData();
  }, [mounted, isAuthenticated, isAuthRoute, dispatch]);

  // Synchronize guest cart updates across browser tabs or decoupled components
  useEffect(() => {
    if (!mounted) return;
    const handleCartSync = () => {
      if (!isAuthenticated) {
        dispatch(loadGuestCart());
      }
    };
    window.addEventListener("planto_cart_updated", handleCartSync);
    window.addEventListener("storage", handleCartSync);
    return () => {
      window.removeEventListener("planto_cart_updated", handleCartSync);
      window.removeEventListener("storage", handleCartSync);
    };
  }, [mounted, isAuthenticated, dispatch]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMenuOpen(false);
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    dispatch(logout());
    toast.success("Logged out successfully.");
    window.location.href = "/login";
  };

  const textClass = "text-slate-700 hover:text-green-600 transition-colors duration-200";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-4 sm:px-6 ${scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-xs"
          : "bg-transparent border-b border-transparent"
          }`}
      >
        <div className="max-w-[1280px] mx-auto h-[68px] flex items-center justify-between relative z-50">
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <Link href="/">
              <Image
                src="/images/logo-new.png"
                alt="Urban Nursery Logo"
                width={110}
                height={36}
                priority
                className="object-contain w-auto h-auto transition-all duration-300 opacity-100 mix-blend-multiply drop-shadow-md"
              />
            </Link>
          </div>

          <DesktopNav textClass={textClass} />

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setShowPincodeModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200/80 text-emerald-800 hover:bg-emerald-100/70 transition-all cursor-pointer"
              title="Change Delivery Location"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div className="flex justify-center items-center gap-1 text-left">
                <span className="text-[12px] text-emerald-600 leading-none font-medium hidden md:flex">Deliver</span>
                <span className="text-[12px] font-bold leading-tight truncate">
                  {currentPincode ? currentPincode : "Select Pincode"}
                </span>
              </div>
            </button>

            <Link
              href="/wishlist"
              className={`cursor-pointer p-1.5 border-none bg-transparent rounded-full hover:bg-slate-100 relative flex items-center justify-center ${textClass}`}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className={`cursor-pointer p-1.5 relative border-none bg-transparent rounded-full hover:bg-slate-100 flex items-center justify-center ${textClass}`}
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="hidden md:flex md:items-center">
              {!mounted ? (
                <div className="w-[84px] h-[36px] bg-slate-100 animate-pulse rounded-xl" />
              ) : isAuthenticated ? (
                <UserDropdown
                  user={user}
                  userMenuOpen={userMenuOpen}
                  setUserMenuOpen={setUserMenuOpen}
                  handleLogout={handleLogout}
                  textClass={textClass}
                />
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-semibold text-white cursor-pointer transition-colors duration-200 hover:bg-green-700 bg-green-600 border-none no-underline"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-transparent text-slate-800 cursor-pointer transition-all duration-200 active:scale-95"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <MobileNav
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          mobileShopOpen={mobileShopOpen}
          setMobileShopOpen={setMobileShopOpen}
          mounted={mounted}
          isAuthenticated={isAuthenticated}
          user={user}
          handleLogout={handleLogout}
        />
      </nav>

      <PincodeModal
        showPincodeModal={showPincodeModal}
        setShowPincodeModal={setShowPincodeModal}
      />
    </>
  );
}