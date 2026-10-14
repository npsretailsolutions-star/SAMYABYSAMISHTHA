// Fetches the business's Google rating + latest reviews (Places API v1) and caches the
// response for a day, so the site makes only a handful of Google calls per month.
// Needs GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID in the environment; returns null otherwise.

export type GoogleReview = {
  author: string;
  photo: string | null;
  rating: number;
  text: string;
  when: string;
};

export type GoogleReviewsData = {
  rating: number;
  total: number;
  url: string | null;
  reviews: GoogleReview[];
};

export async function getGoogleReviews(): Promise<GoogleReviewsData | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return null;

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
      },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) {
      console.error("Google Places error", res.status);
      return null;
    }
    const data = await res.json();
    if (typeof data.rating !== "number") return null;

    const reviews: GoogleReview[] = (data.reviews || [])
      .filter((r: { text?: { text?: string } }) => r.text?.text)
      .map(
        (r: {
          authorAttribution?: { displayName?: string; photoUri?: string };
          rating?: number;
          text: { text: string };
          relativePublishTimeDescription?: string;
        }) => ({
          author: r.authorAttribution?.displayName || "Google user",
          photo: r.authorAttribution?.photoUri || null,
          rating: r.rating || 5,
          text: r.text.text,
          when: r.relativePublishTimeDescription || "",
        })
      );

    return {
      rating: data.rating,
      total: data.userRatingCount || reviews.length,
      url: data.googleMapsUri || null,
      reviews,
    };
  } catch (err) {
    console.error("Google Places fetch failed", err);
    return null;
  }
}
