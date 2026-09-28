"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

type Category = { id: string; name: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  stock: number;
  sku: string;
  isFeatured: boolean;
  isGiftable: boolean;
  isActive: boolean;
  material: string;
  categoryId: string;
};

export default function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(
    initial || {
      name: "",
      description: "",
      price: 0,
      compareAtPrice: null,
      images: [""],
      stock: 0,
      sku: "",
      isFeatured: false,
      isGiftable: false,
      isActive: true,
      material: "",
      categoryId: categories[0]?.id || "",
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(initial?.id);

  const updateImage = (i: number, value: string) => {
    setValues((v) => {
      const images = [...v.images];
      images[i] = value;
      return { ...v, images };
    });
  };

  const addImageField = () => setValues((v) => ({ ...v, images: [...v.images, ""] }));
  const removeImageField = (i: number) =>
    setValues((v) => ({ ...v, images: v.images.filter((_, idx) => idx !== i) }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...values,
      price: Math.round(Number(values.price) * 100),
      compareAtPrice: values.compareAtPrice
        ? Math.round(Number(values.compareAtPrice) * 100)
        : null,
      images: values.images.map((i) => i.trim()).filter(Boolean),
      stock: Number(values.stock),
    };

    const url = isEdit ? `/api/products/${initial!.id}` : "/api/products";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not save product.");
      setSaving(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <div className="rounded-2xl bg-white p-6 shadow-card space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">Product Name</label>
          <input
            required
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">Description</label>
          <textarea
            required
            rows={4}
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-brand-teal mb-1">Category</label>
            <select
              value={values.categoryId}
              onChange={(e) => setValues((v) => ({ ...v, categoryId: e.target.value }))}
              className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-teal mb-1">Material</label>
            <input
              value={values.material}
              onChange={(e) => setValues((v) => ({ ...v, material: e.target.value }))}
              className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card space-y-4">
        <h2 className="font-serif text-base font-semibold text-brand-teal">Pricing & Inventory</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-brand-teal mb-1">Price (₹)</label>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={values.price}
              onChange={(e) => setValues((v) => ({ ...v, price: Number(e.target.value) }))}
              className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-teal mb-1">
              Compare-at Price (₹)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={values.compareAtPrice ?? ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  compareAtPrice: e.target.value === "" ? null : Number(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-teal mb-1">Stock</label>
            <input
              required
              type="number"
              min={0}
              value={values.stock}
              onChange={(e) => setValues((v) => ({ ...v, stock: Number(e.target.value) }))}
              className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">SKU (optional)</label>
          <input
            value={values.sku}
            onChange={(e) => setValues((v) => ({ ...v, sku: e.target.value }))}
            className="w-full sm:w-64 rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card space-y-3">
        <h2 className="font-serif text-base font-semibold text-brand-teal">Images (URLs)</h2>
        <p className="text-xs text-brand-teal/60">
          Use a path like <code>/images/products/necklace-1.svg</code> or a full image URL.
        </p>
        {values.images.map((img, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={img}
              onChange={(e) => updateImage(i, e.target.value)}
              placeholder="/images/products/example.jpg"
              className="flex-1 rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
            {values.images.length > 1 && (
              <button
                type="button"
                onClick={() => removeImageField(i)}
                className="p-2 text-brand-teal/60 hover:text-red-600"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addImageField}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-gold-dark"
        >
          <Plus size={15} /> Add another image
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card space-y-3">
        <h2 className="font-serif text-base font-semibold text-brand-teal">Visibility</h2>
        <label className="flex items-center gap-2 text-sm text-brand-teal">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => setValues((v) => ({ ...v, isActive: e.target.checked }))}
            className="accent-brand-gold"
          />
          Active (visible on storefront)
        </label>
        <label className="flex items-center gap-2 text-sm text-brand-teal">
          <input
            type="checkbox"
            checked={values.isFeatured}
            onChange={(e) => setValues((v) => ({ ...v, isFeatured: e.target.checked }))}
            className="accent-brand-gold"
          />
          Featured (shown in Bestsellers)
        </label>
        <label className="flex items-center gap-2 text-sm text-brand-teal">
          <input
            type="checkbox"
            checked={values.isGiftable}
            onChange={(e) => setValues((v) => ({ ...v, isGiftable: e.target.checked }))}
            className="accent-brand-gold"
          />
          Show in Gifting Edit
        </label>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-gold">
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
