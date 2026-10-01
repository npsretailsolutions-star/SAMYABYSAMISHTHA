"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";

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

    const formData = new FormData();
    Array.from(fileList).forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        setUploading(false);
        return;
      }
      onUploaded(data.urls);
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
