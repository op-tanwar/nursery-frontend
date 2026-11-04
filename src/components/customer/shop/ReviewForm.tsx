"use client";

import { useState } from "react";
import { productService } from "@/services/productService";
import toast from "react-hot-toast";

interface ReviewType {
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

interface ReviewFormProps {
  itemId: string;
  itemType?: string;
  onAddReview: (review: ReviewType) => void;
}

export default function ReviewForm({ itemId, onAddReview }: ReviewFormProps) {
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim() || !itemId) {
      toast.error("Mandatory fields are missing.");
      return;
    }

    try {
      setIsSubmitting(true);

      const reviewPayload = {
        rating: formRating,
        comment: formComment.trim(),
      };

      await productService.submitProductReview(itemId, reviewPayload);

      const newReview: ReviewType = {
        author: formName.trim(),
        rating: formRating,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        comment: formComment.trim(),
        verified: true,
      };

      onAddReview(newReview);
      setFormName("");
      setFormComment("");
      setFormRating(5);
      toast.success("Review posted successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Error posting review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>
      <form onSubmit={handleReviewSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <input
            type="text"
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            placeholder="e.g. Rahul Sharma"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormRating(star)}
                className={`text-2xl transition ${
                  star <= formRating ? "text-amber-400 scale-110" : "text-gray-200 hover:text-amber-200"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
          <textarea
            required
            rows={4}
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition resize-none"
            placeholder="Share details of your experience with this item..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition shadow-sm hover:shadow"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
