import BlogForm from "@/components/admin/BlogForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-brand-teal mb-6">New Blog Post</h1>
      <BlogForm />
    </div>
  );
}
