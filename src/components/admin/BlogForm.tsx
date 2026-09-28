"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type BlogFormValues = {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
};

export default function BlogForm({ initial }: { initial?: BlogFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<BlogFormValues>(
    initial || {
      title: "",
      excerpt: "",
      content: "",
      coverImage: "",
      tags: "",
      metaTitle: "",
      metaDescription: "",
      isPublished: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(initial?.id);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = isEdit ? `/api/blog/${initial!.id}` : "/api/blog";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not save post.");
      setSaving(false);
      return;
    }
    router.push("/admin/blog");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <div className="rounded-2xl bg-white p-6 shadow-card space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">Title</label>
          <input
            required
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">Excerpt (short summary)</label>
          <textarea
            required
            rows={2}
            value={values.excerpt}
            onChange={(e) => setValues((v) => ({ ...v, excerpt: e.target.value }))}
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">
            Content (HTML — use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt; tags)
          </label>
          <textarea
            required
            rows={14}
            value={values.content}
            onChange={(e) => setValues((v) => ({ ...v, content: e.target.value }))}
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">Cover Image URL</label>
          <input
            required
            value={values.coverImage}
            onChange={(e) => setValues((v) => ({ ...v, coverImage: e.target.value }))}
            placeholder="/images/products/necklace-1.svg"
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">Tags (comma-separated)</label>
          <input
            value={values.tags}
            onChange={(e) => setValues((v) => ({ ...v, tags: e.target.value }))}
            placeholder="jewellery guide, earrings, gifting"
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card space-y-4">
        <h2 className="font-serif text-base font-semibold text-brand-teal">SEO</h2>
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">
            Meta Title (optional, falls back to title)
          </label>
          <input
            value={values.metaTitle}
            onChange={(e) => setValues((v) => ({ ...v, metaTitle: e.target.value }))}
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-teal mb-1">
            Meta Description (optional, falls back to excerpt)
          </label>
          <textarea
            rows={2}
            value={values.metaDescription}
            onChange={(e) => setValues((v) => ({ ...v, metaDescription: e.target.value }))}
            className="w-full rounded-xl border border-brand-teal/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-brand-teal">
          <input
            type="checkbox"
            checked={values.isPublished}
            onChange={(e) => setValues((v) => ({ ...v, isPublished: e.target.checked }))}
            className="accent-brand-gold"
          />
          Published (visible on /blog)
        </label>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}

      <button type="submit" disabled={saving} className="btn-gold">
        {saving ? "Saving..." : isEdit ? "Save Changes" : "Publish Post"}
      </button>
    </form>
  );
}
