import { Star } from "lucide-react";

type ReviewItem = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
};

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? "fill-brand-gold text-brand-gold" : "text-brand-teal/20"}
        />
      ))}
    </div>
  );
}

export function RatingSummary({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return (
    <div className="flex items-center gap-2">
      <Stars rating={Math.round(avg)} size={15} />
      <span className="text-sm text-brand-teal/70">
        {avg.toFixed(1)} ({reviews.length} review{reviews.length === 1 ? "" : "s"})
      </span>
    </div>
  );
}

export default function ReviewsList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-brand-teal/60">
        No reviews yet — be the first to share your experience.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-2xl bg-white p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-brand-teal">{review.customerName}</span>
            <span className="text-xs text-brand-teal/50">
              {review.createdAt.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <Stars rating={review.rating} />
          <p className="mt-3 text-sm text-brand-teal/80 leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
