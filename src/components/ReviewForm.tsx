"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export default function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, customerName, email, rating, comment }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not submit review.");
      setSubmitting(false);
      return;
    }
    setSuccess(true);
    setSubmitting(false);
    router.refresh();
  };

  if (success) {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
        <p className="text-sm font-medium text-emerald-700">
          Thank you! Your review has been submitted.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-card space-y-4">
      <h3 className="font-serif text-base font-semibold text-brand-teal">Write a Review</h3>
      <p className="text-xs text-brand-teal/60">
        Only customers who have purchased this product can leave a review — enter the
        email you used at checkout to verify your purchase.
      </p>

      <div>
        <label className="block text-sm font-medium text-brand-teal mb-1">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${star} stars`}
            >
              <Star
                size={24}
                className={
                  star <= (hoverRating || rating)
                    ? "fill-brand-gold text-brand-gold"
                    : "text-brand-teal/20"
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">Name</label>
          <input
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">
            Email (used at checkout)
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-teal mb-1">Your Review</label>
        <textarea
          required
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-gold">
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
