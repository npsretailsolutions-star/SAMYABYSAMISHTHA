import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { offerSchema, offerData } from "@/lib/offerSchema";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);

  // Quick on/off switch from the list.
  const toggle = z.object({ isActive: z.boolean() }).strict().safeParse(body);
  if (toggle.success) {
    const offer = await prisma.offer.update({ where: { id: params.id }, data: toggle.data });
    return NextResponse.json({ offer });
  }

  const parsed = offerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid offer" },
      { status: 400 }
    );
  }
  const offer = await prisma.offer.update({ where: { id: params.id }, data: offerData(parsed.data) });
  return NextResponse.json({ offer });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.offer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
