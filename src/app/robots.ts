import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/checkout", "/cart"],
      },
    ],
    sitemap: "https://www.samyabysamishtha.com/sitemap.xml",
  };
}
