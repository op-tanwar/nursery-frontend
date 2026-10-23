"use client";

import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Layers,
  Hash,
  MessageSquare,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { bulkOrderService } from "@/services/bulkOrderService";
import { BulkOrderProductType } from "@/types/bulkOrder.types";

interface FormState {
  fullName: string;
  phoneNumber: string;
  email: string;
  city: string;
  state: string;
  productType: BulkOrderProductType;
  estimatedQuantity: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  fullName: "",
  phoneNumber: "",
  email: "",
  city: "",
  state: "",
  productType: "plants",
  estimatedQuantity: "",
  message: "",
};

const PRODUCT_CATEGORIES: { value: BulkOrderProductType; label: string }[] = [
  { value: "plants", label: "Premium Live Plants (Indoor & Outdoor)" },
  { value: "pots", label: "Designer Planters & Pots" },
  { value: "accessories", label: "Gardening Tools & Accessories" },
  { value: "fertilizers", label: "Organic Fertilizers & Soils" },
  { value: "services", label: "Corporate Landscaping & Maintenance" },
  { value: "mixed", label: "Mixed Wholesale Package" },
];

export default function BulkOrderForm() {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errs.fullName = "Full name is required";
    }

    if (!formData.phoneNumber.trim()) {
      errs.phoneNumber = "Phone number is required";
    } else if (
      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(
        formData.phoneNumber.trim()
      )
    ) {
      errs.phoneNumber = "Please enter a valid phone number";
    }

    if (formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errs.email = "Please enter a valid email address";
      }
    }

    if (!formData.city.trim()) {
      errs.city = "City is required";
    }

    if (!formData.state.trim()) {
      errs.state = "State is required";
    }

    const qty = Number(formData.estimatedQuantity);
    if (!formData.estimatedQuantity || isNaN(qty) || qty < 1) {
      errs.estimatedQuantity = "Estimated quantity must be at least 1 unit";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required fields accurately.");
      return;
    }

    setIsSubmitting(true);
    try {
      await bulkOrderService.createBulkOrder({
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        productType: formData.productType,
        estimatedQuantity: Number(formData.estimatedQuantity),
        message: formData.message.trim() || undefined,
      });

      toast.success("Bulk order inquiry submitted successfully!");
      setIsSuccess(true);
      setFormData(INITIAL_FORM);
    } catch (err: any) {
      console.error("Bulk inquiry submit error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit inquiry. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lg:col-span-7 bg-white/80 backdrop-blur-md rounded-3xl border border-emerald-200/60 shadow-xl shadow-emerald-900/5 p-6 sm:p-8 md:p-10 flex flex-col justify-center relative overflow-hidden">
      {isSuccess ? (
        /* UNDER REVIEW / SUCCESS CARD - EXACT STYLING FROM /apply */
        <div className="text-center py-10 px-4 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 text-emerald-600 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Inquiry Received Successfully!
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Your bulk order requirement has been recorded. An executive commercial manager will complete the review and reach out within 24 business hours.
            </p>
          </div>

          <div className="w-full max-w-md bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex gap-3.5 text-left items-start shadow-2xs">
            <AlertCircle className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-emerald-900 m-0">Status: Commercial Review Pending</p>
              <p className="text-[11px] text-emerald-800 m-0 leading-relaxed font-medium">
                Formal estimation quotes and customized volume tier pricing will be shared directly via phone or your provided email address.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSuccess(false)}
            className="w-full max-w-md py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-700/20"
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        /* APPLICATION FORM - EXACT STYLING & STRUCTURE FROM /apply */
        <>
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
              <Building2 className="w-4 h-4" /> Commercial Request Form
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight m-0">Bulk Order Inquiry</h2>
            <p className="text-xs text-slate-600 m-0 mt-1 font-medium">Enter your project scope to request a customized enterprise quote.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name & Phone Number Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Full Name <span className="text-emerald-600">*</span>
                </label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-white/90 text-slate-900 focus:outline-none focus:ring-2 text-sm transition-all placeholder:text-slate-400 font-medium ${
                      errors.fullName
                        ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                        : "border-slate-200/90 focus:ring-emerald-500/20 focus:border-emerald-600"
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs font-semibold text-rose-500 m-0 mt-0.5">{errors.fullName}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Mobile Number <span className="text-emerald-600">*</span>
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-white/90 text-slate-900 focus:outline-none focus:ring-2 text-sm transition-all placeholder:text-slate-400 font-medium ${
                      errors.phoneNumber
                        ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                        : "border-slate-200/90 focus:ring-emerald-500/20 focus:border-emerald-600"
                    }`}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-xs font-semibold text-rose-500 m-0 mt-0.5">{errors.phoneNumber}</p>
                )}
              </div>
            </div>

            {/* Email Address (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Corporate / Work Email <span className="text-slate-400 font-normal">(Optional for quote PDF delivery)</span>
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-white/90 text-slate-900 focus:outline-none focus:ring-2 text-sm transition-all placeholder:text-slate-400 font-medium ${
                    errors.email
                      ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                      : "border-slate-200/90 focus:ring-emerald-500/20 focus:border-emerald-600"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-semibold text-rose-500 m-0 mt-0.5">{errors.email}</p>
              )}
            </div>

            {/* City & State Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  City <span className="text-emerald-600">*</span>
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai, Bengaluru"
                    className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-white/90 text-slate-900 focus:outline-none focus:ring-2 text-sm transition-all placeholder:text-slate-400 font-medium ${
                      errors.city
                        ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                        : "border-slate-200/90 focus:ring-emerald-500/20 focus:border-emerald-600"
                    }`}
                  />
                </div>
                {errors.city && (
                  <p className="text-xs font-semibold text-rose-500 m-0 mt-0.5">{errors.city}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  State <span className="text-emerald-600">*</span>
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Maharashtra"
                    className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-white/90 text-slate-900 focus:outline-none focus:ring-2 text-sm transition-all placeholder:text-slate-400 font-medium ${
                      errors.state
                        ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                        : "border-slate-200/90 focus:ring-emerald-500/20 focus:border-emerald-600"
                    }`}
                  />
                </div>
                {errors.state && (
                  <p className="text-xs font-semibold text-rose-500 m-0 mt-0.5">{errors.state}</p>
                )}
              </div>
            </div>

            {/* Category & Quantity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Primary Category <span className="text-emerald-600">*</span>
                </label>
                <div className="relative group">
                  <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-emerald-600 transition-colors" />
                  <select
                    name="productType"
                    value={formData.productType}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200/90 bg-white/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm transition-all appearance-none cursor-pointer font-medium"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Estimated Quantity <span className="text-emerald-600">*</span>
                </label>
                <div className="relative group">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                    type="number"
                    min="1"
                    name="estimatedQuantity"
                    value={formData.estimatedQuantity}
                    onChange={handleChange}
                    placeholder="e.g. 150 units"
                    className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-white/90 text-slate-900 focus:outline-none focus:ring-2 text-sm transition-all placeholder:text-slate-400 font-medium ${
                      errors.estimatedQuantity
                        ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                        : "border-slate-200/90 focus:ring-emerald-500/20 focus:border-emerald-600"
                    }`}
                  />
                </div>
                {errors.estimatedQuantity && (
                  <p className="text-xs font-semibold text-rose-500 m-0 mt-0.5">{errors.estimatedQuantity}</p>
                )}
              </div>
            </div>

            {/* Additional Message / Requirements */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                Project Scope &amp; Requirements <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative group">
                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter complete requirement details, plant varieties, timeline, or custom packaging needs..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/90 bg-white/90 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm transition-all placeholder:text-slate-400 resize-none font-medium"
                />
              </div>
            </div>

            {/* Submit Action Bar */}
            <div className="pt-4 border-t border-emerald-900/10 mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed h-11 px-8 rounded-xl shadow-md shadow-emerald-700/20 transition-all active:scale-95 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Inquiry...
                  </>
                ) : (
                  <>
                    Submit Inquiry Request <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
