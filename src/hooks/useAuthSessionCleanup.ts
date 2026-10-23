"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/slices/authSlice";
import { purgeClientAuthData } from "@/config/api";

export interface SessionCleanupResult {
  isSessionExpired: boolean;
  isUnauthorized: boolean;
}

/**
 * Single-run cleanup hook for the Login / Register pages.
 * Detects '?expired=true' or '?error=unauthorized' query parameters,
 * wipes Redux and localStorage auth state idempotently, clears cookies,
 * displays a single toast alert, and scrubs the URL to prevent refresh loops.
 */
export function useAuthSessionCleanup(): SessionCleanupResult {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const hasExecutedRef = useRef(false);

  const isSessionExpired = searchParams?.get("expired") === "true";
  const errorParam = searchParams?.get("error");
  const isUnauthorized = errorParam === "unauthorized" || errorParam === "session_expired";

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasExecutedRef.current) return;
    if (!isSessionExpired && !isUnauthorized) return;

    hasExecutedRef.current = true;

    // 1. Wipe Redux store auth state
    dispatch(logout());

    // 2. Wipe client localStorage and cookies
    purgeClientAuthData();

    // 3. User feedback (using fixed toast ID to guarantee single delivery)
    if (isSessionExpired) {
      toast.error("Your session has expired. Please sign in again.", {
        id: "session-expired-alert",
      });
    } else if (isUnauthorized) {
      toast.error("You must be signed in to access that page.", {
        id: "session-unauthorized-alert",
      });
    }

    // 4. Clean query params from the browser address bar without re-triggering navigation or remounting
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("expired");
      url.searchParams.delete("error");
      const cleanUrl = url.pathname + (url.search ? url.search : "");
      window.history.replaceState(null, "", cleanUrl);
    }
  }, [isSessionExpired, isUnauthorized, dispatch]);

  return {
    isSessionExpired,
    isUnauthorized,
  };
}
