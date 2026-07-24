import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://ufguessr.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"], // Secure admin interface and internal api routes from search indexing
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
