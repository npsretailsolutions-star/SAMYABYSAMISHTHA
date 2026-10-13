import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.samyabysamishtha.com";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const abs = (u: string) => (u.startsWith("http") ? u : `${SITE}${u.startsWith("/") ? "" : "/"}${u}`);
const money = (paise: number) => `${(paise / 100).toFixed(2)} INR`;

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const items = products
    .map((p) => {
      let images: string[] = [];
      try {
        images = JSON.parse(p.images);
      } catch {}
      if (images.length === 0) return "";
      const onSale = p.compareAtPrice && p.compareAtPrice > p.price;
      return `    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(p.name.slice(0, 150))}</g:title>
      <g:description>${esc(p.description.slice(0, 5000))}</g:description>
      <g:link>${SITE}/product/${esc(p.slug)}</g:link>
      <g:image_link>${esc(abs(images[0]))}</g:image_link>
${images
  .slice(1, 10)
  .map((i) => `      <g:additional_image_link>${esc(abs(i))}</g:additional_image_link>`)
  .join("\n")}
      <g:availability>${p.stock > 0 ? "in stock" : "out of stock"}</g:availability>
      <g:price>${money(onSale ? p.compareAtPrice! : p.price)}</g:price>${
        onSale ? `\n      <g:sale_price>${money(p.price)}</g:sale_price>` : ""
      }
      <g:condition>new</g:condition>
      <g:brand>Samya By Samishtha</g:brand>
      <g:google_product_category>Apparel &amp; Accessories &gt; Jewelry</g:google_product_category>
      <g:product_type>${esc(p.category.name)}</g:product_type>${p.sku ? `\n      <g:mpn>${esc(p.sku)}</g:mpn>` : ""}
    </item>`;
    })
    .filter(Boolean)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Samya By Samishtha</title>
    <link>${SITE}</link>
    <description>Premium artificial &amp; fashion jewellery</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
