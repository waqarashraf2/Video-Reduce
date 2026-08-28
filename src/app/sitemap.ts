import { MetadataRoute } from "next";
import { TOOLS } from "@/config/tools";
import { ARTICLES } from "@/config/articles";
import { USE_CASES } from "@/config/use-cases";
import { FORMAT_PAIRS } from "@/config/formats";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://videoreduce.com";

  const staticRoutes = [
    "",
    "/articles",
    "/faq",
    "/contact",
    "/about",
    "/privacy-policy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const toolRoutes = TOOLS.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const articleRoutes = ARTICLES.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const useCaseRoutes = USE_CASES.map((useCase) => ({
    url: `${baseUrl}/compress/${useCase.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const formatRoutes = FORMAT_PAIRS.map((formatPair) => ({
    url: `${baseUrl}/convert/${formatPair.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [
    ...staticRoutes,
    ...toolRoutes,
    ...articleRoutes,
    ...useCaseRoutes,
    ...formatRoutes,
  ];
}
