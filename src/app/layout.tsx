import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { WebSiteSchema } from "@/components/seo/structured-data";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// TODO: confirm the canonical host. This file, sitemap.ts and robots.ts now all
// say codestore.global; the old landing breadcrumb said codestoreglobal.com.
const SITE = "https://codestore.global";

const DEFAULT_TITLE = "CodeStore — Private Component Store for Dev Teams";
const DEFAULT_DESCRIPTION =
  "Your team's components live in Slack threads. CodeStore is a private storefront for internal and licensed kits, with purchases on the record.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: DEFAULT_TITLE,
    template: "%s — CodeStore",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: "CodeStore",
  // The keyword list was removed on purpose. It was a 17-item block of
  // near-synonyms ("developer platform", "developer tools", "developer
  // community") that Google has ignored since 2009, and it is one of the
  // clearest signals that a page was generated rather than written.
  authors: [{ name: "CodeStore", url: SITE }],
  creator: "CodeStore",
  publisher: "CodeStore",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE,
    siteName: "CodeStore",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    // TODO: real screenshot, 1200x630. Not a generated gradient card.
    images: [
      {
        url: `${SITE}/og-codestore.png`,
        width: 1200,
        height: 630,
        alt: "CodeStore workspace dashboard showing a private component store and member invites",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [`${SITE}/og-codestore.png`],
    creator: "@codestoreglobal", // TODO: delete if this handle is not real.
  },
  alternates: {
    canonical: `${SITE}/en`,
    languages: {
      "en-US": `${SITE}/en`,
      "ar-EG": `${SITE}/ar`,
      "fr-FR": `${SITE}/fr`,
      "de-DE": `${SITE}/de`,
      "es-ES": `${SITE}/es`,
      "x-default": `${SITE}/en`,
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
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "180x180" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon-32x32.png",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <WebSiteSchema />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
