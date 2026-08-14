import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://codestore.global"),
  title: {
    default: "CODESTORE GLOBAL - Multi-Tenant Developer Platform",
    template: "%s | CODESTORE GLOBAL",
  },
  description: "Host secure sub-workspaces, publish technical courses, trade SaaS components, and run an escrowed job marketplace. The complete platform for modern developers.",
  keywords: [
    "developer platform", "multi-tenant", "SaaS marketplace", "code marketplace",
    "developer courses", "freelance jobs", "escrow payments", "web components",
    "Next.js", "Prisma", "TypeScript", "developer community", "programming courses",
    "code templates", "API services", "developer tools", "tenant isolation",
  ],
  authors: [{ name: "CODESTORE GLOBAL", url: "https://codestore.global" }],
  creator: "CODESTORE GLOBAL",
  publisher: "CODESTORE GLOBAL",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://codestore.global",
    siteName: "CODESTORE GLOBAL",
    title: "CODESTORE GLOBAL - Multi-Tenant Developer Platform",
    description: "Host secure sub-workspaces, publish technical courses, trade SaaS components, and run an escrowed job marketplace.",
    images: [
      {
        url: "https://codestore.global/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "CODESTORE GLOBAL - Developer Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CODESTORE GLOBAL - Multi-Tenant Developer Platform",
    description: "Host secure sub-workspaces, publish technical courses, trade SaaS components, and run an escrowed job marketplace.",
    images: ["https://codestore.global/og-default.jpg"],
    creator: "@codestoreglobal",
  },
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE",
    yandex: "YOUR_YANDEX_VERIFICATION_CODE",
  },
  alternates: {
    canonical: "https://codestore.global",
    languages: {
      "en-US": "https://codestore.global/en",
      "ar-SA": "https://codestore.global/ar",
      "fr-FR": "https://codestore.global/fr",
      "de-DE": "https://codestore.global/de",
      "es-ES": "https://codestore.global/es",
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", url: "/favicon-16x16.png" },
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
  manifest: "/site.webmanifest",
  category: "technology",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
