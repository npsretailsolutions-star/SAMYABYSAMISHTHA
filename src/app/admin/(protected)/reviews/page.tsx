import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ReviewRowActions from "@/components/admin/ReviewRowActions";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-6">Reviews</h1>

      <div className="rounded-2xl bg-white shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-teal/10 text-left text-brand-teal/60">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Review</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b border-brand-teal/5 last:border-0 align-top">
                <td className="px-4 py-3 font-medium text-brand-teal whitespace-nowrap">
                  {r.product.name}
                </td>
                <td className="px-4 py-3 text-brand-teal/70 whitespace-nowrap">
                  <div>{r.customerName}</div>
                  <div className="text-xs text-brand-teal/50">{r.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={s <= r.rating ? "fill-brand-gold text-brand-gold" : "text-brand-teal/20"}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-teal/70 max-w-xs">{r.comment}</td>
                <td className="px-4 py-3 text-brand-teal/60 whitespace-nowrap">
                  {r.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <ReviewRowActions reviewId={r.id} isApproved={r.isApproved} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && (
          <p className="p-8 text-center text-sm text-brand-teal/60">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
