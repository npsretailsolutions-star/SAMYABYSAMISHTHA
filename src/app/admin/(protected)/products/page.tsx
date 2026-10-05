import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/format";
import { parseImages } from "@/lib/types";
import ProductRowActions from "@/components/admin/ProductRowActions";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true, _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      where: searchParams.category ? { category: { slug: searchParams.category } } : undefined,
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const totalProducts = categories.reduce((sum, c) => sum + c._count.products, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold text-brand-teal">Products</h1>
        <Link href="/admin/products/new" className="btn-gold !py-2.5 !px-5">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          href="/admin/products"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            !searchParams.category
              ? "border-brand-gold bg-brand-gold text-brand-teal-dark"
              : "border-brand-teal/20 text-brand-teal/70 hover:border-brand-gold"
          }`}
        >
          All ({totalProducts})
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/admin/products?category=${c.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              searchParams.category === c.slug
                ? "border-brand-gold bg-brand-gold text-brand-teal-dark"
                : "border-brand-teal/20 text-brand-teal/70 hover:border-brand-gold"
            }`}
          >
            {c.name} ({c._count.products})
          </Link>
        ))}
      </div>

      <div className="rounded-2xl bg-white shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-teal/10 text-left text-brand-teal/60">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const images = parseImages(p.images);
              return (
                <tr key={p.id} className="border-b border-brand-teal/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-teal/5">
                        <Image src={images[0]} alt={p.name} fill className="object-cover" />
                      </div>
                      <span className="font-medium text-brand-teal line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-teal/70">{p.category.name}</td>
                  <td className="px-4 py-3 text-brand-teal/70">{formatINR(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= 5 ? "text-red-600 font-medium" : "text-brand-teal/70"}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        p.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ProductRowActions productId={p.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-8 text-center text-sm text-brand-teal/60">No products yet.</p>
        )}
      </div>
    </div>
  );
}
