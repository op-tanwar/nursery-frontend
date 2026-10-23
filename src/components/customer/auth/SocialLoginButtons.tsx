"use client";

import { useState } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/slices/authSlice";
import { authService } from "@/services/authService";
import { syncCartOnAuthSuccess, getPostAuthRedirectUrl } from "@/utils/guestCart";
import Spinner from "@/components/ui/Spinner";

interface SocialLoginButtonsProps {
  role?: "customer" | "nursery" | "admin";
  mode?: "login" | "signup";
}

/**
 * Inner Google Button component utilizing useGoogleLogin hook
 */
function GoogleButtonTrigger({
  onSuccess,
  onError,
  isLoading,
  disabled,
}: {
  onSuccess: (token: string) => void;
  onError: (error: any) => void;
  isLoading: boolean;
  disabled: boolean;
}) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse?.access_token) {
        onSuccess(tokenResponse.access_token);
      } else {
        onError(new Error("No access token returned by Google"));
      }
    },
    onError: (errorResponse) => {
      // User cancelled or popup closed
      const err = errorResponse?.error as string | undefined;
      if (err === "popup_closed_by_user" || err === "access_denied") {
        toast("Google sign-in was closed or cancelled.", { icon: "ℹ️" });
      } else {
        onError(new Error(errorResponse?.error_description || "Google sign-in failed"));
      }
    },
    flow: "implicit",
  });

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={() => login()}
      className="w-full relative flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/80 text-gray-700 text-sm font-semibold rounded-xl transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none group"
    >
      {isLoading ? (
        <Spinner size="sm" className="text-gray-500" />
      ) : (
        <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span>Continue with Google</span>
    </button>
  );
}

/**
 * Fallback button when Google Client ID is unconfigured
 */
function GoogleButtonFallback({ disabled }: { disabled: boolean }) {
  const handleClick = () => {
    toast.error(
      "Google Client ID is missing. Please configure NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.",
      { duration: 5000 }
    );
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className="w-full relative flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/80 text-gray-700 text-sm font-semibold rounded-xl transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
    >
      <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
}

export default function SocialLoginButtons({
  role = "customer",
  mode = "login",
}: SocialLoginButtonsProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const googleClientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();

  /**
   * Finalize login session state & role-based redirection
   */
  const handleAuthSuccess = (resData: any) => {
    if (!resData?.user || !resData?.token) {
      throw new Error("Invalid response received from server");
    }

    const { user, token } = resData;
    const userRole = user.role || "user";

    // 1. Redux State Store
    dispatch(setCredentials({ user, token }));

    // 2. LocalStorage Sync
    localStorage.setItem("urban_nursery_role", userRole);
    localStorage.setItem("urban_nursery_token", token);
    localStorage.setItem("urban_nursery_user", JSON.stringify(user));
    localStorage.setItem("planto_role", userRole);
    localStorage.setItem("planto_token", token);
    localStorage.setItem("planto_user", JSON.stringify(user));

    // 3. Local cookie binding for Next.js Middleware & SSR
    const isProd = process.env.NODE_ENV === "production";
    document.cookie = `role=${userRole}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax;${isProd ? " Secure;" : ""}`;
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax;${isProd ? " Secure;" : ""}`;

    toast.success(`Welcome, ${user.name || "friend"}!`, { id: "social-auth-toast" });

    // 4. Automatic Post-Login Cart Sync & Preserved Redirection
    const targetUrl = getPostAuthRedirectUrl(userRole);
    syncCartOnAuthSuccess(dispatch).finally(() => {
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 500);
    });
  };

  /**
   * Send Google OAuth token to backend social-login endpoint
   */
  const processGoogleAuth = async (token: string) => {
    setIsLoading(true);
    const toastId = toast.loading("Verifying Google credentials...");

    try {
      // Backend expects role 'user' | 'nursery' | 'admin'
      const backendRole = role === "customer" ? "user" : role;
      const response: any = await authService.socialLogin({
        provider: "google",
        token,
        role: backendRole,
      });

      const resData = response?.data || response;
      toast.dismiss(toastId);
      handleAuthSuccess(resData);
    } catch (error: any) {
      toast.dismiss(toastId);
      console.error("Google social login failed:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Google authentication failed. Please try again.";
      toast.error(message, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Separator */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-400 font-semibold tracking-wider">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google OAuth Button Container */}
      <div className="w-full">
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <GoogleButtonTrigger
              onSuccess={processGoogleAuth}
              onError={(err) => {
                setIsLoading(false);
                toast.error(err?.message || "Google sign-in encountered an error.");
              }}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </GoogleOAuthProvider>
        ) : (
          <GoogleButtonFallback disabled={isLoading} />
        )}
      </div>
    </div>
  );
}
