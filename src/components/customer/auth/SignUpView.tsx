"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setAuthLoading, setCredentials } from "@/redux/slices/authSlice";
import { authService } from "@/services/authService";
import { registerSchema, RegisterInput } from "@/utils/validations";
import { syncCartOnAuthSuccess, getPostAuthRedirectUrl } from "@/utils/guestCart";
import Spinner from "@/components/ui/Spinner";
import SocialLoginButtons from "./SocialLoginButtons";

export default function SignUpView() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    dispatch(setAuthLoading(true));
    const registerPromise = authService.registerUser(data);

    toast.promise(registerPromise, {
      loading: "Creating account node...",
      success: (response: any) => {
        const resData = response?.data || response;

        if (resData?.user && resData?.token) {
          const userRole = resData.user.role;
          const token = resData.token;

          // 1. State Store Sync
          dispatch(setCredentials({ user: resData.user, token: token }));

          // 2. Storage parameters creation
          localStorage.setItem("urban_nursery_role", userRole);
          localStorage.setItem("urban_nursery_token", token);
          localStorage.setItem("urban_nursery_user", JSON.stringify(resData.user));
          localStorage.setItem("planto_role", userRole);
          localStorage.setItem("planto_token", token);
          localStorage.setItem("planto_user", JSON.stringify(resData.user));

          // 3. Local cookie binding
          const isProd = process.env.NODE_ENV === "production";
          document.cookie = `role=${userRole}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax;${isProd ? " Secure;" : ""}`;
          document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax;${isProd ? " Secure;" : ""}`;

          // 4. Automatic Post-Registration Cart Sync & Preserved Redirection
          const targetUrl = getPostAuthRedirectUrl(userRole);
          syncCartOnAuthSuccess(dispatch).finally(() => {
            setTimeout(() => {
              window.location.href = targetUrl;
            }, 500);
          });

          return "Registration complete! Welcome to Urban Nursery.";
        }

        return "Registration successful! Please log in.";
      },
      error: (err: any) => err?.response?.data?.message || err?.message || "Registration failed.",
    });

    try {
      await registerPromise;
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Create Account</h2>
      <p className="text-sm text-muted-text mb-7">Join India's certified plant marketplace family.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground/90 uppercase tracking-wider">Full Name</label>
          <div className="relative flex items-center">
            <User size={18} className="absolute left-4 text-muted-text/60" />
            <input
              type="text"
              disabled={isLoading}
              {...register("name")}
              placeholder="Aryan Sharma"
              className={`w-full outline-hidden border rounded-xl py-3.5 pl-11 pr-4 text-sm bg-transparent transition-all duration-200 ${errors.name
                ? "border-red-500 focus:ring-red-500/10"
                : "border-line focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5"
                }`}
            />
          </div>
          {errors.name && <span className="text-xs font-semibold text-red-500 mt-0.5">{errors.name.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground/90 uppercase tracking-wider">Email Address</label>
          <div className="relative flex items-center">
            <Mail size={18} className="absolute left-4 text-muted-text/60" />
            <input
              type="email"
              disabled={isLoading}
              {...register("email")}
              placeholder="you@example.com"
              className={`w-full outline-hidden border rounded-xl py-3.5 pl-11 pr-4 text-sm bg-transparent transition-all duration-200 ${errors.email
                ? "border-red-500 focus:ring-red-500/10"
                : "border-line focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5"
                }`}
            />
          </div>
          {errors.email && <span className="text-xs font-semibold text-red-500 mt-0.5">{errors.email.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground/90 uppercase tracking-wider">Password</label>
          <div className="relative flex items-center">
            <Lock size={18} className="absolute left-4 text-muted-text/60" />
            <input
              type={showPassword ? "text" : "password"}
              disabled={isLoading}
              {...register("password")}
              placeholder="••••••••"
              className={`w-full outline-hidden border rounded-xl py-3.5 pl-11 pr-12 text-sm bg-transparent transition-all duration-200 ${errors.password
                ? "border-red-500 focus:ring-red-500/10"
                : "border-line focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 border-none bg-transparent text-muted-text/60 hover:text-foreground cursor-pointer flex items-center p-0"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="text-xs font-semibold text-red-500 mt-0.5">{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md disabled:opacity-75 cursor-pointer border-none"
        >
          {isLoading ? (
            <Spinner size="sm" className="text-white brightness-200" />
          ) : (
            <>
              <span className="select-none">Register</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-5">
        <SocialLoginButtons role="customer" mode="signup" />
      </div>
    </div>
  );
}