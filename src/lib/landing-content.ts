/**
 * Landing page content config.
 *
 * Lives outside page.tsx on purpose: Next.js only allows `default`,
 * `metadata`, `generateMetadata`, `revalidate` and friends to be exported from a
 * route file, so exporting STEPS from there fails the build with a type error.
 */

export type Shot = {
  /**
   * Set false if you cannot produce this screenshot. The step is then not
   * rendered at all — no illustration is ever substituted for a real screen.
   */
  available: boolean;
  href: string;
  /** i18n key suffix: step1..step4, resolved against landingV2.how */
  key: string;
};

/**
 * Screenshots: real UI, 1600x1000, no browser chrome, consistent theme.
 * Capture instructions for each are in SCREENSHOTS.md.
 */
export const STEPS: Shot[] = [
  { available: true, href: "/screenshots/01-workspace-products.png", key: "step1" },
  { available: true, href: "/screenshots/02-product-version-changelog.png", key: "step2" },
  { available: true, href: "/screenshots/03-invite-members.png", key: "step3" },
  { available: true, href: "/screenshots/04-purchase-record.png", key: "step4" },
];

export const VISIBLE_STEPS = STEPS.filter((s) => s.available);

/**
 * Assembled from real commits on main, not written to sound good. If an entry
 * does not trace to shipped work, delete it rather than improving the wording.
 *   v2.0  2026-10-04/05 — marketplace/workspace UI rebuild, admin earnings,
 *                         PayPal capture fixes
 *   v1.4  2026-08/09    — tenant storefronts, subdomain isolation, invites
 *   v1.3  2026-08-21    — escrow jobs board, budget ranges, applications
 *   v1.2  2026-10-04    — admin earnings view off raw transaction tables
 *   v1.1  2026-08-21    — product CRUD, version and changelog fields
 *
 * These stay in English: a changelog is a record of what shipped, in the
 * language it shipped in.
 */
export const CHANGELOG = [
  {
    version: "v2.0",
    body: "Rebuilt marketplace and workspace UI; admin earnings reconciliation; PayPal capture fixes on the checkout path.",
  },
  {
    version: "v1.4",
    body: "Multi-tenant storefronts: subdomain isolation, workspace membership, pending-approval to active lifecycle.",
  },
  {
    version: "v1.3",
    body: "Escrow jobs board: budget ranges, applications, escrow amount and release flag, 10% platform commission of record.",
  },
  {
    version: "v1.2",
    body: "Admin earnings view built off raw transaction tables: order id, capture id, platform fee, seller payout.",
  },
  {
    version: "v1.1",
    body: "Component marketplace: product CRUD, version and changelog fields per product, image uploads, detail pages.",
  },
];

/**
 * Feature names are product nouns, so they stay in English across locales —
 * translating "escrow" into six variants of the same noun helps nobody.
 */
export const INCLUDED = [
  "Private, gated storefront for your team",
  "Unlimited internal components",
  "Third-party kits you are licensed for, listed alongside your own",
  "Version and changelog field on every product",
  "Email invites with expiring tokens, tenant admin and member roles",
  "Escrow jobs board with 10% commission per completed job",
  "Purchase records: order id, platform fee, seller payout, per workspace",
  "PayPal checkout",
  "English, Arabic, French, German, Spanish — Arabic is RTL",
  "Self-hosted: Next.js + MySQL + Prisma, no per-seat math",
];

/** Two steps (workspace, members) also need this flag in the fallback copy. */
export const PAIN_KEYS = ["pain1", "pain2", "pain3"] as const;
