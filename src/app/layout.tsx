import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://codestoreglobal.com"),
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
  authors: [{ name: "CODESTORE GLOBAL", url: "https://codestoreglobal.com" }],
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
    url: "https://codestoreglobal.com",
    siteName: "CODESTORE GLOBAL",
    title: "CODESTORE GLOBAL - Multi-Tenant Developer Platform",
    description:
      "Host secure sub-workspaces, publish technical courses, trade SaaS components, and run an escrowed job marketplace.",
    images: [
      {
        url: "https://codestoreglobal.com/og-default.jpg",
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
    images: ["https://codestoreglobal.com/og-default.jpg"],
    creator: "@codestoreglobal",
  },
  alternates: {
    canonical: "https://codestoreglobal.com",
    languages: {
      "en-US": "https://codestoreglobal.com/en",
      "ar-SA": "https://codestoreglobal.com/ar",
      "fr-FR": "https://codestoreglobal.com/fr",
      "de-DE": "https://codestoreglobal.com/de",
      "es-ES": "https://codestoreglobal.com/es",
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
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
