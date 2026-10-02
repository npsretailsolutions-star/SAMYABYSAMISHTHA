"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import ReorderableImageList from "@/components/admin/ReorderableImageList";

export type VariantRow = {
  id: string;
  attributeName: string;
  label: string;
  images: string[];
  stock: number;
  sku: string;
};

type FormValues = {
  attributeName: "Color" | "Size";
  label: string;
  images: string[];
  stock: number;
  sku: string;
};

const emptyForm: FormValues = {
  attributeName: "Color",
  label: "",
  images: [""],
  stock: 0,
  sku: "",
};

function VariantFields({
  values,
  onChange,
}: {
  values: FormValues;
  onChange: (v: FormValues) => void;
}) {
  const addImageField = () => onChange({ ...values, images: [...values.images, ""] });
  const addUploadedImages = (urls: string[]) =>
    onChange({ ...values, images: [...values.images.filter((img) => img.trim()), ...urls] });

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-brand-teal mb-1">Type</label>
          <select
            value={values.attributeName}
            onChange={(e) =>
              onChange({ ...values, attributeName: e.target.value as "Color" | "Size" })
            }
            className="w-full rounded-lg border border-brand-teal/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          >
            <option value="Color">Color</option>
            <option value="Size">Size</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-teal mb-1">
            Value (e.g. Red, 2.4 inch)
          </label>
          <input
            value={values.label}
            onChange={(e) => onChange({ ...values, label: e.target.value })}
            className="w-full rounded-lg border border-brand-teal/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-teal mb-1">Stock</label>
          <input
            type="number"
            min={0}
            value={values.stock}
            onChange={(e) => onChange({ ...values, stock: Number(e.target.value) })}
            className="w-full rounded-lg border border-brand-teal/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-brand-teal mb-1">SKU (optional)</label>
        <input
          value={values.sku}
          onChange={(e) => onChange({ ...values, sku: e.target.value })}
          className="w-full sm:w-56 rounded-lg border border-brand-teal/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-brand-teal">
            Images for this variant (6–7 recommended)
          </label>
          <ImageUploader onUploaded={addUploadedImages} />
        </div>
        <ReorderableImageList
          images={values.images}
          onChange={(images) => onChange({ ...values, images })}
        />
        <button
          type="button"
          onClick={addImageField}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand-gold-dark"
        >
          <Plus size={13} /> Add another image
        </button>
      </div>
    </div>
  );
}

export default function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: VariantRow[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<FormValues>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormValues>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (v: VariantRow) => {
    setEditingId(v.id);
    setEditForm({
      attributeName: v.attributeName === "Size" ? "Size" : "Color",
      label: v.label,
      images: v.images.length > 0 ? v.images : [""],
      stock: v.stock,
      sku: v.sku,
    });
  };

  const submitCreate = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/products/${productId}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...addForm,
        images: addForm.images.map((i) => i.trim()).filter(Boolean),
        stock: Number(addForm.stock),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not add variant.");
      setSaving(false);
      return;
    }
    setAdding(false);
    setAddForm(emptyForm);
    setSaving(false);
    router.refresh();
  };

  const submitEdit = async (variantId: string) => {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/products/${productId}/variants/${variantId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        images: editForm.images.map((i) => i.trim()).filter(Boolean),
        stock: Number(editForm.stock),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not update variant.");
      setSaving(false);
      return;
    }
    setEditingId(null);
    setSaving(false);
    router.refresh();
  };

  const deleteVariant = async (variantId: string) => {
    if (!confirm("Delete this variant? This cannot be undone.")) return;
    const res = await fetch(`/api/products/${productId}/variants/${variantId}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-base font-semibold text-brand-teal">
            Colour / Size Variants
          </h2>
          <p className="text-xs text-brand-teal/60 mt-0.5">
            Add a variant for each colour or size. Customers will see these as swatches on the
            product page, each with its own photos and stock.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-brand-gold-dark"
          >
            <Plus size={15} /> Add Variant
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}

      {adding && (
        <div className="rounded-xl border border-brand-gold/40 bg-brand-gold/5 p-4 space-y-3">
          <VariantFields values={addForm} onChange={setAddForm} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submitCreate}
              disabled={saving || !addForm.label.trim()}
              className="btn-gold !py-2 !px-4 text-xs"
            >
              {saving ? "Saving..." : "Save Variant"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setAddForm(emptyForm);
              }}
              className="btn-outline !py-2 !px-4 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {variants.length === 0 && !adding ? (
        <p className="text-sm text-brand-teal/50 italic">
          No variants yet. All customers will see the main product images and stock above.
        </p>
      ) : (
        <div className="space-y-3">
          {variants.map((v) =>
            editingId === v.id ? (
              <div key={v.id} className="rounded-xl border border-brand-gold/40 bg-brand-gold/5 p-4 space-y-3">
                <VariantFields values={editForm} onChange={setEditForm} />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => submitEdit(v.id)}
                    disabled={saving}
                    className="btn-gold !py-2 !px-4 text-xs"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="btn-outline !py-2 !px-4 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={v.id}
                className="flex items-center gap-3 rounded-xl border border-brand-teal/10 p-3"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-teal/5">
                  {v.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.images[0]} alt={v.label} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-teal">
                    {v.attributeName}: {v.label}
                  </p>
                  <p className="text-xs text-brand-teal/50">
                    {v.images.length} image{v.images.length !== 1 ? "s" : ""} · Stock: {v.stock}
                    {v.sku ? ` · SKU: ${v.sku}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(v)}
                  className="p-1.5 text-brand-teal/60 hover:text-brand-gold-dark"
                  aria-label="Edit variant"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteVariant(v.id)}
                  className="p-1.5 text-brand-teal/60 hover:text-red-600"
                  aria-label="Delete variant"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
