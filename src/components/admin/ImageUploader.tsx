"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";

// Downscale + compress in the browser before upload so a batch of several
// full-resolution phone photos doesn't blow past Vercel's ~4.5MB request body limit.
async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);
  const maxDim = 1800;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
  );
  return blob || file;
}

export default function ImageUploader({
  onUploaded,
  multiple = true,
}: {
  onUploaded: (urls: string[]) => void;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      for (const file of Array.from(fileList)) {
        const compressed = await compressImage(file);
        formData.append("files", compressed, file.name);
      }

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        setUploading(false);
        return;
      }
      if (data.urls?.length) onUploaded(data.urls);
      if (data.failed?.length) {
        setError(
          `${data.failed.length} of ${fileList.length} image(s) failed: ${data.failed.join(", ")}`
        );
      }
    } catch {
      setError("Upload failed. Please try again.");
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 rounded-lg border border-brand-teal/20 px-3 py-2 text-xs font-medium text-brand-teal hover:bg-brand-teal/5 disabled:opacity-60"
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? "Uploading..." : "Upload Images"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
