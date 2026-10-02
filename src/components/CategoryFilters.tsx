"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

type Category = { name: string; slug: string; count: number };

export default function CategoryFilters({
  categories,
  currentCategorySlug,
  materials,
}: {
  categories: Category[];
  currentCategorySlug: string;
  materials: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const selectedMaterials = (searchParams.get("material") || "")
    .split(",")
    .filter(Boolean);

  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const applyPriceRange = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams({ minPrice: minInput || null, maxPrice: maxInput || null });
  };

  const toggleMaterial = (material: string) => {
    const next = selectedMaterials.includes(material)
      ? selectedMaterials.filter((m) => m !== material)
      : [...selectedMaterials, material];
    pushParams({ material: next.length > 0 ? next.join(",") : null });
  };

  const filterContent = (
    <>
      <div>
        <h3 className="eyebrow mb-3">Category</h3>
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.slug}>
              <a
                href={`/shop/${c.slug}`}
                className="flex items-center justify-between gap-2 text-sm group"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      c.slug === currentCategorySlug
                        ? "border-brand-teal bg-brand-teal"
                        : "border-brand-teal/30"
                    }`}
                  >
                    {c.slug === currentCategorySlug && (
                      <span className="h-1.5 w-1.5 rounded-sm bg-brand-cream" />
                    )}
                  </span>
                  <span
                    className={`${
                      c.slug === currentCategorySlug
                        ? "text-brand-teal font-medium"
                        : "text-brand-teal/70"
                    } group-hover:text-brand-gold-dark`}
                  >
                    {c.name}
                  </span>
                </span>
                <span className="text-xs text-brand-teal/40">({c.count})</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="eyebrow mb-3">Price Range</h3>
        <form onSubmit={applyPriceRange} className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            placeholder="Min"
            className="w-full rounded-lg border border-brand-teal/20 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
          <span className="text-brand-teal/40 text-sm">–</span>
          <input
            type="number"
            min={0}
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            placeholder="Max"
            className="w-full rounded-lg border border-brand-teal/20 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </form>
        <button
          onClick={applyPriceRange}
          className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-gold-dark hover:underline"
        >
          Apply
        </button>
      </div>

      {materials.length > 0 && (
        <div>
          <h3 className="eyebrow mb-3">Material</h3>
          <ul className="space-y-2">
            {materials.map((m) => (
              <li key={m}>
                <button
                  onClick={() => toggleMaterial(m)}
                  className="flex items-center gap-2 text-sm w-full text-left group"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      selectedMaterials.includes(m)
                        ? "border-brand-teal bg-brand-teal"
                        : "border-brand-teal/30"
                    }`}
                  >
                    {selectedMaterials.includes(m) && (
                      <span className="h-1.5 w-1.5 rounded-sm bg-brand-cream" />
                    )}
                  </span>
                  <span className="text-brand-teal/70 group-hover:text-brand-gold-dark">
                    {m}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile: compact trigger instead of the full filter block taking vertical space */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 self-start rounded-full border border-brand-teal/20 px-4 py-2 text-sm font-medium text-brand-teal"
      >
        <SlidersHorizontal size={15} /> Filters
      </button>

      {/* Desktop: static sidebar, side-by-side with products */}
      <aside className="hidden lg:block w-60 shrink-0 space-y-8">{filterContent}</aside>

      {/* Mobile: slide-in drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[82%] max-w-xs overflow-y-auto bg-white p-6 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-brand-teal">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 text-brand-teal/60"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
}
