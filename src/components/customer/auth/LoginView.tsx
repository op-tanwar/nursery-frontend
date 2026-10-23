"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setAuthLoading, setCredentials } from "@/redux/slices/authSlice";
import { authService } from "@/services/authService";
import { loginSchema, LoginInput } from "@/utils/validations";
import { syncCartOnAuthSuccess, getPostAuthRedirectUrl } from "@/utils/guestCart";
import Spinner from "@/components/ui/Spinner";
import SocialLoginButtons from "./SocialLoginButtons";

interface LoginViewProps {
  onForgotPassword: () => void;
  isSessionExpired?: boolean;
}

export default function LoginView({ onForgotPassword, isSessionExpired = false }: LoginViewProps) {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    dispatch(setAuthLoading(true));

    const loginPromise = authService.loginUser(data);

    toast.promise(loginPromise, {
      loading: "Verifying credentials...",
      success: (response: any) => {
        // Backend se dynamic token payload ko verify karna
        const resData = response?.data || response;

        if (resData?.user && resData?.token) {
          const userRole = resData.user.role;
          const token = resData.token;

          // 1. Central Redux state update (Empty string ki jagah actual token)
          dispatch(setCredentials({ user: resData.user, token: token }));

          // 2. Storage Sync
          localStorage.setItem("urban_nursery_role", userRole);
          localStorage.setItem("urban_nursery_token", token);
          localStorage.setItem("urban_nursery_user", JSON.stringify(resData.user));
          localStorage.setItem("planto_role", userRole);
          localStorage.setItem("planto_token", token);
          localStorage.setItem("planto_user", JSON.stringify(resData.user));

          // 3. Cookie setup jo Next.js Middleware ko redirect loop se bachayega
          const isProd = process.env.NODE_ENV === "production";
          document.cookie = `role=${userRole}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax;${isProd ? " Secure;" : ""}`;
          document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax;${isProd ? " Secure;" : ""}`;

          // 4. Automatic Post-Login Cart Sync & Preserved Redirection
          const targetUrl = getPostAuthRedirectUrl(userRole);
          syncCartOnAuthSuccess(dispatch).finally(() => {
            setTimeout(() => {
              window.location.href = targetUrl;
            }, 500);
          });

          return `Welcome back, ${resData.user.name}!`;
        }
        throw new Error("Invalid response from server.");
      },

      error: (err: any) => err?.response?.data?.message || err?.message || "Invalid email or password.",
    });

    try {
      await loginPromise;
    } catch (error) {
      console.error("Login execution sequence failure:", error);
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Welcome Back</h2>
      <p className="text-sm text-gray-500 mb-7">Grow your digital shelf with premium greens.</p>

      {isSessionExpired && (
        <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2">
          <span>⚠️ Your session has expired. Please sign in to continue.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
          <div className="relative flex items-center">
            <Mail size={18} className="absolute left-4 text-gray-400" />
            <input
              type="email"
              disabled={isLoading}
              {...register("email")}
              placeholder="you@example.com"
              className={`w-full outline-hidden border rounded-xl py-3.5 pl-11 pr-4 text-sm bg-transparent transition-all duration-200 ${errors.email
                ? "border-red-500 focus:ring-red-500/10"
                : "border-gray-200 focus:border-green-600/40 focus:ring-4 focus:ring-green-600/5"
                }`}
            />
          </div>
          {errors.email && <span className="text-xs font-semibold text-red-500 mt-0.5">{errors.email.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
            <button
              type="button"
              disabled={isLoading}
              onClick={onForgotPassword}
              className="text-xs font-bold text-green-600 hover:text-green-700 cursor-pointer bg-transparent border-none p-0 transitions-colors duration-200"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative flex items-center">
            <Lock size={18} className="absolute left-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              disabled={isLoading}
              {...register("password")}
              placeholder="••••••••"
              className={`w-full outline-hidden border rounded-xl py-3.5 pl-11 pr-12 text-sm bg-transparent transition-all duration-200 ${errors.password
                ? "border-red-500 focus:ring-red-500/10"
                : "border-gray-200 focus:border-green-600/40 focus:ring-4 focus:ring-green-600/5"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 border-none bg-transparent text-gray-400 hover:text-gray-900 cursor-pointer flex items-center p-0"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="text-xs font-semibold text-red-500 mt-0.5">{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-green-600/10 disabled:opacity-75 cursor-pointer border-none"
        >
          {isLoading ? (
            <Spinner size="sm" className="text-white brightness-200" />
          ) : (
            <>
              <span className="select-none">Sign In</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-5">
        <SocialLoginButtons role="customer" mode="login" />
      </div>
    </div>
  );
}