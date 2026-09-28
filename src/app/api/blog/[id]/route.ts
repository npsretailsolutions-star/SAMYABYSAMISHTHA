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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      tags: data.tags || "",
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      isPublished: data.isPublished ?? true,
    },
  });

  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
