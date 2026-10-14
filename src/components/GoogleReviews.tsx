import { Star } from "lucide-react";
import { getGoogleReviews } from "@/lib/googleReviews";

function Stars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? "fill-brand-gold text-brand-gold" : "text-brand-teal/20"}
        />
      ))}
    </div>
  );
}

// Real Google reviews, shown as-is (not filtered or edited). Renders nothing until the
// Google env vars are set or if Google can't be reached.
export default async function GoogleReviews() {
  const data = await getGoogleReviews();
  if (!data || data.reviews.length === 0) return null;

  return (
    <section className="bg-brand-cream">
      <div className="container-px mx-auto section-y">
        <div className="text-center mb-8">
          <span className="eyebrow">What Customers Say</span>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-brand-teal">
            Reviews on Google
          </h2>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Stars rating={data.rating} size={18} />
            <span className="text-sm font-medium text-brand-teal">
              {data.rating.toFixed(1)} · {data.total} review{data.total === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.reviews.slice(0, 6).map((r, i) => (
            <div key={i} className="rounded-2xl bg-white p-5 shadow-card">
              <div className="flex items-center gap-3">
                {r.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.photo}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-teal/10 text-sm font-semibold text-brand-teal">
                    {r.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-teal">{r.author}</p>
                  <p className="text-[11px] text-brand-teal/50">{r.when}</p>
                </div>
              </div>
              <div className="mt-3">
                <Stars rating={r.rating} />
              </div>
              <p className="mt-2 text-sm text-brand-teal/80 line-clamp-6">{r.text}</p>
            </div>
          ))}
        </div>

        {data.url && (
          <p className="mt-6 text-center text-sm">
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold-dark hover:underline"
            >
              See all reviews on Google
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
