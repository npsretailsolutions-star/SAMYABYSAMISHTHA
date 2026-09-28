import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Necklaces", slug: "necklaces", key: "necklace", description: "Statement necklaces for every occasion", sortOrder: 1 },
  { name: "Earrings", slug: "earrings", key: "earrings", description: "Studs, jhumkas & drop earrings", sortOrder: 2 },
  { name: "Bangles", slug: "bangles", key: "bangles", description: "Elegant bangles & bracelets", sortOrder: 3 },
  { name: "Pendants", slug: "pendants", key: "pendants", description: "Delicate pendants for daily wear", sortOrder: 4 },
  { name: "Gifting", slug: "gifting", key: "gifting", description: "Curated gift sets & combos", sortOrder: 5 },
];

const productNames = {
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

function priceFor(i) {
  const base = 799 + (i % 5) * 300 + Math.floor(i / 5) * 150;
  return base * 100; // paise
}

async function main() {
  console.log("Seeding database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.admin.deleteMany();

  const categoryMap = {};
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
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const images = [1, 2, 3]
        .map((n) => ((i + n) % 5) + 1)
        .map((n) => `/images/products/${key}-${n}.svg`);
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

  const adminEmail = process.env.ADMIN_EMAIL || "admin@samyabysamishtha.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Samya@2024";
  const hashed = await bcrypt.hash(adminPassword, 10);
  await prisma.admin.create({
    data: {
      email: adminEmail,
      password: hashed,
      name: "Samya Admin",
    },
  });

  console.log("Seed complete.");
  console.log(`Admin login -> email: ${adminEmail} password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
