"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteOrderButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    if (
      !confirm(
        `Delete order ${orderNumber} permanently?\n\nUse this only for test orders. Stock will be added back. This cannot be undone.`
      )
    )
      return;
    setDeleting(true);
    const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    if (!res.ok) {
      setDeleting(false);
      alert("Could not delete order");
      return;
    }
    router.push("/admin/orders");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={deleting}
      className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {deleting ? "Deleting…" : "Delete Order"}
    </button>
  );
}
