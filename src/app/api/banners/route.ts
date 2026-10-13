import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const schema = z.object({
  imageUrl: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().optional(),
  linkUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const d = parsed.data;
  const banner = await prisma.heroBanner.create({
    data: {
      imageUrl: d.imageUrl,
      width: d.width,
      height: d.height,
      alt: d.alt || "",
      linkUrl: d.linkUrl || null,
      sortOrder: d.sortOrder ?? 0,
      isActive: d.isActive ?? true,
    },
  });
  return NextResponse.json({ banner }, { status: 201 });
}
