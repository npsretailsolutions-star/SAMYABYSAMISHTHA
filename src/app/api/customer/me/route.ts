import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/auth";

const CUSTOMER_SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  pincode: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET() {
  const session = getCustomerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customer = await prisma.customer.findUnique({
    where: { id: session.id },
    select: CUSTOMER_SAFE_SELECT,
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ customer });
}

const updateSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
});

export async function PUT(req: NextRequest) {
  const session = getCustomerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const customer = await prisma.customer.update({
    where: { id: session.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
      pincode: parsed.data.pincode || null,
    },
    select: CUSTOMER_SAFE_SELECT,
  });

  return NextResponse.json({ customer });
}
