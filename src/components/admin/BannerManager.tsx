"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Upload } from "lucide-react";

type Banner = {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  alt: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

// Keep the upload under Vercel's request body limit; the server does the final resize.
async function shrink(file: File): Promise<Blob> {
  if (file.type === "image/gif" || file.size < 3_000_000) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2400 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
  return blob || file;
}

export default function BannerManager({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", await shrink(file), file.name);
      const up = await fetch("/api/admin/banner-upload", { method: "POST", body });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error || "Upload failed");
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: upData.url,
          width: upData.width,
          height: upData.height,
          sortOrder: banners.length,
        }),
      });
      if (!res.ok) throw new Error("Could not save banner");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    setUploading(false);
  };

  const update = async (id: string, data: Partial<Banner>) => {
    await fetch(`/api/banners/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <p className="text-sm text-brand-teal/70 mb-4">
          Upload any banner image — any size or shape. It is automatically converted to WebP,
          resized, and shown in full on mobile and desktop without cropping. With more than one
          active banner, the homepage rotates through them.
        </p>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-gold !py-2.5 !px-5 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? "Uploading..." : "Upload New Banner"}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {banners.map((b) => (
        <div key={b.id} className="rounded-2xl bg-white p-4 shadow-card space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.imageUrl} alt={b.alt} className="w-full rounded-xl bg-brand-teal/5" />
          <p className="text-xs text-brand-teal/50">
            {b.width} × {b.height}px
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              defaultValue={b.linkUrl || ""}
              placeholder="Click link, e.g. /shop/bangles (optional)"
              onBlur={(e) => update(b.id, { linkUrl: e.target.value.trim() || null })}
              className="sm:col-span-2 rounded-xl border border-brand-teal/20 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
            <input
              type="number"
              defaultValue={b.sortOrder}
              title="Display order (lower shows first)"
              onBlur={(e) => update(b.id, { sortOrder: Number(e.target.value) })}
              className="rounded-xl border border-brand-teal/20 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-brand-teal">
              <input
                type="checkbox"
                checked={b.isActive}
                onChange={(e) => update(b.id, { isActive: e.target.checked })}
                className="accent-brand-gold"
              />
              Active (shown on homepage)
            </label>
            <button
              type="button"
              onClick={() => remove(b.id)}
              className="p-2 text-brand-teal hover:text-red-600"
              aria-label="Delete banner"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      {banners.length === 0 && (
        <p className="text-sm text-brand-teal/60">
          No banners uploaded yet — the homepage is showing the default banner.
        </p>
      )}
    </div>
  );
}
