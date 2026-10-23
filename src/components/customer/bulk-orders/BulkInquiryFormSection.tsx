"use client";

import React, { useState } from "react";
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  MessageSquare,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import { bulkOrderService } from "@/services/bulkOrderService";
import { BulkOrderProductType } from "@/types/bulkOrder.types";

interface FormState {
  companyName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  city: string;
  state: string;
  requirementType: string;
  quantityBracket: string;
  requiredByDate: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  companyName: "",
  contactPerson: "",
  phoneNumber: "",
  email: "",
  city: "",
  state: "",
  requirementType: "corporate-gifting",
  quantityBracket: "50-200",
  requiredByDate: "",
  message: "",
};

const REQUIREMENT_OPTIONS = [
  { value: "corporate-gifting", label: "Corporate Gifting & Welcome Kits", productType: "plants" as BulkOrderProductType },
  { value: "office-landscaping", label: "Commercial Office & Interior Greenery", productType: "services" as BulkOrderProductType },
  { value: "wedding-favors", label: "Wedding & Social Event Favors", productType: "mixed" as BulkOrderProductType },
  { value: "real-estate", label: "Real Estate & Hotel Space Greening", productType: "plants" as BulkOrderProductType },
  { value: "wholesale-plants", label: "Wholesale Plants & Ceramic Planters", productType: "pots" as BulkOrderProductType },
  { value: "custom-package", label: "Other Custom Enterprise Requirement", productType: "mixed" as BulkOrderProductType },
];

const QUANTITY_BRACKETS = [
  { label: "< 50 Units", value: "<50", numeric: 25 },
  { label: "50 – 200 Units", value: "50-200", numeric: 100 },
  { label: "200 – 1000 Units", value: "200-1000", numeric: 500 },
  { label: "1000+ Units", value: "1000+", numeric: 1000 },
];

