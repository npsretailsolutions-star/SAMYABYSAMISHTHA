"use client";

import { Share2 } from "lucide-react";

export default function ShareButton({
  name,
  url,
}: {
  name: string;
  url: string;
}) {
  const handleShare = () => {
    const text = `${name} - ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 rounded-full border border-brand-teal py-2 px-4 text-xs font-semibold uppercase tracking-wide text-brand-teal transition-colors hover:bg-brand-teal hover:text-brand-cream"
      aria-label="Share on WhatsApp"
    >
      <Share2 size={14} />
      Share
    </button>
  );
}
