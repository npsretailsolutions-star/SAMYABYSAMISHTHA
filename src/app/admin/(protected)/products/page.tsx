import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/format";
import { parseImages } from "@/lib/types";
import ProductRowActions from "@/components/admin/ProductRowActions";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold text-brand-teal">Products</h1>
        <Link href="/admin/products/new" className="btn-gold !py-2.5 !px-5">
          <Plus size={16} /> Add Product
        </Link>
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
