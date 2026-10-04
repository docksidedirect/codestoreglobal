import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/en/",
          "/ar/",
          "/fr/",
          "/de/",
          "/es/",
          "/en/courses",
          "/ar/courses",
          "/fr/courses",
          "/de/courses",
          "/es/courses",
          "/en/marketplace",
          "/ar/marketplace",
          "/fr/marketplace",
          "/de/marketplace",
          "/es/marketplace",
        ],
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/settings/",
          "/dashboard/",
          "/login",
          "/register",
          "/chat/",
          "/forum/",
          "/*.json$",
          "/*.xml$",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        crawlDelay: 1,
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
      },
    ],
    sitemap: "https://codestoreglobal.com/sitemap.xml",
    host: "https://codestoreglobal.com",
  };
}
