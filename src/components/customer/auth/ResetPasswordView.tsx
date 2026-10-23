"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "@/services/authService";
import { resetPasswordSchema, ResetPasswordInput } from "@/utils/validations";
import Spinner from "@/components/ui/Spinner";

interface ResetPasswordProps {
  token: string;
  onSuccessRedirect: () => void;
}

export default function ResetPasswordView({ token, onSuccessRedirect }: ResetPasswordProps) {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    const resetPromise = authService.resetPassword(token, data.password, data.confirmPassword);

    toast.promise(resetPromise, {
      loading: "Patching new secure credentials...",
      success: () => {
        setTimeout(() => {
          onSuccessRedirect();
        }, 1500);
        return "Password changed successfully! Opening authentication portal...";
      },
      error: (err: any) => err?.message || (typeof err === "string" ? err : "Failed to commit password patch updates."),
    });

    try {
      await resetPromise;
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Reset Password</h2>
      <p className="text-sm text-muted-text mb-7">Configure your new robust security credentials.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground/90 uppercase tracking-wider">New Password</label>
          <div className="relative flex items-center">
            <Lock size={18} className="absolute left-4 text-muted-text/60" />
            <input
              type={showPass ? "text" : "password"}
              disabled={isLoading}
              {...register("password")}
              placeholder="••••••••"
              className={`w-full outline-hidden border rounded-xl py-3.5 pl-11 pr-12 text-sm bg-transparent transition-all duration-200 ${errors.password ? "border-red-500 focus:ring-red-500/10" : "border-line focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 border-none bg-transparent text-muted-text/60 hover:text-foreground cursor-pointer flex items-center p-0"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="text-xs font-semibold text-red-500 mt-0.5">{errors.password.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-foreground/90 uppercase tracking-wider">Confirm New Password</label>
          <div className="relative flex items-center">
            <Lock size={18} className="absolute left-4 text-muted-text/60" />
            <input
              type={showConfirmPass ? "text" : "password"}
              disabled={isLoading}
              {...register("confirmPassword")}
              placeholder="••••••••"
              className={`w-full outline-hidden border rounded-xl py-3.5 pl-11 pr-12 text-sm bg-transparent transition-all duration-200 ${errors.confirmPassword ? "border-red-500 focus:ring-red-500/10" : "border-line focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/5"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute right-4 border-none bg-transparent text-muted-text/60 hover:text-foreground cursor-pointer flex items-center p-0"
            >
              {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <span className="text-xs font-semibold text-red-500 mt-0.5">{errors.confirmPassword.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md disabled:opacity-75 cursor-pointer border-none"
        >
          {isLoading ? <Spinner size="sm" className="text-white" /> : "Update Password"}
        </button>
      </form>
    </div>
  );
}