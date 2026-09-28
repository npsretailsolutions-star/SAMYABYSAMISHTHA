import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogForm from "@/components/admin/BlogForm";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-6">Edit Blog Post</h1>
      <BlogForm
        initial={{
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          tags: post.tags,
          metaTitle: post.metaTitle || "",
          metaDescription: post.metaDescription || "",
          isPublished: post.isPublished,
        }}
      />
    </div>
  );
}
