"use client";

import React, { useState } from "react";
import { Star, X, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { plantService } from "@/services/PlantsService";
import { potService } from "@/services/potService";
import { accessoryService } from "@/services/accessoryService";
import { gardeningToolService } from "@/services/gardeningToolsService";
import { plantCareService } from "@/services/plantCareService";
import { seedsBulbsService } from "@/services/seedsBulbsService";
import { plantStandsShelvesService } from "@/services/plantStandsShelvesService";
import { artificialDriedPlantService } from "@/services/artificialDriedPlantService";

export interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    itemModel?: string;
    imageUrl?: string;
  } | null;
  defaultAuthor?: string;
  onReviewSubmitted?: (productId: string) => void;
}

export default function WriteReviewModal({
  isOpen,
  onClose,
  product,
  defaultAuthor = "",
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [author, setAuthor] = useState<string>(defaultAuthor);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error("Please write a few words about your experience.");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Please select a star rating between 1 and 5.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting your review...");

    try {
      const model = (product.itemModel || "").toLowerCase();
      const reviewPayload = {
        rating,
        comment: comment.trim(),
        author: author.trim() || defaultAuthor || "Customer",
      };

      if (model.includes("pot")) {
        await potService.submitPotReview(product.id, reviewPayload);
      } else if (model.includes("accessor")) {
        await accessoryService.submitAccessoryReview(product.id, reviewPayload);
      } else if (model.includes("tool") || model.includes("gardening")) {
        await gardeningToolService.submitGardeningToolReview(product.id, reviewPayload);
      } else if (model.includes("care") || model.includes("plantcare")) {
        await plantCareService.submitPlantCareReview(product.id, reviewPayload);
      } else if (model.includes("seed") || model.includes("bulb")) {
        await seedsBulbsService.submitSeedsBulbsReview(product.id, reviewPayload);
      } else if (model.includes("stand") || model.includes("shelve")) {
        await plantStandsShelvesService.submitPlantStandsShelvesReview(product.id, reviewPayload);
      } else if (model.includes("artificial") || model.includes("dried")) {
        await artificialDriedPlantService.submitArtificialReview(product.id, reviewPayload);
      } else {
        await plantService.submitPlantReview(product.id, reviewPayload);
      }

      toast.success("Thank you! Your review has been submitted successfully.", {
        id: toastId,
      });

      if (onReviewSubmitted) {
        onReviewSubmitted(product.id);
      }
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to submit review. Please try again.";
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Feedback & Rating
          </span>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Write a Review</h3>
          <p className="text-xs text-slate-500 line-clamp-1">
            Sharing your thoughts on <strong className="text-slate-800">{product.name}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Overall Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer focus:outline-hidden"
                    title={`${star} Star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        isFilled
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200 fill-transparent"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-bold text-slate-600">
                {rating === 5 && "🌟 Excellent"}
                {rating === 4 && "👍 Very Good"}
                {rating === 3 && "👌 Good"}
                {rating === 2 && "😐 Fair"}
                {rating === 1 && "😞 Poor"}
              </span>
            </div>
          </div>

          {/* Review Author Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Name</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition"
            />
          </div>

          {/* Review Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Your Review <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love about this plant/product? How was the packaging, health, and quality?"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
