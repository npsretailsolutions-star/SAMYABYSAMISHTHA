"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function ReviewRowActions({
  reviewId,
  isApproved,
}: {
  reviewId: string;
  isApproved: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggleApproved = async () => {
    setBusy(true);
    await fetch(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: !isApproved }),
    });
    setBusy(false);
    router.refresh();
  };

  const onDelete = async () => {
    if (!confirm("Delete this review?")) return;
    setBusy(true);
    await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={toggleApproved}
        disabled={busy}
        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
          isApproved ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
        }`}
      >
        {isApproved ? "Approved" : "Hidden"}
      </button>
      <button
        onClick={onDelete}
        disabled={busy}
        className="p-2 text-brand-teal hover:text-red-600 disabled:opacity-40"
        aria-label="Delete review"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