export default function BulkInquiryFormSection() {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.contactPerson.trim()) {
      errs.contactPerson = "Contact person name is required";
    }

    if (!formData.phoneNumber.trim()) {
      errs.phoneNumber = "Phone number is required";
    } else if (
      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(
        formData.phoneNumber.trim()
      )
    ) {
      errs.phoneNumber = "Please enter a valid phone number (e.g. 9876543210)";
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
      const selectedReq = REQUIREMENT_OPTIONS.find(
        (o) => o.value === formData.requirementType
      );
      const productType: BulkOrderProductType = selectedReq?.productType || "plants";

      const selectedQty = QUANTITY_BRACKETS.find(
        (q) => q.value === formData.quantityBracket
      );
      const estimatedQuantity = selectedQty?.numeric || 50;

      const formattedName = formData.companyName.trim()
        ? `${formData.contactPerson.trim()} (${formData.companyName.trim()})`
        : formData.contactPerson.trim();

      const combinedMessage = [
        formData.companyName.trim() && `Company: ${formData.companyName.trim()}`,
        selectedReq && `Requirement: ${selectedReq.label}`,
        `Quantity Bracket: ${formData.quantityBracket}`,
        formData.requiredByDate && `Required By Date: ${formData.requiredByDate}`,
        formData.message.trim() && `Notes: ${formData.message.trim()}`,
      ]
        .filter(Boolean)
        .join("\n");

      await bulkOrderService.createBulkOrder({
        fullName: formattedName,
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        productType,
        estimatedQuantity,
        message: combinedMessage || undefined,
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
    <section
      id="inquiry-form"
      className="py-24 px-6 bg-white relative overflow-hidden border-t border-line/60"
    >
      <div className="w-full max-w-[1200px] mx-auto relative z-10">

        {/* Section Header matching AboutValues */}
        <div className="text-center mb-16">
          <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-brand-primary">
            Commercial Proposal
          </span>
          <h2 className="text-[clamp(28px,4vw,44px)] font-black m-0 mt-2 tracking-tight text-foreground">
            Request a Custom Bulk Quotation
          </h2>
          <p className="mt-3 text-[15px] text-muted-text max-w-[540px] mx-auto font-sans leading-[1.65]">
            Share your volume needs and event timelines. Our enterprise sales team will prepare an itemized quote within 24 business hours.
          </p>
        </div>

        {/* 2-Column Split: Concierge Guidance & Form Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Left Guidance Card (lg:col-span-5) */}
          <div className="lg:col-span-5 w-full">
            <div className="rounded-2xl border border-brand-primary/10 bg-[#F4F9F5] p-8 flex flex-col justify-between space-y-6">

              <div className="space-y-6">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-dark bg-white border border-brand-primary/20 px-3 py-1 rounded-full shadow-2xs self-start">
                  <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span>B2B Commercial Desk</span>
                </div>

                <div>
                  <h3 className="text-[20px] font-extrabold text-foreground tracking-tight mb-2">
                    Enterprise Standards &amp; Assurance
                  </h3>
                  <p className="text-[14px] text-muted-text leading-[1.65] m-0 font-sans">
                    Trusted by corporate HRs, architectural studios, luxury hotels, and event organizers across 150+ Indian cities.
                  </p>
                </div>

                {/* What You Get Checklist */}
                <div className="space-y-3 pt-5 border-t border-brand-primary/10">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-foreground mb-3 font-sans">
                    Commercial Inclusions:
                  </p>
                  {[
                    "Itemized volume discount tiers starting from 25 units",
                    "Custom logo printing, laser engraving & branded tags",
                    "Complimentary physical sample kit for qualified orders",
                    "Full GST tax invoice for claiming Input Tax Credit (ITC)",
                    "Dedicated account manager for end-to-end fulfillment",
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
                    <p className="text-[12px] font-bold text-foreground m-0 font-sans">100% Transit Safe Guarantee</p>
                    <p className="text-[12px] text-muted-text m-0 leading-relaxed font-sans">
                      Every plant is dispatched in shock-resistant crates. Any plant damaged in transit is replaced immediately free of charge.
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Help Desk */}
              <div className="pt-4 border-t border-brand-primary/10 flex items-center justify-between text-[12px] text-muted-text font-sans">
                <span className="flex items-center gap-1 font-medium">
                  <Lock className="w-3.5 h-3.5 text-brand-primary" /> Confidential NDA
                </span>
                <span className="font-semibold text-brand-dark">
                  Direct: corporate@urban-nursery.in
                </span>
              </div>
            </div>
          </div>

          {/* Right Core Form Panel (lg:col-span-7) */}
          <div className="lg:col-span-7 w-full bg-white rounded-2xl border border-line p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] relative overflow-hidden">

            {isSuccess ? (
              /* SUCCESS CARD */
              <div className="text-center py-8 px-2 sm:px-4 flex flex-col items-center justify-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center border border-brand-primary/30 text-brand-primary shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-[20px] font-bold text-foreground tracking-tight m-0 font-sans">
                    Inquiry Received Successfully!
                  </h3>
                  <p className="text-[13px] text-muted-text leading-relaxed m-0 font-sans">
                    Your bulk requirements have been dispatched to our commercial sales division. A dedicated account manager will review your scope and provide a formal proposal within 24 business hours.
                  </p>
                </div>

                <div className="w-full max-w-md bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex gap-3 text-left items-start shadow-xs">
                  <AlertCircle className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[12px] font-bold text-brand-dark m-0 font-sans">Status: Commercial Proposal In Progress</p>
                    <p className="text-[11.5px] text-emerald-800 m-0 leading-relaxed font-sans">
                      Itemized PDF estimation quotes and digital mockups with your logo branding will be shared directly via email and WhatsApp.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="w-full max-w-md py-3.5 px-6 bg-brand-primary hover:bg-brand-dark text-white rounded-xl text-[14px] font-bold transition-all active:scale-[0.98] cursor-pointer shadow-sm font-sans"
                >
                  Submit Another Requirement
                </button>
              </div>
            ) : (
              /* INQUIRY FORM */
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary mb-1 font-sans">
                    <Sparkles className="w-4 h-4" /> B2B Sourcing Specification
                  </div>
                  <h3 className="text-[20px] font-extrabold text-foreground tracking-tight m-0">
                    Tell Us About Your Project
                  </h3>
                  <p className="text-[13px] text-muted-text m-0 mt-1 font-sans">
                    Fill in your project scope below to receive customized volume tier pricing.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

                  {/* Company & Contact Person Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-foreground font-sans">
                        Company Name <span className="text-muted-text font-normal"></span>
                      </label>
                      <div className="relative group">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="e.g. Acme Corp"
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-line bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm transition-all placeholder:text-muted-text/60 font-medium font-sans"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-foreground font-sans">
                        Contact Person <span className="text-brand-primary">*</span>
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                        <input
                          type="text"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleChange}
                          placeholder="e.g. Priya Sharma"
                          className={`w-full h-11 pl-10 pr-3.5 rounded-xl border bg-white text-foreground focus:outline-none focus:ring-2 text-sm transition-all placeholder:text-muted-text/60 font-medium font-sans ${errors.contactPerson
                            ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                            : "border-line focus:ring-brand-primary/20 focus:border-brand-primary"
                            }`}
                        />
                      </div>
                      {errors.contactPerson && (
                        <p className="text-[12px] font-semibold text-rose-500 m-0 mt-1 block font-sans">
                          {errors.contactPerson}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone & Email Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-foreground font-sans">
                        Phone Number <span className="text-brand-primary">*</span>
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          placeholder="9876543210"
                          className={`w-full h-11 pl-10 pr-3.5 rounded-xl border bg-white text-foreground focus:outline-none focus:ring-2 text-sm transition-all placeholder:text-muted-text/60 font-medium font-sans ${errors.phoneNumber
                            ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                            : "border-line focus:ring-brand-primary/20 focus:border-brand-primary"
                            }`}
                        />
                      </div>
                      {errors.phoneNumber && (
                        <p className="text-[12px] font-semibold text-rose-500 m-0 mt-1 block font-sans">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-foreground font-sans">
                        Email <span className="text-muted-text font-normal">(For quote delivery)</span>
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="procurement@company.com"
                          className={`w-full h-11 pl-10 pr-3.5 rounded-xl border bg-white text-foreground focus:outline-none focus:ring-2 text-sm transition-all placeholder:text-muted-text/60 font-medium font-sans ${errors.email
                            ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                            : "border-line focus:ring-brand-primary/20 focus:border-brand-primary"
                            }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[12px] font-semibold text-rose-500 m-0 mt-1 block font-sans">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* City & State Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-foreground font-sans">
                        Delivery City <span className="text-brand-primary">*</span>
                      </label>
                      <div className="relative group">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="e.g. Mumbai"
                          className={`w-full h-11 pl-10 pr-3.5 rounded-xl border bg-white text-foreground focus:outline-none focus:ring-2 text-sm transition-all placeholder:text-muted-text/60 font-medium font-sans ${errors.city
                            ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                            : "border-line focus:ring-brand-primary/20 focus:border-brand-primary"
                            }`}
                        />
                      </div>
                      {errors.city && (
                        <p className="text-[12px] font-semibold text-rose-500 m-0 mt-1 block font-sans">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-foreground font-sans">
                        State <span className="text-brand-primary">*</span>
                      </label>
                      <div className="relative group">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="e.g. Maharashtra"
                          className={`w-full h-11 pl-10 pr-3.5 rounded-xl border bg-white text-foreground focus:outline-none focus:ring-2 text-sm transition-all placeholder:text-muted-text/60 font-medium font-sans ${errors.state
                            ? "border-rose-300 focus:ring-rose-200 focus:border-rose-500"
                            : "border-line focus:ring-brand-primary/20 focus:border-brand-primary"
                            }`}
                        />
                      </div>
                      {errors.state && (
                        <p className="text-[12px] font-semibold text-rose-500 m-0 mt-1 block font-sans">
                          {errors.state}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Requirement Type & Required Date Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-foreground font-sans">
                        Event / Requirement Type <span className="text-brand-primary">*</span>
                      </label>
                      <div className="relative group">
                        <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text pointer-events-none group-focus-within:text-brand-primary transition-colors" />
                        <select
                          name="requirementType"
                          value={formData.requirementType}
                          onChange={handleChange}
                          className="w-full h-11 pl-10 pr-10 rounded-xl border border-line bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm transition-all appearance-none cursor-pointer font-medium font-sans"
                        >
                          {REQUIREMENT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-foreground font-sans">
                        Required By Date <span className="text-muted-text font-normal">(Approximate)</span>
                      </label>
                      <div className="relative group">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                        <input
                          type="date"
                          name="requiredByDate"
                          value={formData.requiredByDate}
                          onChange={handleChange}
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-line bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm transition-all font-medium font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quantity Estimate Segmented Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-foreground font-sans">
                      Quantity Estimate <span className="text-brand-primary">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                      {QUANTITY_BRACKETS.map((bracket) => {
                        const isSelected = formData.quantityBracket === bracket.value;
                        return (
                          <button
                            key={bracket.value}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                quantityBracket: bracket.value,
                              }))
                            }
                            className={`py-2.5 px-3 rounded-xl border text-[13px] font-bold transition-all cursor-pointer text-center select-none truncate font-sans ${isSelected
                              ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                              : "bg-white text-foreground border-line hover:border-brand-primary/40 hover:bg-brand-light/30"
                              }`}
                          >
                            {bracket.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message & Specific Notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-foreground font-sans">
                      Project Notes &amp; Custom Branding Specifications{" "}
                      <span className="text-muted-text font-normal">(Optional)</span>
                    </label>
                    <div className="relative group">
                      <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-text group-focus-within:text-brand-primary transition-colors pointer-events-none" />
                      <textarea
                        name="message"
                        rows={3}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Detail specific plant varieties, logo engraving requirements, single or multi-drop delivery needs..."
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-muted-text/60 resize-none font-medium text-sm font-sans"
                      />
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                    <p className="text-[12px] text-muted-text m-0 text-center sm:text-left">
                      Strict NDA protected. We never share commercial details.
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-[14px] sm:text-[15px] font-bold rounded-[13px] text-white bg-brand-primary hover:bg-brand-dark disabled:bg-slate-300 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(21,128,61,0.25)] hover:shadow-[0_6px_22px_rgba(21,128,61,0.35)] transition-all active:scale-[0.98] cursor-pointer text-center"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Inquiry Request</span>
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