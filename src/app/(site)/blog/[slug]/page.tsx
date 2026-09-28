import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post) return {};

  const title = post.metaTitle || `${post.title} | Samya By Samishtha`;
  const description = post.metaDescription || post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: post.coverImage }],
      publishedTime: post.publishedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post || !post.isPublished) notFound();

  const related = await prisma.blogPost.findMany({
    where: { isPublished: true, id: { not: post.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Samya By Samishtha",
      logo: { "@type": "ImageObject", url: "https://samyabysamishtha.com/images/logo.png" },
    },
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
  };

  return (
    <div className="container-px mx-auto section-y max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-teal hover:text-brand-gold-dark mb-6"
      >
        <ArrowLeft size={15} /> Back to Journal
      </Link>

      <div className="mb-6">
        {post.tags && (
          <span className="eyebrow">{post.tags.split(",")[0].trim()}</span>
        )}
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-brand-teal leading-tight">
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-brand-teal/60">
          {post.publishedAt.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}{" "}
          · {post.author}
        </p>
      </div>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl mb-10 bg-brand-teal/5">
        <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
      </div>

      <article
        className="prose-policy space-y-4 text-brand-teal/85 leading-relaxed [&_h2]:font-serif [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-semibold [&_h2]:text-brand-teal [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-brand-teal [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-4 [&_li]:marker:text-brand-gold [&_strong]:text-brand-teal [&_a]:text-brand-gold-dark [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {related.length > 0 && (
        <div className="mt-16 pt-10 border-t border-brand-teal/10">
          <h2 className="font-serif text-xl font-semibold text-brand-teal mb-6">
            More from the Journal
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`} className="group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-brand-teal/5 mb-2">
                  <Image src={r.coverImage} alt={r.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="text-sm font-medium text-brand-teal group-hover:text-brand-gold-dark line-clamp-2">
                  {r.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
