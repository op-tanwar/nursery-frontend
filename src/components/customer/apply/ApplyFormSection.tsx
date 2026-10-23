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
  CheckCircle2,
  Lock,
} from "lucide-react";
import { z } from "zod";

import { nurseryApplySchema } from "@/validations/nursery.schema";
import { nurseryProfileService } from "@/services/nurseryProfileService";
import {
  setNurseryLoading,
  setNurseryError,
  applyNurserySuccess,
  clearNurseryMutationFlags,
} from "@/redux/slices/nurseryProfileSlice";

type FormInputType = z.input<typeof nurseryApplySchema>;

export default function ApplyFormSection() {
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
      if (
        typeof error === "string" &&
        (error.includes("already submitted") || error.includes("Pending"))
      ) {
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
        dispatch(
          applyNurserySuccess({
            profile: response.profile,
            message: response.message || "",
          })
        );
      }
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Something went wrong";

      dispatch(setNurseryError(serverMessage));
      toast.error(serverMessage);

      if (
        typeof serverMessage === "string" &&
        (serverMessage.toLowerCase().includes("already submitted") ||
          serverMessage.toLowerCase().includes("pending"))
      ) {
        setIsAlreadyApplied(true);
      }
    }
  };

  return (
    <section
      id="apply-form"
      className="py-24 px-6 bg-white relative overflow-hidden border-t border-line/60"
    >
      <div className="w-full max-w-[1200px] mx-auto relative z-10">

        {/* Section Header matching AboutValues */}
        <div className="text-center mb-16">
          <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-brand-primary">
            Merchant Application
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-black m-0 mt-2 tracking-tight text-foreground">
            Register Your Nursery Today
          </h2>
          <p className="mt-3 text-[15px] text-muted-text max-w-[540px] mx-auto font-sans leading-[1.65]">
            Complete our foundational business form below to request a verified vendor account. No listing fees, ever.
          </p>
        </div>

        {/* 2-Column Split: Info Card & Form Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Left Guidance Card (lg:col-span-5) */}
          <div className="lg:col-span-5 w-full">
            <div className="rounded-2xl border border-brand-primary/10 bg-[#F4F9F5] p-8 flex flex-col justify-between space-y-6">

              <div className="space-y-6">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-dark bg-white border border-brand-primary/20 px-3 py-1 rounded-full shadow-2xs self-start">
                  <Sprout className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Verified Onboarding</span>
                </div>

                <div>
                  <h3 className="text-[20px] font-extrabold text-foreground tracking-tight mb-2">
                    Fast, Free &amp; Transparent
                  </h3>
                  <p className="text-[14px] text-muted-text leading-[1.65] m-0 font-sans">
                    Join over 340+ local nurseries receiving direct orders from urban plant parents across India.
                  </p>
                </div>

                {/* What You Need Checklist */}
                <div className="space-y-3 pt-5 border-t border-brand-primary/10">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-foreground mb-3 font-sans">
                    Application Checklist:
                  </p>
                  {[
                    "Registered nursery or greenhouse name",
                    "Active contact phone number & email address",
                    "Physical nursery location with 6-digit PIN",
                    "Ready inventory of healthy, rooted plants",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[13px] text-foreground/90 font-medium font-sans">
                      <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Guarantee Box */}
                <div className="bg-white border border-brand-primary/10 rounded-xl p-4 flex gap-3 text-left items-start shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[12px] font-bold text-foreground m-0 font-sans">Zero Upfront Commitment</p>
                    <p className="text-[12px] text-muted-text m-0 leading-relaxed font-sans">
                      Free setup, free packaging guidelines, and zero monthly subscriptions. Modest 10-15% commission only upon confirmed delivery.
                    </p>
                  </div>
                </div>
              </div>

              {/* Assistance Helpline */}
              <div className="pt-4 border-t border-brand-primary/10 flex items-center justify-between text-[12px] text-muted-text font-sans">
                <span className="flex items-center gap-1 font-medium">
                  <Lock className="w-3.5 h-3.5 text-brand-primary" /> 256-bit Encrypted
                </span>
                <span className="font-semibold text-brand-dark">
                  Help: 1800-872-2675
                </span>
              </div>
            </div>
          </div>

          {/* Right Core Form Panel (lg:col-span-7) */}
          <div className="lg:col-span-7 w-full bg-white rounded-2xl border border-line p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] relative overflow-hidden">

            {isAlreadyApplied ? (
              /* UNDER REVIEW CARD */
              <div className="text-center py-8 px-2 sm:px-4 flex flex-col items-center justify-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 text-amber-600 animate-pulse shadow-sm">
                  <Clock className="w-8 h-8" />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-[20px] font-bold text-foreground tracking-tight m-0 font-sans">
                    Application Under Review
                  </h3>
                  <p className="text-[13px] text-muted-text leading-relaxed m-0 font-sans">
                    Your partner application has been recorded. Our nursery operations team is currently verifying your location and credentials.
                  </p>
                </div>

                <div className="w-full max-w-md bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex gap-3 text-left items-start shadow-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[12px] font-bold text-amber-900 m-0 font-sans">Status: Pending Verification</p>
                    <p className="text-[11.5px] text-amber-800 m-0 leading-relaxed font-sans">
                      You will receive an email confirmation once your application is approved. Your seller dashboard access will be activated within 24–48 hours. No need to resubmit.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAlreadyApplied(false)}
                  className="text-[12px] font-bold text-brand-primary hover:text-brand-dark underline transition-colors cursor-pointer font-sans"
                >
                  Submit a different application
                </button>
              </div>
            ) : (
              /* APPLICATION FORM */
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary mb-1 font-sans">
                    <Store className="w-4 h-4" /> Nursery Seller Onboarding
                  </div>
                  <h3 className="text-[20px] font-extrabold text-foreground tracking-tight m-0">
                    Nursery Information
                  </h3>
                  <p className="text-[13px] text-muted-text m-0 mt-1 font-sans">
                    Fill in foundational business details to request your seller account.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                  {/* Business Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-foreground font-sans">
                      Nursery / Business Name <span className="text-brand-primary">*</span>
                    </label>
                    <div className="relative group">
                      <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                      <input
                        {...register("businessName")}
                        className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-line bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm transition-all placeholder:text-muted-text/60 font-medium font-sans"
                        placeholder="e.g. Greenwood Flora &amp; Nursery"
                      />
                    </div>
                    {errors.businessName && (
                      <p className="text-[12px] font-semibold text-rose-500 m-0 mt-1 block font-sans">
                        {errors.businessName.message}
                      </p>
                    )}
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-foreground font-sans">
                        Business Email <span className="text-brand-primary">*</span>
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                        <input
                          {...register("businessEmail")}
                          type="email"
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-line bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm transition-all placeholder:text-muted-text/60 font-medium font-sans"
                          placeholder="contact@nursery.com"
                        />
                      </div>
                      {errors.businessEmail && (
                        <p className="text-[12px] font-semibold text-rose-500 m-0 mt-1 block font-sans">
                          {errors.businessEmail.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-foreground font-sans">
                        Business Phone Number <span className="text-brand-primary">*</span>
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                        <input
                          {...register("businessPhone")}
                          type="tel"
                          maxLength={10}
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-line bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm transition-all placeholder:text-muted-text/60 font-medium font-sans"
                          placeholder="9876543210"
                        />
                      </div>
                      {errors.businessPhone && (
                        <p className="text-[12px] font-semibold text-rose-500 m-0 mt-1 block font-sans">
                          {errors.businessPhone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* City & PIN Code Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-foreground font-sans">
                        City <span className="text-brand-primary">*</span>
                      </label>
                      <div className="relative group">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                        <input
                          {...register("city")}
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-line bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm transition-all placeholder:text-muted-text/60 font-medium font-sans"
                          placeholder="e.g. Pune, Bengaluru"
                        />
                      </div>
                      {errors.city && (
                        <p className="text-[12px] font-semibold text-rose-500 m-0 mt-1 block font-sans">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-foreground font-sans">
                        PIN Code <span className="text-brand-primary">*</span>
                      </label>
                      <div className="relative group">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                        <input
                          {...register("pinCode")}
                          inputMode="numeric"
                          maxLength={6}
                          autoComplete="postal-code"
                          onInput={(e) => {
                            const target = e.currentTarget;
                            target.value = target.value.replace(/\D/g, "").slice(0, 6);
                          }}
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-line bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-mono tracking-wider transition-all placeholder:text-muted-text/60 font-medium text-sm"
                          placeholder="e.g. 411001"
                        />
                      </div>
                      {errors.pinCode && (
                        <p className="text-[12px] font-semibold text-rose-500 m-0 mt-1 block font-sans">
                          {errors.pinCode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Full Nursery Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-foreground font-sans">
                      Full Physical Address <span className="text-brand-primary">*</span>
                    </label>
                    <div className="relative group">
                      <Home className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-text group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                      <textarea
                        {...register("address")}
                        rows={3}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-muted-text/60 resize-none font-medium text-sm font-sans"
                        placeholder="Enter complete physical address of your nursery / greenhouse..."
                      />
                    </div>
                    {errors.address && (
                      <p className="text-[12px] font-semibold text-rose-500 m-0 mt-1 block font-sans">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                    <p className="text-[12px] text-muted-text m-0 text-center sm:text-left">
                      By submitting, you agree to Urban Nursery&apos;s Seller Terms.
                    </p>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-[14px] sm:text-[15px] font-bold rounded-[13px] text-white bg-brand-primary hover:bg-brand-dark disabled:bg-slate-300 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(21,128,61,0.25)] hover:shadow-[0_6px_22px_rgba(21,128,61,0.35)] transition-all active:scale-[0.98] cursor-pointer text-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Application</span>
                          <ArrowRight className="w-4 h-4" />
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
    </section>
  );
}