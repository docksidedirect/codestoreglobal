import { MetadataRoute } from "next";

// TODO: confirm the canonical host (see sitemap.ts).
const baseUrl = "https://codestore.global";

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
