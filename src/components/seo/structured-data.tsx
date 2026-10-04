"use client";

import Script from "next/script";

interface StructuredDataProps {
  type: "WebSite" | "WebPage" | "Organization" | "Product" | "Course" | "JobPosting" | "BreadcrumbList" | "FAQPage";
  data: Record<string, any>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationSchema() {
  return (
    <StructuredData
      type="Organization"
      data={{
        name: "CODESTORE GLOBAL",
        url: "https://codestore.global",
        logo: "https://codestore.global/logo.png",
        description: "Multi-tenant developer platform for courses, SaaS marketplace, escrow jobs, and community forums.",
        sameAs: [
          "https://twitter.com/codestoreglobal",
          "https://github.com/codestoreglobal",
          "https://linkedin.com/company/codestoreglobal",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "support@codestore.global",
        },
      }}
    />
  );
}

export function WebSiteSchema({ locale }: { locale: string }) {
  return (
    <StructuredData
      type="WebSite"
      data={{
        name: locale === "ar" ? "CODESTORE GLOBAL - منصة المطورين" : locale === "fr" ? "CODESTORE GLOBAL - Plateforme Développeurs" : locale === "de" ? "CODESTORE GLOBAL - Entwicklerplattform" : locale === "es" ? "CODESTORE GLOBAL - Plataforma de Desarrolladores" : "CODESTORE GLOBAL - Developer Platform",
        url: `https://codestore.global/${locale}`,
        potentialAction: {
          "@type": "SearchAction",
          target: `https://codestore.global/${locale}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  return (
    <StructuredData
      type="BreadcrumbList"
      data={{
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
