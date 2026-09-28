import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// One-time production bootstrap: creates categories/sample products (only if
// the database is empty) and an admin user. Protected by SETUP_SECRET so it
// can be triggered once over HTTPS after deploy, then the route/env var
// should be removed.

const schema = z.object({
  secret: z.string(),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
});

const categories = [
  { name: "Necklaces", slug: "necklaces", key: "necklace", description: "Statement necklaces for every occasion", sortOrder: 1 },
  { name: "Earrings", slug: "earrings", key: "earrings", description: "Studs, jhumkas & drop earrings", sortOrder: 2 },
  { name: "Bangles", slug: "bangles", key: "bangles", description: "Elegant bangles & bracelets", sortOrder: 3 },
  { name: "Pendants", slug: "pendants", key: "pendants", description: "Delicate pendants for daily wear", sortOrder: 4 },
  { name: "Gifting", slug: "gifting", key: "gifting", description: "Curated gift sets & combos", sortOrder: 5 },
];

const productNames: Record<string, string[]> = {
  necklace: ["Kundan Bloom Necklace", "Emerald Vine Necklace", "Pearl Cascade Necklace", "Antique Gold Necklace", "Meenakari Layered Necklace"],
  earrings: ["Kundan Pearl Jhumka", "Emerald Drop Earrings", "Floral Stud Earrings", "Gold Chandbali Earrings", "Pearl Cluster Studs"],
  bangles: ["Kundan Pearl Bangle Set", "Emerald Charm Bangle", "Antique Gold Kada", "Meenakari Bangle Duo", "Classic Pearl Bracelet"],
  pendants: ["Solitaire Kundan Pendant", "Emerald Teardrop Pendant", "Gold Om Pendant", "Pearl Halo Pendant", "Floral Locket Pendant"],
  gifting: ["Bridal Jewellery Gift Set", "Rakhi Special Combo", "Mom & Me Earring Set", "Festive Necklace Gift Box", "Duo Bangle Gift Hamper"],
};

const descriptions = [
  "Handcrafted with intricate Kundan work and finished with a lustrous 22K gold plating — a timeless piece for weddings and festive celebrations.",
  "Featuring deep emerald-hued stones set in premium gold-tone metal, this piece adds a regal touch to ethnic and fusion wear alike.",
  "Studded with cultured pearls and finished to a mirror shine, perfect for everyday elegance or special occasions.",
  "Inspired by traditional Indian craftsmanship with a modern silhouette, made from skin-friendly, tarnish-resistant alloy.",
  "A statement piece featuring hand-painted Meenakari detailing, ideal for weddings, festivals and gifting.",
];

function priceFor(i: number) {
  const base = 799 + (i % 5) * 300 + Math.floor(i / 5) * 150;
  return base * 100;
}

export async function POST(req: NextRequest) {
  if (!process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Setup is disabled" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (parsed.data.secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingCategoryCount = await prisma.category.count();
  let seededCatalog = false;

  if (existingCategoryCount === 0) {
    const categoryMap: Record<string, { id: string }> = {};
    for (const c of categories) {
      const created = await prisma.category.create({
        data: {
          name: c.name,
          slug: c.slug,
          description: c.description,
          image: `/images/products/${c.key}-1.svg`,
          sortOrder: c.sortOrder,
        },
      });
      categoryMap[c.key] = created;
    }

    let sku = 1000;
    let idx = 0;
    for (const [key, names] of Object.entries(productNames)) {
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const images = [1, 2, 3].map((n) => ((i + n) % 5) + 1).map((n) => `/images/products/${key}-${n}.svg`);
        const price = priceFor(idx);
        const compareAtPrice = Math.round(price * 1.25);
        await prisma.product.create({
          data: {
            name,
            slug,
            description: descriptions[i % descriptions.length],
            price,
            compareAtPrice,
            images: JSON.stringify(images),
            stock: 15 + (i % 4) * 5,
            sku: `SBS-${sku++}`,
            isFeatured: i < 2,
            isGiftable: key === "gifting" || i % 3 === 0,
            material: "Gold-Plated Alloy, Kundan & Pearl",
            categoryId: categoryMap[key].id,
          },
        });
        idx++;
      }
    }
    seededCatalog = true;
  }

  const hashed = await bcrypt.hash(parsed.data.adminPassword, 10);
  await prisma.admin.upsert({
    where: { email: parsed.data.adminEmail.toLowerCase() },
    update: { password: hashed },
    create: {
      email: parsed.data.adminEmail.toLowerCase(),
      password: hashed,
      name: "Samya Admin",
    },
  });

  return NextResponse.json({ ok: true, seededCatalog, adminCreated: parsed.data.adminEmail });
}
