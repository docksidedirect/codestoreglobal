import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const locales = ["en", "ar", "fr", "de", "es"];
const baseUrl = "https://codestore.global";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, products, jobs] = await Promise.all([
    prisma.course.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.jobListing.findMany({ where: { status: "OPEN" }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes = [
    "", "/courses", "/marketplace", "/login", "/register",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static routes for each locale
  for (const locale of locales) {
    for (const route of staticRoutes) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : 0.8,
      });
    }
  }

  // Dynamic course pages
  for (const course of courses) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/courses/${course.slug}`,
        lastModified: course.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // Dynamic product pages
  for (const product of products) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/marketplace/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // Dynamic job pages
  for (const job of jobs) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/jobs/${job.slug}`,
        lastModified: job.updatedAt,
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
  }

  return sitemapEntries;
}
