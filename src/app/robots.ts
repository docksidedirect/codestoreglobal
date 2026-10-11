import { MetadataRoute } from "next";

// Canonical host — must match sitemap.ts and the page metadata exactly.
const baseUrl = "https://codestoreglobal.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Private application surfaces
          "/api/",
          "/_next/",
          "/admin/",
          "/dashboard/",
          "/settings/",
          "/chat/",
          "/forum/",
          // Account screens: no crawl value, and they set cookies
          "/login",
          "/register",
          "/forgot-password",
          "/invite/",
        ],
        // Rationale for what is NOT here:
        //  - "/*.xml$"  -> it blocked sitemap.xml from the crawlers the file
        //                  exists for.
        //  - "/*.json$" -> not a real crawler concern here and it clipped
        //                  legitimate asset paths.
        //  - the hand-maintained /en/, /ar/courses, ... allow list. `allow: "/"`
        //    already covers public pages; enumerating locales by hand only
        //    guarantees the list goes stale when a locale is added.
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}