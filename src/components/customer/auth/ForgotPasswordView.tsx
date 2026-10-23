"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "@/services/authService";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/utils/validations";
import Spinner from "@/components/ui/Spinner";

interface ForgotPasswordProps {
  onBackToLogin: () => void;
  onTokenReceived: (token: string) => void;
}

export default function ForgotPasswordView({ onBackToLogin, onTokenReceived }: ForgotPasswordProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    const forgotPromise = authService.forgotPassword(data.email);

    toast.promise(forgotPromise, {
      loading: "Routing password reset token...",
      success: (response: any) => {
        const resData = response?.data || response;

        // Fallback checks for direct reset injection if available on dev environments
        if (resData && resData.resetToken) {
          setTimeout(() => {
            onTokenReceived(resData.resetToken);
          }, 1500);
        }
        return resData?.message || "Reset link dispatched to your email address.";
      },
      error: (err: any) => err?.message || (typeof err === "string" ? err : "Failed to issue password recovery packet."),
    });

    try {
      await forgotPromise;
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Recover Password</h2>
      <p className="text-sm text-muted-text mb-7 leading-relaxed">Enter your verified email. We will route a secure recovery instance token.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground/90 uppercase tracking-wider">Email Address</label>
          <div className="relative flex items-center">
            <Mail size={18} className="absolute left-4 text-muted-text/60" />
            <input
              type="email"
              disabled={isLoading}
              {...register("email")}
              placeholder="you@example.com"
              className={`w-full outline-hidden border rounded-xl py-3.5 pl-11 pr-4 text-sm bg-transparent transition-all duration-200 ${errors.email ? "border-red-500 focus:ring-red-500/10" : "border-line focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5"
                }`}
            />
          </div>
          {errors.email && <span className="text-xs font-semibold text-red-500 mt-0.5">{errors.email.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md disabled:opacity-75 cursor-pointer border-none"
        >
          {isLoading ? <Spinner size="sm" className="text-white" /> : "Send Recovery Link"}
        </button>

        <div className="text-center mt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onBackToLogin}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-text hover:text-foreground cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft size={16} />
            <span>Back to Log In</span>
          </button>
        </div>
      </form>
    </div>
  );
}