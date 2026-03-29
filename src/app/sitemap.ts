import type { MetadataRoute } from "next";

// TODO: Add dynamic protocol URLs by fetching slugs from the database
// e.g. const protocols = await getPublishedProtocols();
// then map each to { url: `https://craftwell.vercel.app/protocols/${slug}`, ... }

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://craftwell.vercel.app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: "https://craftwell.vercel.app/protocols",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://craftwell.vercel.app/chat",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://craftwell.vercel.app/privacy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://craftwell.vercel.app/terms",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
