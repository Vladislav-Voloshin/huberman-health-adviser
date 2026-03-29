import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/profile/", "/onboarding/"],
    },
    sitemap: "https://craftwell.vercel.app/sitemap.xml",
  };
}
