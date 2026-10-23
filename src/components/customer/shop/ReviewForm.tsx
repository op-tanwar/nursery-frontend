"use client";

import { useState } from "react";
import { plantService } from "@/services/PlantsService";
import { potService } from "@/services/potService";
import { accessoryService } from "@/services/accessoryService";
import { gardeningToolService } from "@/services/gardeningToolsService";
import { plantCareService } from "@/services/plantCareService";
import { seedsBulbsService } from "@/services/seedsBulbsService";
import { plantStandsShelvesService } from "@/services/plantStandsShelvesService";
import { artificialDriedPlantService } from "@/services/artificialDriedPlantService";
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
  itemType: string;
  onAddReview: (review: ReviewType) => void;
}

export default function ReviewForm({ itemId, itemType, onAddReview }: ReviewFormProps) {
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
      const normalizedType = itemType.toLowerCase();

      const reviewPayload = {
        rating: formRating,
        comment: formComment.trim(),
        author: formName.trim()
      };

      if (normalizedType === "plants") {
        await (plantService as any).submitPlantReview(itemId, reviewPayload);
      } else if (normalizedType === "pots") {
        await (potService as any).submitPotReview(itemId, reviewPayload);
      } else if (normalizedType === "accessories") {
        await (accessoryService as any).submitAccessoryReview(itemId, reviewPayload);
      } else if (normalizedType === "gardening-tools") {
        await gardeningToolService.submitGardeningToolReview(itemId, reviewPayload);
      } else if (normalizedType === "plant-care") {
        await plantCareService.submitPlantCareReview(itemId, reviewPayload);
      } else if (normalizedType === "seeds-bulbs") {
        await seedsBulbsService.submitSeedsBulbsReview(itemId, reviewPayload);
      } else if (normalizedType === "plant-stands-shelves") {
        await plantStandsShelvesService.submitPlantStandsShelvesReview(itemId, reviewPayload);
      } else if (normalizedType === "artificial-dried-plants") {
        await (artificialDriedPlantService as any).submitArtificialReview(itemId, reviewPayload);
      } else {
        throw new Error(`Unknown tier type: ${itemType}`);
      }

      const newReview: ReviewType = {
        author: formName.trim(),
        rating: formRating,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        comment: formComment.trim(),
        verified: true,
      };

      onAddReview(newReview);
      toast.success("Feedback transmission successful! Log entry compiled.");

      setFormName("");
      setFormComment("");
      setFormRating(5);
    } catch (err: any) {
      console.error("Network Runtime Crash Trace:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to bridge stream log.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8 p-5 rounded-2xl bg-panel border border-line shadow-3xs">
      <h4 className="text-xs font-black uppercase tracking-wider text-brand-dark m-0 mb-3">
        ✍️ Append Ecosystem Experience Log
      </h4>

      <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-text block mb-1.5">
              Your Identifier (Name)
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter your name"
              className="w-full h-10 px-3 text-xs bg-background border border-line rounded-xl outline-none focus:border-brand-primary text-foreground transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-text block mb-1.5">
              Asset Rating Metric
            </label>
            <div className="flex items-center gap-1.5 h-10">
              {Array.from({ length: 5 }).map((_, idx) => {
                const starValue = idx + 1;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormRating(starValue)}
                    className="bg-transparent border-none outline-none cursor-pointer text-xl p-0 transition-transform active:scale-90"
                  >
                    <span className={starValue <= formRating ? "text-[#f59e0b]" : "text-line/40"}>
                      ★
                    </span>
                  </button>
                );
              })}
              <span className="text-[11px] font-bold text-muted-text ml-2">
                ({formRating} Stars selected)
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-muted-text block mb-1.5">
            Experience Comments Log
          </label>
          <textarea
            rows={3}
            required
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            placeholder="Share your experience..."
            className="w-full p-3 text-xs bg-background border border-line rounded-xl outline-none focus:border-brand-primary text-foreground resize-none transition-colors font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit bg-brand-dark hover:bg-brand-primary text-white text-xs font-bold px-5 h-10 rounded-xl cursor-pointer border-none transition-colors tracking-wide ml-auto shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Compiling Logs..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
