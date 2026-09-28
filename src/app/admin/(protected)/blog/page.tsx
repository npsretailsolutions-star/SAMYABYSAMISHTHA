import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import BlogRowActions from "@/components/admin/BlogRowActions";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold text-brand-teal">Blog</h1>
        <Link href="/admin/blog/new" className="btn-gold !py-2.5 !px-5">
          <Plus size={16} /> New Post
        </Link>
      </div>

      <div className="rounded-2xl bg-white shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-teal/10 text-left text-brand-teal/60">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-brand-teal/5 last:border-0">
                <td className="px-4 py-3 font-medium text-brand-teal">{p.title}</td>
                <td className="px-4 py-3 text-brand-teal/60 text-xs">{p.tags}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      p.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-teal/60">
                  {p.publishedAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <BlogRowActions postId={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <p className="p-8 text-center text-sm text-brand-teal/60">No blog posts yet.</p>
        )}
      </div>
    </div>
  );
}
