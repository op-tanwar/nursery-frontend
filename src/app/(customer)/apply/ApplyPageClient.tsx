"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Store,
  Loader2,
  Sprout,
  Mail,
  Phone,
  ArrowRight,
  MapPin,
  Home,
  Clock,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Users,
  Wallet,
  PackageCheck,
  BarChart3
} from "lucide-react";
import { z } from "zod";

import { nurseryApplySchema } from "@/validations/nursery.schema";
import { nurseryProfileService } from "@/services/nurseryProfileService";
import {
  setNurseryLoading,
  setNurseryError,
  applyNurserySuccess,
  clearNurseryMutationFlags
} from "@/redux/slices/nurseryProfileSlice";

type FormInputType = z.input<typeof nurseryApplySchema>;

export default function NurseryApplyPage() {
  const dispatch = useDispatch();
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);

  const { isLoading, mutationSuccess, error, actionMessage } = useSelector(
    (state: any) => state.nurseryProfile
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormInputType>({
    resolver: zodResolver(nurseryApplySchema),
    defaultValues: {
      businessName: "",
      businessEmail: "",
      businessPhone: "",
      city: "",
      address: "",
      pinCode: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (mutationSuccess) {
      toast.success(actionMessage || "Application submitted successfully!");
      setIsAlreadyApplied(true);
      dispatch(clearNurseryMutationFlags());
      reset();
    }

    if (error) {
      if (error.includes("already submitted") || error.includes("Pending")) {
        setIsAlreadyApplied(true);
      }
      dispatch(clearNurseryMutationFlags());
    }
  }, [mutationSuccess, error, actionMessage, dispatch, reset]);

  const onSubmit: SubmitHandler<FormInputType> = async (data) => {
    try {
      dispatch(setNurseryLoading(true));

      const payload = {
        businessName: data.businessName,
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        businessAddress: {
          city: data.city.trim(),
          address: data.address.trim(),
          state: "",
          pinCode: data.pinCode.trim(),
          country: "India",
        },
      };

      const response = await nurseryProfileService.requestNurseryOnboarding(payload);

      if (response.success) {
        dispatch(applyNurserySuccess({ profile: response.profile, message: response.message || "" }));
      }
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Something went wrong";

      dispatch(setNurseryError(serverMessage));
      toast.error(serverMessage);

      if (serverMessage.toLowerCase().includes("already submitted") || serverMessage.toLowerCase().includes("pending")) {
        setIsAlreadyApplied(true);
      }
    }
  };

  return (
    <main
      className="relative min-h-screen items-center overflow-hidden py-20 pt-28 flex justify-center"
      style={{
        background:
          "linear-gradient(160deg, #f0fdf4 0%, #dcfce7 35%, #fcfdfc 70%)",
      }}
    >
      {/* ── Concentric Geometry Rings ── */}
      {[400, 600, 800].map((size) => (
        <div
          key={size}
          style={{
            position: "absolute",
            top: "50%",
            right: "-10%",
            width: size,
            height: size,
            borderRadius: "50%",
            border: "1px solid rgba(21, 128, 61, 0.08)",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* ── Micro Dot Grid Overlay ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "radial-gradient(rgba(21, 128, 61, 0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      {/* ── Ambient Glow Blobs ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[5%] left-[-8%] w-[400px] h-[400px] rounded-full bg-emerald-800/5 blur-3xl"
      />

      {/* ── Main Container ── */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* LEFT LIGHT INFORMATION PANEL */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="rounded-3xl bg-white/70 backdrop-blur-md text-slate-800 p-8 lg:p-10 relative overflow-hidden shadow-xl shadow-emerald-900/5 h-full flex flex-col justify-between border border-emerald-200/60">
              {/* Card Ambient Lighting */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-500/15 px-3.5 py-1.5 rounded-full border border-emerald-600/20 shadow-2xs">
                  <Sprout className="w-3.5 h-3.5 text-emerald-700" /> Partner Network
                </span>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-slate-900">
                    Sell Your Plants Across India
                  </h1>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    Convert your local nursery into a digital storefront. Connect directly with thousands of plant lovers and scale your business nationwide.
                  </p>
                </div>

                {/* Value Props */}
                <div className="space-y-3.5 pt-4 border-t border-emerald-900/10">
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span>Zero listing fee for verified local nurseries</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <span>Direct access to active plant enthusiasts</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shrink-0">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <span>Fast & transparent weekly payouts</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shrink-0">
                      <PackageCheck className="w-4 h-4" />
                    </div>
                    <span>Hassle-free eco-packaging & pickup support</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shrink-0">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <span>Dedicated seller dashboard for inventory & orders</span>
                  </div>
                </div>
              </div>

              {/* Verification Steps Indicator */}
              <div className="relative z-10 border-t border-emerald-900/10 pt-6 mt-8 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" /> Phase 1: Basic Profile & Location
                </div>
                <p className="text-[11px] text-slate-500 m-0 pl-6 leading-relaxed font-medium">
                  Phase 2: Automated Serviceable Pincodes & Bank Verification (Post-Approval)
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT LIGHT CORE FORM PANEL */}
          <div className="lg:col-span-7 bg-white/80 backdrop-blur-md rounded-3xl border border-emerald-200/60 shadow-xl shadow-emerald-900/5 p-6 sm:p-8 md:p-10 flex flex-col justify-center relative overflow-hidden">

            {isAlreadyApplied ? (
              /* UNDER REVIEW CARD */
              <div className="text-center py-10 px-4 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 text-amber-600 animate-pulse shadow-lg shadow-amber-500/10">
                  <Clock className="w-10 h-10" />
                </div>

                <div className="space-y-2 max-w-md">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Application Under Review</h2>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Your partner application has been recorded. Security and business parameter checks are currently underway.
                  </p>
                </div>

                <div className="w-full max-w-md bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex gap-3.5 text-left items-start shadow-2xs">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-900 m-0">Status: Pending Verification</p>
                    <p className="text-[11px] text-amber-800 m-0 leading-relaxed font-medium">
                      You will receive an email notification once your application is approved, after which your Seller Dashboard access will be activated. No need to resubmit a new request.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* APPLICATION FORM */
              <>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
                    <Store className="w-4 h-4" /> Nursery Seller Onboarding
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight m-0">Register Your Nursery</h2>
                  <p className="text-xs text-slate-600 m-0 mt-1 font-medium">Fill in your foundational business details to request a seller account.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Business Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Business Name <span className="text-emerald-600">*</span>
                    </label>
                    <div className="relative group">
                      <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        {...register("businessName")}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm transition-all placeholder:text-slate-400 font-medium"
                        placeholder="e.g. Greenwood Plants & Nursery"
                      />
                    </div>
                    {errors.businessName && <p className="text-xs font-semibold text-rose-500 m-0 mt-0.5">{errors.businessName.message}</p>}
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Business Email <span className="text-emerald-600">*</span>
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                          {...register("businessEmail")}
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm transition-all placeholder:text-slate-400 font-medium"
                          placeholder="contact@nursery.com"
                        />
                      </div>
                      {errors.businessEmail && <p className="text-xs font-semibold text-rose-500 m-0 mt-0.5">{errors.businessEmail.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Business Phone <span className="text-emerald-600">*</span>
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                          {...register("businessPhone")}
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm transition-all placeholder:text-slate-400 font-medium"
                          placeholder="9876543210"
                        />
                      </div>
                      {errors.businessPhone && <p className="text-xs font-semibold text-rose-500 m-0 mt-0.5">{errors.businessPhone.message}</p>}
                    </div>
                  </div>

                  {/* City & Pincode Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        City <span className="text-emerald-600">*</span>
                      </label>
                      <div className="relative group">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                          {...register("city")}
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm transition-all placeholder:text-slate-400 font-medium"
                          placeholder="e.g. Saharanpur, Pune"
                        />
                      </div>
                      {errors.city && <p className="text-xs font-semibold text-rose-500 m-0 mt-0.5">{errors.city.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        PIN Code <span className="text-emerald-600">*</span>
                      </label>
                      <div className="relative group">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                          {...register("pinCode")}
                          inputMode="numeric"
                          maxLength={6}
                          autoComplete="postal-code"
                          onInput={(e) => {
                            const target = e.currentTarget;
                            target.value = target.value.replace(/\D/g, "").slice(0, 6);
                          }}
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200/90 bg-white/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-mono tracking-wider transition-all placeholder:text-slate-400 font-medium"
                          placeholder="e.g. 474001"
                        />
                      </div>
                      {errors.pinCode && <p className="text-xs font-semibold text-rose-500 m-0 mt-0.5">{errors.pinCode.message}</p>}
                    </div>
                  </div>

                  {/* Full Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Full Address <span className="text-emerald-600">*</span>
                    </label>
                    <div className="relative group">
                      <Home className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                      <textarea
                        {...register("address")}
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/90 bg-white/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm transition-all placeholder:text-slate-400 resize-none font-medium"
                        placeholder="Enter complete physical address of your nursery..."
                      />
                    </div>
                    {errors.address && <p className="text-xs font-semibold text-rose-500 m-0 mt-0.5">{errors.address.message}</p>}
                  </div>

                  {/* Submit Action Bar */}
                  <div className="pt-4 border-t border-emerald-900/10 mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed h-11 px-8 rounded-xl shadow-md shadow-emerald-700/20 transition-all active:scale-95 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...
                        </>
                      ) : (
                        <>
                          Submit Application <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}