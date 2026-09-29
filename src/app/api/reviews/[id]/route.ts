import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const schema = z.object({
  isApproved: z.boolean(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const review = await prisma.review.update({
    where: { id: params.id },
    data: { isApproved: parsed.data.isApproved },
  });
  return NextResponse.json({ review });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.review.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
