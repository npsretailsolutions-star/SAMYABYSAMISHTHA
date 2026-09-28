import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  coverImage: z.string().min(1),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().optional(),
});

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  let slug = slugify(data.title);
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const post = await prisma.blogPost.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      tags: data.tags || "",
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      isPublished: data.isPublished ?? true,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
