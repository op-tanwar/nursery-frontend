"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { newsletterService } from "@/services/newsletterService";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactFormClient() {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    subject: "Order Inquiry",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please provide a valid email address");
      return;
    }

    try {
      setStatus("submitting");
      const res = await newsletterService.submitContactInquiry({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      setStatus("success");
      toast.success(res.message || "Message sent successfully! We will get back to you within 24 hours.");
      setFormData({ name: "", email: "", subject: "Order Inquiry", message: "" });
    } catch (err: any) {
      setStatus("error");
      toast.error(err?.message || "Failed to send message. Please try again.");
    }
  };

  return (
    <div className="lg:col-span-7 bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-2xs">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 text-[var(--foreground)] tracking-tight">
        Send Us a Message
      </h2>
      <p className="text-xs sm:text-sm text-[var(--muted)] mb-6">
        Fill out the form below and our nursery experts will assist you.
      </p>

      {status === "success" && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--primary-light)] border border-[var(--primary-green)] text-[var(--primary-dark)] text-sm font-medium">
          ✅ Thank you! Your message has been received. We&apos;ll reply shortly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 uppercase tracking-wider">Your Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Aman Sharma"
              className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-green)] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 uppercase tracking-wider">Email Address</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="aman@example.com"
              className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-green)] transition-colors" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 uppercase tracking-wider">Subject</label>
          <select name="subject" value={formData.subject} onChange={handleChange}
            className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-green)] transition-colors">
            <option value="Order Inquiry">Order Inquiry / Tracking</option>
            <option value="Plant Care Support">Plant Care &amp; Advice</option>
            <option value="Returns & Guarantee">30-Day Guarantee Claim</option>
            <option value="Bulk Business Inquiry">Bulk &amp; Corporate Orders</option>
            <option value="Other">Other Query</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 uppercase tracking-wider">Message</label>
          <textarea name="message" required rows={5} value={formData.message} onChange={handleChange} placeholder="Type your message here..."
            className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-xl p-4 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary-green)] transition-colors resize-none" />
        </div>

        <button type="submit" disabled={status === "submitting"}
          className="w-full bg-[var(--primary-green)] hover:bg-[var(--primary-dark)] text-white font-medium text-sm py-3 px-6 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2">
          {status === "submitting" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>Sending Message...</span></>
          ) : (
            <span>Send Message</span>
          )}
        </button>
      </form>
    </div>
  );
}
