import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { offerSchema, offerData } from "@/lib/offerSchema";

export async function POST(req: NextRequest) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = offerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid offer" },
      { status: 400 }
    );
  }
  const offer = await prisma.offer.create({ data: offerData(parsed.data) });
  return NextResponse.json({ offer }, { status: 201 });
}
