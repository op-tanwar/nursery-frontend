"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  Send,
  UploadCloud,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppSelector } from "@/redux/hooks";

export default function NurseryContactSupportPage() {
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    message: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      // Backend API call payload example:
      // const payload = new FormData();
      // payload.append("subject", formData.subject);
      // payload.append("category", formData.category);
      // payload.append("priority", formData.priority);
      // payload.append("message", formData.message);
      // if (file) payload.append("attachment", file);

      // Simulate API response
      await new Promise((resolve) => setTimeout(resolve, 1200));

      toast.success("Support ticket submitted to Admin successfully!");
      setFormData({
        subject: "",
        category: "general",
        priority: "medium",
        message: "",
      });
      setFile(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit request. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Direct Support Hub
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            Need Help, {user?.name?.split(" ")[0] || "Partner"}?
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Have queries about orders, payments, listing approval, or nursery setup? Submit a request and our Admin Support Team will respond promptly.
          </p>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Email Support
            </h3>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              support@urbannursery.com
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Guaranteed response within 24 hours
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Direct Helpline
            </h3>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              +91 1800-123-4567
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Mon - Sat (10:00 AM - 7:00 PM)
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Priority Status
            </h3>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              High Resolution
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Dedicated Nursery Manager
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Support Form & FAQ Side Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Support Request Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="border-b border-slate-100 pb-5 mb-6">
            <h2 className="text-lg font-extrabold text-slate-900">
              Send Support Ticket to Admin
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Fill in the details below and specify the priority of your issue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Issue Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Payment payout delayed or Product verification issue"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                required
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Query Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                >
                  <option value="general">General Query</option>
                  <option value="payout">Payout & Financial</option>
                  <option value="product">Plant / Product Listing</option>
                  <option value="order">Customer Order Dispute</option>
                  <option value="account">Account & Profile Security</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Priority Level
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer font-semibold"
                >
                  <option value="low" className="text-slate-600">
                    Low (Informational)
                  </option>
                  <option value="medium" className="text-amber-600">
                    Medium (Standard Issue)
                  </option>
                  <option value="high" className="text-red-600">
                    High (Urgent Attention)
                  </option>
                </select>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Detailed Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe your issue or query clearly with Order ID or Product name if relevant..."
                className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
                required
              />
            </div>

            {/* File Attachment Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Attachment (Optional Screenshot/Doc)
              </label>
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50/80 transition-colors group cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  <p className="text-xs font-medium text-slate-600">
                    {file ? (
                      <span className="font-bold text-emerald-600">
                        Selected: {file.name}
                      </span>
                    ) : (
                      <span>
                        Drag and drop or{" "}
                        <span className="text-emerald-600 font-semibold underline">
                          Browse
                        </span>
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Supports PNG, JPG, PDF up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-emerald-600/20 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span>Submitting Ticket...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message to Admin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Side Panel: FAQs & Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-4">
              <HelpCircle className="w-4 h-4 text-emerald-600" /> Frequently
              Asked Questions
            </h3>

            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <p className="font-bold text-slate-800">
                  How long do payouts take to credit?
                </p>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  Payouts are processed weekly every Monday after order completion verification.
                </p>
              </div>

              <div className="border-b border-slate-100 pb-3">
                <p className="font-bold text-slate-800">
                  Why is my plant listing status pending?
                </p>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  Admin team verifies images and descriptions within 12-24 hours before making listings live.
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-800">
                  How can I update bank details?
                </p>
                <p className="text-slate-500 mt-1 leading-relaxed">
                  Go to <span className="font-semibold text-slate-700">My Nursery Profile</span> section to modify bank account and IFSC details.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-5 flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Urgent Order Issues?</p>
              <p className="mt-1 text-amber-800/90 leading-relaxed">
                If you need immediate assistance regarding a live pickup or customer delivery cancellation, please call the direct helpline instead of creating a ticket.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}