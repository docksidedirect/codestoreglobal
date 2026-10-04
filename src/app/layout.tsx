import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://codestore.global"),
  title: {
    default: "CODESTORE GLOBAL - Multi-Tenant Developer Platform",
    template: "%s | CODESTORE GLOBAL",
  },
  description:
    "Host secure sub-workspaces, publish technical courses, trade SaaS components, and run an escrowed job marketplace. The complete platform for modern developers.",
  keywords: [
    "developer platform",
    "multi-tenant",
    "SaaS marketplace",
    "code marketplace",
    "developer courses",
    "freelance jobs",
    "escrow payments",
    "web components",
    "Next.js",
    "Prisma",
    "TypeScript",
    "developer community",
    "programming courses",
    "code templates",
    "API services",
    "developer tools",
    "tenant isolation",
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
    description:
      "Host secure sub-workspaces, publish technical courses, trade SaaS components, and run an escrowed job marketplace.",
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
    description:
      "Host secure sub-workspaces, publish technical courses, trade SaaS components, and run an escrowed job marketplace.",
    images: ["https://codestore.global/og-default.jpg"],
    creator: "@codestoreglobal",
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
    <html
      lang="en"
      className={`${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[#0a0a0a] font-display text-neutral-200 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
