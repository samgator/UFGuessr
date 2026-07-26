import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://ufguessr.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms", "/game/daily", "/game/archive"],
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
