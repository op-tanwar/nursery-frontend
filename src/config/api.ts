import axios from "axios";
import { clearClientAuthCookies, getClientCookie } from "@/utils/cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nursery-backend-2rg3.onrender.com/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

/**
 * Safely flushes all legacy persisted authentication state from client storage.
 */
export function purgeClientAuthData(): void {
  if (typeof window === "undefined") return;

  try {
    const keys = [
      "token",
      "authToken",
      "urban_nursery_token",
      "urban_nursery_role",
      "urban_nursery_user",
      "planto_token",
      "planto_role",
      "planto_user",
    ];
    for (const key of keys) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
    clearClientAuthCookies();
  } catch (err) {
    console.warn("Failed to clear client storage keys:", err);
  }
}

/* ─────────────────────────────────────────────────────────
    🚀 REQUEST INTERCEPTOR (Dual Cookie & Authorization Header Defense)
───────────────────────────────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    // Provide Authorization Bearer header fallback for cross-origin reliability
    if (typeof document !== "undefined") {
      const token = getClientCookie("token") || getClientCookie("planto_token");
      if (token && !config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
      }
      // Disable timeout for multi-file/document uploads (Cloudinary processing)
      config.timeout = 0;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─────────────────────────────────────────────────────────
    🛡️ RESPONSE INTERCEPTOR (Prevent Infinite Loops & Poisoning)
───────────────────────────────────────────────────────── */
// Concurrency lock to prevent multiple rapid 401 responses from firing repeated redirects
let isRedirectingToLogin = false;

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, config } = error.response;

      // Identify backend authentication calls (login, register, forgot/reset password, social login)
      // On these endpoints, a 401 simply indicates invalid credentials (bad password), not an expired session.
      const isAuthApiEndpoint = Boolean(
        config?.url?.includes("/users/login") ||
        config?.url?.includes("/users/register") ||
        config?.url?.includes("/users/social-login") ||
        config?.url?.includes("/auth/") ||
        config?.url?.includes("/users/password/")
      );

      switch (status) {
        case 401: {
          if (typeof window !== "undefined" && !isAuthApiEndpoint) {
            console.warn("Unauthorized (401) encountered. Purging client auth state...");
            purgeClientAuthData();

            const currentPath = window.location.pathname;
            const isAuthPage = currentPath.startsWith("/login") || currentPath.startsWith("/register");

            // 🛑 CRITICAL LOOP PREVENTION:
            // If the user is ALREADY on /login or /register, NEVER trigger a redirect, router push, or page reload!
            if (!isAuthPage) {
              if (!isRedirectingToLogin) {
                isRedirectingToLogin = true;
                // Use window.location.replace to prevent back-button loops in browser history
                window.location.replace("/login?expired=true");
              }
            }
          }
          break;
        }

        case 403:
          console.error("Access Denied (403). Forbidden resource.");
          break;
      }
    }

    return Promise.reject(error.response?.data || error.message || "Network Error");
  }
);