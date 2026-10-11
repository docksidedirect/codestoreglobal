/**
 * Structured data. Rendered on the server so crawlers see it in the initial
 * HTML, not after hydration.
 *
 * Deliberately absent: aggregateRating. There are no real reviews yet, and a
 * fabricated rating is the fastest way to lose the trust the rest of the page
 * is built to earn. Add it back only when reviews exist in the database.
 */

const SITE = "https://codestore.global";

function JsonLd({ id, data }: { id: string; data: Record<string, unknown> }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // Escaping "<" prevents a "</script>" sequence inside a string value
      // from closing the tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

interface LandingStructuredDataProps {
  locale: string;
  /** Real version from package.json. */
  version: string;
  /** Real monthly price per workspace, in USD. */
  price: number;
  repoUrl: string;
}

export function LandingStructuredData({
  locale,
  version,
  price,
  repoUrl,
}: LandingStructuredDataProps) {
  const url = `${SITE}/${locale}`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE}#organization`,
    name: "CodeStore",
    legalName: "CODESTORE GLOBAL", // TODO: replace with the registered legal entity name.
    url: SITE,
    logo: `${SITE}/favicon.png`,
    description:
      "A private component store for dev teams: a workspace-gated storefront for internal components and licensed third-party kits, with per-workspace licensing and purchase records.",
    email: "support@codestore.global", // TODO: confirm this mailbox is monitored.
    // TODO: keep only profiles that are real and active. A dead social link is
    // a template signal, and sameAs to a nonexistent account is worse.
    sameAs: [
      repoUrl,
      "https://twitter.com/codestoreglobal",
      "https://linkedin.com/company/codestoreglobal",
    ],
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name: "CodeStore",
    alternateName: "CodeStore — private component store",
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Component registry",
    operatingSystem: "Web, self-hosted (Node.js, MySQL)",
    softwareVersion: version,
    url,
    description:
      "CodeStore is a workspace-gated component store for dev teams. Deploy it, and your team gets a private storefront for internal components and licensed third-party kits, with purchases recorded per workspace.",
    publisher: { "@id": `${SITE}#organization` },
    codeRepository: repoUrl,
    softwareHelp: `${SITE}/${locale}#how-it-works`,
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${url}#pricing`,
      // No priceValidUntil: this is not a promotional price, and a fake
      // expiry date is the same lie as a fake countdown.
      description: `Per workspace, per month. Unlimited members on a workspace. Self-hosted.`,
    },
    // Shipped, verifiable features only.
    featureList: [
      "Private, gated component storefront per workspace",
      "Internal components and licensed third-party kits in one catalog",
      "Per-workspace purchase records with order id, platform fee, and seller payout",
      "Version and changelog field on every product",
      "Email invites with expiring tokens and tenant admin or member roles",
      "Escrow jobs board with 10% commission per completed job",
      "PayPal checkout",
      "Subdomain-isolated workspaces on Next.js, MySQL, and Prisma",
      "English, Arabic, French, German, and Spanish, with RTL layouts",
    ],
  };

  return (
    <>
      <JsonLd id="ld-organization" data={organization} />
      <JsonLd id="ld-software" data={software} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Kept for the other pages that already import these.                        */
/* -------------------------------------------------------------------------- */

interface StructuredDataProps {
  type:
    | "WebSite"
    | "WebPage"
    | "Organization"
    | "Product"
    | "Course"
    | "JobPosting"
    | "BreadcrumbList"
    | "FAQPage";
  data: Record<string, any>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  return (
    <JsonLd
      id={`structured-data-${type}`}
      data={{ "@context": "https://schema.org", "@type": type, ...data }}
    />
  );
}

export function OrganizationSchema() {
  return (
    <StructuredData
      type="Organization"
      data={{
        name: "CODESTORE GLOBAL",
        url: SITE,
        logo: `${SITE}/favicon.png`,
        description:
          "A private component store for dev teams: a workspace-gated storefront for internal components and licensed third-party kits.",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "support@codestore.global",
        },
      }}
    />
  );
}

export function WebSiteSchema() {
  return (
    <StructuredData
      type="WebSite"
      data={{
        "@id": `${SITE}#website`,
        name: "CodeStore",
        url: SITE,
        publisher: { "@id": `${SITE}#organization` },
        inLanguage: ["en", "ar", "fr", "de", "es"],
        // No potentialAction/SearchAction: there is no /search route in the app.
        // Declaring one that 404s is worse than declaring nothing.
      }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
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
