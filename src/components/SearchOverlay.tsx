"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/format";
import { parseImages } from "@/lib/types";

type SearchProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string;
  category: { name: string };
};

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.products || []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mx-auto mt-16 sm:mt-24 max-w-xl px-4">
        <div className="rounded-2xl bg-brand-cream shadow-xl overflow-hidden">
          <div className="flex items-center gap-3 border-b border-brand-teal/10 px-5 py-4">
            <Search size={20} className="text-brand-teal/50 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for earrings, necklaces, bangles..."
              className="flex-1 bg-transparent text-brand-teal placeholder:text-brand-teal/40 focus:outline-none"
            />
            {loading && <Loader2 size={16} className="animate-spin text-brand-teal/40" />}
            <button onClick={onClose} aria-label="Close search" className="p-1 text-brand-teal/60 hover:text-brand-teal">
              <X size={20} />
            </button>
          </div>

          {query.trim().length >= 2 && (
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length === 0 && !loading ? (
                <p className="px-5 py-8 text-center text-sm text-brand-teal/60">
                  No products found for &ldquo;{query}&rdquo;
                </p>
              ) : (
                <div className="divide-y divide-brand-teal/5">
                  {results.map((p) => {
                    const images = parseImages(p.images);
                    return (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-white/60 transition-colors"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                          <Image src={images[0]} alt={p.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-brand-teal truncate">{p.name}</p>
                          <p className="text-xs text-brand-teal/50">{p.category.name}</p>
                        </div>
                        <span className="text-sm font-semibold text-brand-teal shrink-0">
                          {formatINR(p.price)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
