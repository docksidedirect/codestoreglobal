import { Metadata } from "next";

interface OpenGraphConfig {
  title: string;
  description: string;
  url: string;
  locale: string;
  image?: string;
  type?: "website" | "article";
}

export function generateOpenGraph(config: OpenGraphConfig): Metadata {
  const { title, description, url, locale, image, type = "website" } = config;

  const localeMap: Record<string, string> = {
    en: "en_US",
    ar: "ar_SA",
    fr: "fr_FR",
    de: "de_DE",
    es: "es_ES",
  };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "CODESTORE GLOBAL",
      locale: localeMap[locale] || "en_US",
      type,
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: title }]
        : [{ url: "https://codestore.global/og-default.jpg", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : ["https://codestore.global/og-default.jpg"],
      creator: "@codestoreglobal",
    },
    alternates: {
      canonical: url,
      languages: {
        "en-US": url.replace(`/${locale}`, "/en"),
        "ar-SA": url.replace(`/${locale}`, "/ar"),
        "fr-FR": url.replace(`/${locale}`, "/fr"),
        "de-DE": url.replace(`/${locale}`, "/de"),
        "es-ES": url.replace(`/${locale}`, "/es"),
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
