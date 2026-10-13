import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const schema = z.object({
  alt: z.string().optional(),
  linkUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const d = parsed.data;
  const banner = await prisma.heroBanner.update({
    where: { id: params.id },
    data: {
      ...(d.alt !== undefined && { alt: d.alt }),
      ...(d.linkUrl !== undefined && { linkUrl: d.linkUrl || null }),
      ...(d.sortOrder !== undefined && { sortOrder: d.sortOrder }),
      ...(d.isActive !== undefined && { isActive: d.isActive }),
    },
  });
  return NextResponse.json({ banner });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.heroBanner.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
