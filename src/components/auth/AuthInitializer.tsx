"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials, logout } from "@/redux/slices/authSlice";
import { authService } from "@/services/authService";

/**
 * 🔒 Pure HTTP-Only Auth Initializer & Client Migration
 *
 * 1. Purges legacy tokens and session credentials from localStorage/sessionStorage.
 * 2. Authenticates current session via GET /auth/me against server httpOnly cookies.
 * 3. Enforces zero client-accessible token storage across the entire application lifecycle.
 */
export default function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // 🛡️ Migration: Purge legacy token keys from client storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("urban_nursery_token");
      localStorage.removeItem("planto_token");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("authToken");
    }

    // Validate active session against server-managed httpOnly cookie
    authService
      .getMe()
      .then((res: any) => {
        const user = res?.user || res?.data?.user;
        if (user) {
          dispatch(setCredentials({ user }));
        }
      })
      .catch(() => {
        // Unauthenticated or expired session
        dispatch(logout());
      });
  }, [dispatch]);

  return null;
}
