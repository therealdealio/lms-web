import { MetadataRoute } from "next";
import { domains } from "@/lib/curriculum";

const BASE_URL = "https://www.learnagentarchitecture.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const domainPages = domains.map((d) => ({
    url: `${BASE_URL}/domain/${d.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const practicePages = domains.map((d) => ({
    url: `${BASE_URL}/domain/${d.id}/practice`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/upgrade`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...domainPages,
    ...practicePages,
  ];
}
