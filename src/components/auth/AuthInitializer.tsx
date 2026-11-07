"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials, logout } from "@/redux/slices/authSlice";
import { authService } from "@/services/authService";
import { getClientCookie, setAuthCookies } from "@/utils/cookie";

/**
 * 🔒 Pure Auth Initializer & Session Synchronizer
 *
 * 1. Authenticates current session via GET /auth/me against server session & cookies.
 * 2. Synchronizes Redux auth state with active session credentials.
 */
export default function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Validate active session against server
    authService
      .getMe()
      .then((res: any) => {
        const user = res?.user || res?.data?.user;
        const token = res?.token || res?.data?.token || getClientCookie("token");

        if (user) {
          if (token) {
            setAuthCookies(token, user.role);
          }
          dispatch(setCredentials({ user, token: token || undefined }));
        }
      })
      .catch(() => {
        // Unauthenticated or expired session
        dispatch(logout());
      });
  }, [dispatch]);

  return null;
}
