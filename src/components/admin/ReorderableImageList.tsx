"use client";

import { useState } from "react";
import { GripVertical, X } from "lucide-react";

export default function ReorderableImageList({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const updateImage = (i: number, value: string) => {
    const next = [...images];
    next[i] = value;
    onChange(next);
  };

  const removeImage = (i: number) => {
    onChange(images.filter((_, idx) => idx !== i));
  };

  const moveImage = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {images.map((img, i) => (
        <div
          key={i}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => {
            e.preventDefault();
            if (overIndex !== i) setOverIndex(i);
          }}
          onDrop={() => {
            if (dragIndex !== null) moveImage(dragIndex, i);
            setDragIndex(null);
            setOverIndex(null);
          }}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          className={`flex items-center gap-2 rounded-xl border p-1.5 transition-colors ${
            dragIndex === i
              ? "opacity-40 border-brand-teal/20"
              : overIndex === i
                ? "border-brand-gold bg-brand-gold/5"
                : "border-transparent"
          }`}
        >
          <span
            className="cursor-grab text-brand-teal/40 active:cursor-grabbing shrink-0"
            title="Drag to reorder"
          >
            <GripVertical size={16} />
          </span>
          <span className="w-4 shrink-0 text-center text-[10px] font-semibold text-brand-teal/40">
            {i + 1}
          </span>
          {img.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg object-cover bg-brand-teal/5"
            />
          )}
          <input
            value={img}
            onChange={(e) => updateImage(i, e.target.value)}
            placeholder="/images/products/example.jpg"
            className="flex-1 rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="p-2 text-brand-teal/60 hover:text-red-600 shrink-0"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}
      {images.length > 1 && (
        <p className="text-[11px] text-brand-teal/50">
          Drag <GripVertical size={11} className="inline -mt-0.5" /> to reorder — the first image
          is the main cover photo.
        </p>
      )}
    </div>
  );
}
