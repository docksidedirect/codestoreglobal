export const dynamic = "force-dynamic";
export const revalidate = 0;

import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { locales, MARKETPLACE_CATEGORIES } from "@/lib/marketplace-categories";

// Canonical host: codestoreglobal.com (apex). The www host should redirect
// here; if it does not, fix that at the DNS/host level, not in this file.
const baseUrl = "https://codestoreglobal.com";

/**
 * The landing page's real last-modified date. Do not stamp `new Date()` on
 * static pages: telling crawlers every page changed today, every day, is how
 * you teach them to ignore your lastmod values. Bump this when the landing
 * copy actually changes.
 */
const LANDING_LAST_MODIFIED = new Date("2026-10-11");

const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  lastModified: Date;
}[] = [
  {
    path: "",
    changeFrequency: "weekly",
    priority: 1.0,
    lastModified: LANDING_LAST_MODIFIED,
  },
  { path: "/courses", changeFrequency: "weekly", priority: 0.8, lastModified: LANDING_LAST_MODIFIED },
  { path: "/marketplace", changeFrequency: "weekly", priority: 0.8, lastModified: LANDING_LAST_MODIFIED },
  { path: "/jobs", changeFrequency: "weekly", priority: 0.8, lastModified: LANDING_LAST_MODIFIED },
  // /login and /register are deliberately absent. They are noindex account
  // screens, and robots.ts disallows them — listing them here was a contradiction.
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static routes for each locale. These never depend on the database, so the
  // sitemap always returns a valid 200 even if the DB is unreachable — a
  // sitemap that 500s gets dropped by Search Console ("couldn't fetch").
  for (const locale of locales) {
    for (const route of STATIC_ROUTES) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route.path}`,
        lastModified: route.lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }
  }

  // Dynamic URLs from the database. Wrapped so a DB failure degrades to the
  // static sitemap above instead of killing the whole file.
  let courses: { slug: string; updatedAt: Date }[] = [];
  let products: { slug: string; updatedAt: Date }[] = [];
  let jobs: { slug: string; updatedAt: Date }[] = [];
  try {
    [courses, products, jobs] = await Promise.all([
      prisma.course.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
      prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.jobListing.findMany({ where: { status: "OPEN" }, select: { slug: true, updatedAt: true } }),
    ]);
  } catch (error) {
    console.error("[sitemap] database query failed; serving static URLs only", error);
  }

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

  // One category page per locale, each rendering that category's real products.
  // These are only legitimate while the pages contain distinct content — the
  // moment they become the same list with a swapped heading, they are doorway
  // pages and should be removed rather than resubmitted.
  for (const category of MARKETPLACE_CATEGORIES) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/marketplace/category/${category.slug}`,
        lastModified: LANDING_LAST_MODIFIED,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return sitemapEntries;
}