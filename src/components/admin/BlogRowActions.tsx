"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function BlogRowActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    if (!confirm("Delete this blog post? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/blog/${postId}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Could not delete this post.");
      setDeleting(false);
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/blog/${postId}`}
        className="p-2 text-brand-teal hover:text-brand-gold-dark"
        aria-label="Edit post"
      >
        <Pencil size={15} />
      </Link>
      <button
        onClick={onDelete}
        disabled={deleting}
        className="p-2 text-brand-teal hover:text-red-600 disabled:opacity-40"
        aria-label="Delete post"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
