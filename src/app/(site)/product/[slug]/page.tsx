import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/format";
import { parseImages, type ProductWithCategory } from "@/lib/types";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButtons from "@/components/AddToCartButtons";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });
  if (!product || !product.isActive) notFound();

  const images = parseImages(product.images);
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      id: { not: product.id },
    },
    include: { category: true },
    take: 4,
  });

  return (
    <div className="container-px mx-auto section-y">
      <nav className="mb-6 text-xs text-brand-teal/60">
        <Link href="/" className="hover:text-brand-gold-dark">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/shop/${product.category.slug}`} className="hover:text-brand-gold-dark">
          {product.category.name}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-brand-teal">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={images} name={product.name} />

        <div>
          <span className="eyebrow">{product.category.name}</span>
          <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-brand-teal text-balance">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold text-brand-teal">
              {formatINR(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-base text-brand-teal/50 line-through">
                  {formatINR(product.compareAtPrice)}
                </span>
                <span className="rounded-full bg-brand-teal/10 px-2.5 py-1 text-xs font-semibold text-brand-teal">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-brand-teal/70">
            {product.description}
          </p>

          {product.material && (
            <p className="mt-3 text-sm text-brand-teal/70">
              <span className="font-medium text-brand-teal">Material: </span>
              {product.material}
            </p>
          )}

          <p className="mt-2 text-sm">
            {product.stock > 0 ? (
              <span className="text-emerald-700 font-medium">
                In Stock {product.stock <= 5 ? `(Only ${product.stock} left)` : ""}
              </span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </p>

          <div className="mt-6">
            <AddToCartButtons
              productId={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              image={images[0]}
              stock={product.stock}
            />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-brand-teal/10 pt-6">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Truck size={18} className="text-brand-gold-dark" />
              <span className="text-[11px] text-brand-teal/70">Pan-India Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <ShieldCheck size={18} className="text-brand-gold-dark" />
              <span className="text-[11px] text-brand-teal/70">Skin Friendly</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <RotateCcw size={18} className="text-brand-gold-dark" />
              <span className="text-[11px] text-brand-teal/70">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-serif text-xl font-semibold text-brand-teal mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {(related as ProductWithCategory[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
