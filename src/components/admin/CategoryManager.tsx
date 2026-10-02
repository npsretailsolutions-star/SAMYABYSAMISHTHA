"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
};

function EditRow({
  category,
  onDone,
}: {
  category: Category;
  onDone: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || "");
  const [image, setImage] = useState(category.image || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/categories/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: description || null,
        image: image || null,
        sortOrder: category.sortOrder,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not save category.");
      return;
    }
    router.refresh();
    onDone();
  };

  return (
    <tr className="border-b border-brand-teal/5 last:border-0 bg-brand-gold/5">
      <td colSpan={4} className="px-4 py-4">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-3">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg object-cover bg-brand-teal/5"
              />
            )}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="flex-1 rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
          <div className="flex items-center gap-2">
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/images/products/example.jpg"
              className="flex-1 rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
            <ImageUploader multiple={false} onUploaded={(urls) => setImage(urls[0])} />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="btn-gold !py-2 !px-4 text-xs"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={onDone} className="btn-outline !py-2 !px-4 text-xs">
              Cancel
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: description || null,
        image: image || null,
        sortOrder: categories.length,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not create category.");
      return;
    }
    setName("");
    setDescription("");
    setImage("");
    router.refresh();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "Could not delete category.");
      return;
    }
    router.refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl bg-white shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-teal/10 text-left text-brand-teal/60">
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) =>
              editingId === c.id ? (
                <EditRow key={c.id} category={c} onDone={() => setEditingId(null)} />
              ) : (
                <tr key={c.id} className="border-b border-brand-teal/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-teal/5">
                      {c.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-teal">{c.name}</td>
                  <td className="px-4 py-3 text-brand-teal/60">/shop/{c.slug}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setEditingId(c.id)}
                      className="p-2 text-brand-teal hover:text-brand-gold-dark"
                      aria-label="Edit category"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="p-2 text-brand-teal hover:text-red-600"
                      aria-label="Delete category"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={onAdd} className="rounded-2xl bg-white p-6 shadow-card space-y-4 h-fit">
        <h2 className="font-serif text-base font-semibold text-brand-teal">Add Category</h2>
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">
            Description (optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-brand-teal">
              Image (optional)
            </label>
            <ImageUploader multiple={false} onUploaded={(urls) => setImage(urls[0])} />
          </div>
          <div className="flex items-center gap-2">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg object-cover bg-brand-teal/5"
              />
            )}
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/images/products/example.jpg"
              className="flex-1 rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="btn-gold w-full !py-2.5">
          <Plus size={15} /> {saving ? "Saving..." : "Add Category"}
        </button>
      </form>
    </div>
  );
}
