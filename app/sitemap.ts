import { MetadataRoute } from "next";

const BASE_URL = "https://www.learnagentarchitecture.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const domainIds = [1, 2, 3, 4, 5, 6, 7, 8];

  const domainPages = domainIds.map((id) => ({
    url: `${BASE_URL}/domain/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const practicePages = domainIds.map((id) => ({
    url: `${BASE_URL}/domain/${id}/practice`,
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
