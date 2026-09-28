"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function ProductRowActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Could not delete this product.");
      setDeleting(false);
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/products/${productId}`}
        className="p-2 text-brand-teal hover:text-brand-gold-dark"
        aria-label="Edit product"
      >
        <Pencil size={15} />
      </Link>
      <button
        onClick={onDelete}
        disabled={deleting}
        className="p-2 text-brand-teal hover:text-red-600 disabled:opacity-40"
        aria-label="Delete product"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
