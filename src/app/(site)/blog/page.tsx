import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jewellery Guides & Style Tips | Samya By Samishtha Blog",
  description:
    "Expert guides on choosing, styling, and caring for artificial & fashion jewellery — earrings, necklaces, bangles and pendants — from Samya By Samishtha.",
};

export default async function BlogListPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="container-px mx-auto section-y">
      <div className="text-center mb-12">
        <span className="eyebrow">The Journal</span>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-brand-teal">
          Jewellery Guides &amp; Style Tips
        </h1>
        <p className="mt-3 max-w-xl mx-auto text-sm text-brand-teal/70">
          Everything you need to know about choosing, styling, and caring for
          your jewellery — straight from Samya By Samishtha.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-brand-teal/60 py-16">No posts published yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-brand-teal/5">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                {post.tags && (
                  <span className="text-[11px] uppercase tracking-wide text-brand-gold-dark mb-2">
                    {post.tags.split(",")[0].trim()}
                  </span>
                )}
                <h2 className="font-serif text-lg font-semibold text-brand-teal mb-2 group-hover:text-brand-gold-dark">
                  {post.title}
                </h2>
                <p className="text-sm text-brand-teal/70 line-clamp-3">{post.excerpt}</p>
                <span className="mt-4 text-xs text-brand-teal/50">
                  {post.publishedAt.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
