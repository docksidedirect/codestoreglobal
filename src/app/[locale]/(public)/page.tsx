import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingStructuredData } from "@/components/seo/structured-data";
import { CHANGELOG } from "@/lib/landing-content";
import { ScreenshotSlot } from "@/components/screenshot-slot";

/* -------------------------------------------------------------------------- */
/*  Option D — professional B2B.                                                */
/*                                                                            */
/*  Design rules, so this does not drift back into template territory:         */
/*    - one accent colour, used only on the words naming the category and the   */
/*      check glyphs. Nothing else is coloured.                                */
/*    - hairline rules do all the dividing. No shadows, no rounded-2xl, no      */
/*      gradients, no blur, no glow, no pill badges, no browser-chrome frames.  */
/*    - monospace is used for data (versions, field names, specs), never as     */
/*      decoration.                                                            */
/*    - no card has an icon in a tinted rounded square.                         */
/*    - section backgrounds alternate white / #f7f7f8 for rhythm only.          */
/* -------------------------------------------------------------------------- */

const SITE = "https://codestore.global";
const APP_VERSION = "2.0.0";
const REPO_URL = "https://github.com/docksidedirect/codestoreglobal";

// Both null because neither page exists in the repo yet, and a link to a 404 is
// the same trust problem as a fake stat. The links are wired and appear the
// moment a URL is set.
const CHANGELOG_URL: string | null = null;
const DOCS_URL: string | null = null;

// TODO: confirm the price and the seat policy before publishing.
const PRICE_PER_WORKSPACE_MONTH = 49;

// Real commit count on main as of this pass. Keep it true or delete the item.
const COMMITS_ON_MAIN = 90;

const FALLBACK_TITLE = "CodeStore — Private Component Store for Dev Teams";
const FALLBACK_DESCRIPTION =
  "Your team's components live in Slack threads. CodeStore is a private storefront for internal and licensed kits, with purchases on the record.";

// Screenshots: 1512x860 (16:9-ish laptop viewport), real UI, consistent theme.
// Capture instructions live in SCREENSHOTS.md. `available: false` removes a step
// entirely — an illustration is never substituted for a real screen.
const SHOTS = [
  { key: "s1", available: false, chrome: "yourteam.codestore.global/products" },
  { key: "s2", available: false, chrome: "yourteam.codestore.global/products/design-tokens" },
  { key: "s3", available: false, chrome: "yourteam.codestore.global/settings/members" },
  { key: "s4", available: false, chrome: "codestore.global/admin" },
];
const SHOT_PATH: Record<string, string> = {
  s1: "/screenshots/01-workspace-products.png",
  s2: "/screenshots/02-product-version-changelog.png",
  s3: "/screenshots/03-invite-members.png",
  s4: "/screenshots/04-purchase-record.png",
};

const METRICS = ["m1", "m2", "m3"] as const;
const FEATURE_KEYS = ["f1", "f2", "f3", "f4", "f5", "f6"] as const;
const SPEC_KEYS = ["runtime", "database", "payments", "node"] as const;
const PRICE_ROWS = ["members", "components", "commission", "hosting"] as const;
const INCLUDED_KEYS = ["i1", "i2", "i3", "i4", "i5", "i6", "i7", "i8", "i9"] as const;

/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale });
  const title = t.has("landingV2.meta.title") ? t("landingV2.meta.title") : FALLBACK_TITLE;
  const description = t.has("landingV2.meta.description")
    ? t("landingV2.meta.description")
    : FALLBACK_DESCRIPTION;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE}/en`,
      languages: {
        en: `${SITE}/en`,
        ar: `${SITE}/ar`,
        fr: `${SITE}/fr`,
        de: `${SITE}/de`,
        es: `${SITE}/es`,
        "x-default": `${SITE}/en`,
      },
    },
    openGraph: {
      type: "website",
      url: `${SITE}/${locale}`,
      siteName: "CodeStore",
      title,
      description,
      // TODO: real 1200x630 screenshot, not a generated gradient card.
      images: [
        {
          url: `${SITE}/og-codestore.png`,
          width: 1200,
          height: 630,
          alt: "CodeStore workspace products list showing internal components with versions and prices",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE}/og-codestore.png`],
      creator: "@codestoreglobal", // TODO: delete if this handle is not real.
    },
  };
}

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale });
  const signedIn = false; // server-rendered; the header owns the real session UI
  const demoHref = `/${locale}/register?intent=demo`;
  const visibleShots = SHOTS.filter((s) => s.available);
  const heroShot = visibleShots[0] ?? SHOTS[0];

  return (
    <div className="cs-theme bg-white">
      <LandingStructuredData
        locale={locale}
        version={APP_VERSION}
        price={PRICE_PER_WORKSPACE_MONTH}
        repoUrl={REPO_URL}
      />

      <main>
        {/* =============================================================== */}
        {/* HERO — headline left, product surface right. No gradient, no     */}
        {/* glow, no grid, no badge pill. Accent only on the category words. */}
        {/* =============================================================== */}
        <section className="border-b border-[var(--cs-rule)]">
          <div className="cs-wrap grid items-center gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
            <div>
              <p className="cs-label">{t("landingV2.hero.eyebrow")}</p>
              <h1 className="mt-4 text-[36px] font-semibold leading-[1.08] tracking-[-0.022em] sm:text-[46px] lg:text-[58px]">
                {t("landingV2.hero.h1Lead")}{" "}
                <span className="text-[var(--cs-accent)]">{t("landingV2.hero.h1Accent")}</span>
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-[1.65] text-[var(--cs-body)]">
                {t("landingV2.hero.body")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
                <Link href={signedIn ? `/${locale}` : demoHref}>
                  <Button className="h-auto rounded-[6px] bg-[var(--cs-ink)] px-5 py-3 text-[15px] font-medium text-white hover:bg-black">
                    {t("landingV2.hero.cta")}
                  </Button>
                </Link>
                <Link href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    className="h-auto rounded-[6px] border-[var(--cs-rule-2)] bg-white px-5 py-3 text-[15px] font-medium text-[var(--cs-ink)] hover:bg-[#f7f7f8]"
                  >
                    {t("landingV2.hero.secondary")}
                  </Button>
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-[var(--cs-body)]">
                {(["hero.assure1", "hero.assure2", "hero.assure3"] as const).map((k) => (
                  <li key={k} className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-[var(--cs-accent)]">
                      ✓
                    </span>
                    {t(`landingV2.${k}`)}
                  </li>
                ))}
              </ul>
            </div>

            {/* min-w-0 + overflow-hidden so a missing file cannot blow out the grid */}
            <div className="min-w-0 overflow-hidden rounded-[8px] border border-[var(--cs-rule-2)] bg-[#fbfbfc]">
              {heroShot.available ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={SHOT_PATH[heroShot.key]}
                  alt={t(`landingV2.screens.${heroShot.key}Alt`)}
                  width={1512}
                  height={860}
                  className="block w-full"
                />
              ) : (
                <ScreenshotSlot src={SHOT_PATH[heroShot.key]} />
              )}
              <div className="border-t border-[var(--cs-rule)] px-3.5 py-2.5">
                <span className="cs-mono text-[12px] text-[var(--cs-mid)]">{heroShot.chrome}</span>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* METRICS — the three numbers that are true. Operational, not      */}
        {/* vanity. Replaces the deleted 10K+ / 500+ / $2M+ wall.            */}
        {/* =============================================================== */}
        <section className="border-b border-[var(--cs-rule)] bg-[var(--cs-band)]">
          <div className="cs-wrap grid gap-8 py-10 sm:grid-cols-3">
            {METRICS.map((m, i) => (
              <div
                key={m}
                className={
                  i === 1
                    ? "border-[var(--cs-rule-2)] sm:border-x sm:border-[var(--cs-rule-2)] sm:px-8"
                    : undefined
                }
              >
                <div className="text-[38px] font-semibold leading-none tracking-[-0.03em]">
                  {t(`landingV2.metrics.${m}Value`)}
                </div>
                <div className="mt-2.5 text-[14px] leading-[1.6] text-[var(--cs-body)]">
                  {t(`landingV2.metrics.${m}Body`)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =============================================================== */}
        {/* PROBLEM — three numbered blocks with a heavy top rule.           */}
        {/* =============================================================== */}
        <section className="border-b border-[var(--cs-rule)]">
          <div className="cs-wrap py-16 lg:py-20">
            <h2 className="max-w-3xl text-[30px] font-semibold tracking-[-0.022em] sm:text-[34px]">
              {t("landingV2.problem.h2")}
            </h2>

            <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-3">
              {(["pain1", "pain2", "pain3"] as const).map((pain, i) => (
                <div key={pain} className="border-t-2 border-[var(--cs-ink)] pt-5">
                  <div className="cs-mono text-[13px] font-semibold">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-3 text-[17px] font-semibold">
                    {t(`landingV2.problem.${pain}Title`)}
                  </h3>
                  <p className="mt-2.5 text-[14.5px] leading-[1.65] text-[var(--cs-body)]">
                    {t(`landingV2.problem.${pain}Body`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* PRODUCT — icon + title + body, two per row. No tinted icon chips. */}
        {/* =============================================================== */}
        <section id="product" className="border-b border-[var(--cs-rule)]">
          <div className="cs-wrap py-16 lg:py-20">
            <div className="max-w-3xl">
              <p className="cs-label">{t("landingV2.features.eyebrow")}</p>
              <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.022em] sm:text-[34px]">
                {t("landingV2.features.heading")}
              </h2>
              <p className="mt-4 text-[16.5px] leading-[1.65] text-[var(--cs-body)]">
                {t("landingV2.features.subheading")}
              </p>
            </div>

            <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
              {FEATURE_KEYS.map((f) => (
                <div key={f} className="flex gap-4">
                  <span aria-hidden="true" className="mt-0.5 shrink-0 text-[15px] text-[var(--cs-accent)]">
                    ◆
                  </span>
                  <div>
                    <h3 className="text-[16.5px] font-semibold">
                      {t(`landingV2.features.${f}`)}
                    </h3>
                    <p className="mt-2 text-[14.5px] leading-[1.65] text-[var(--cs-body)]">
                      {t(`landingV2.features.${f}Desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ============================================================
                PROTECTED COPY — DO NOT REMOVE.

                "Not in the build: automatic licence-key issuance, SSO/SAML,
                SCIM, managed hosting, and a usage-based billing model."

                This line is the strongest credibility signal on the page: a
                technical buyer reads an explicit list of what does not exist as
                competence, and it costs nothing but honesty. It has been
                verified against prisma/schema.prisma — there is no LicenseKey,
                SsoConfig, SAML, SCIM, ApiKey or usage-billing model in it.

                If a future edit is tempted to delete this "because the page
                sounds incomplete without it", delete something else instead.
                ============================================================ */}
            <p className="mt-10 text-[13.5px] text-[var(--cs-faint)]">
              {t("landingV2.features.notInBuild")}
            </p>
          </div>
        </section>

        {/* =============================================================== */}
        {/* HOW IT WORKS — four real screens, alternating.                   */}
        {/* =============================================================== */}
        <section id="how" className="border-b border-[var(--cs-rule)] bg-[var(--cs-band)]">
          <div className="cs-wrap py-16 lg:py-20">
            <div className="max-w-3xl">
              <p className="cs-label">{t("landingV2.how.eyebrow")}</p>
              <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.022em] sm:text-[34px]">
                {t("landingV2.how.h2")}
              </h2>
              <p className="mt-4 text-[16.5px] leading-[1.65] text-[var(--cs-body)]">
                {t("landingV2.how.subhead")}
              </p>
            </div>

            <div className="mt-12 space-y-14">
              {visibleShots.map((shot, i) => {
                const imageFirst = i % 2 === 0;
                return (
                  <figure
                    key={shot.key}
                    className="grid items-center gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-14"
                  >
                    <div
                      className={`min-w-0 overflow-hidden rounded-[8px] border border-[var(--cs-rule-2)] bg-white ${
                        imageFirst ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-2 lg:row-start-1"
                      }`}
                    >
                      {shot.available ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={SHOT_PATH[shot.key]}
                          alt={t(`landingV2.screens.${shot.key}Alt`)}
                          width={1512}
                          height={860}
                          loading={i === 0 ? "eager" : "lazy"}
                          decoding="async"
                          className="block w-full"
                        />
                      ) : (
                        <ScreenshotSlot src={SHOT_PATH[shot.key]} />
                      )}
                      <div className="border-t border-[var(--cs-rule)] px-3.5 py-2.5">
                        <span className="cs-mono text-[12px] text-[var(--cs-mid)]">{shot.chrome}</span>
                      </div>
                    </div>
                    <figcaption
                      className={
                        imageFirst ? "lg:col-start-2 lg:row-start-1" : "lg:col-start-1 lg:row-start-1"
                      }
                    >
                      <div className="cs-mono text-[13px] font-semibold">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 className="mt-2.5 text-[19px] font-semibold">
                        {t(`landingV2.screens.${shot.key}Caption`)}
                      </h3>
                      <p className="mt-2.5 text-[14.5px] leading-[1.65] text-[var(--cs-body)]">
                        {t(`landingV2.screens.${shot.key}Body`)}
                      </p>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* DEPLOY — the install block. Commands stay in English: translating */}
        {/* a shell command would be worse than useless.                     */}
        {/* =============================================================== */}
        <section id="deploy" className="border-b border-[var(--cs-rule)]">
          <div className="cs-wrap grid gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
            <div>
              <p className="cs-label">{t("landingV2.deploy.eyebrow")}</p>
              <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.022em] sm:text-[34px]">
                {t("landingV2.deploy.h2")}
              </h2>
              <p className="mt-4 text-[16.5px] leading-[1.65] text-[var(--cs-body)]">
                {t("landingV2.deploy.body")}
              </p>
              <dl className="mt-8 text-[14.5px]">
                {SPEC_KEYS.map((k) => (
                  <div
                    key={k}
                    className="flex justify-between border-t border-[var(--cs-rule)] py-3 last:border-b"
                  >
                    <dt className="text-[var(--cs-body)]">{t(`landingV2.deploy.spec.${k}Label`)}</dt>
                    <dd className="cs-mono text-[13px]">{t(`landingV2.deploy.spec.${k}Value`)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="min-w-0">
              <pre className="overflow-x-auto rounded-[8px] border border-[var(--cs-rule)] bg-[#f8f9fa] p-4 text-[13px] leading-[1.7] text-[#1f2937]">
                <code>{`git clone ${REPO_URL}
cd codestoreglobal && npm install

# .env
DATABASE_URL="mysql://user:pass@localhost:3306/codestoreglobal"
JWT_SECRET="$(openssl rand -hex 32)"

npx prisma migrate deploy
npm run build && npm start`}</code>
              </pre>
              <p className="mt-3 text-[13px] text-[var(--cs-faint)]">
                {t("landingV2.deploy.note")}
              </p>
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* PROOF — late on purpose: with no customer logos to show, the      */}
        {/* honest v2.0 statement earns its place after the product.         */}
        {/* =============================================================== */}
        <section className="border-b border-[var(--cs-rule)] bg-[var(--cs-band)]">
          <div className="cs-wrap py-16 lg:py-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="cs-label">{t("landingV2.proof.eyebrow")}</p>
                <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.022em] sm:text-[34px]">
                  {t("landingV2.proof.h2")}
                </h2>
                <p className="mt-4 text-[16.5px] leading-[1.65] text-[var(--cs-body)]">
                  {t("landingV2.proof.body")}
                </p>

                <div className="mt-8 border-l-2 border-[var(--cs-ink)] pl-5">
                  <p className="text-[15px] leading-[1.65]">{t("landingV2.proof.note")}</p>
                  <Link href={demoHref}>
                    <Button className="mt-4 h-auto rounded-[6px] bg-[var(--cs-ink)] px-4 py-2.5 text-[14.5px] font-medium text-white hover:bg-black">
                      {t("landingV2.proof.cta")}
                    </Button>
                  </Link>
                </div>
              </div>

              <div>
                <div className="cs-label">{t("landingV2.proof.changelogHeading")}</div>
                <table className="mt-4 w-full text-left text-[14.5px]">
                  <tbody>
                    {CHANGELOG.map((entry) => (
                      <tr key={entry.version} className="border-t border-[var(--cs-rule)] last:border-b">
                        <th scope="row" className="cs-mono w-16 py-3 align-top text-[13px] font-normal">
                          {entry.version}
                        </th>
                        <td className="py-3 text-[var(--cs-body)]">{entry.body}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 text-[14px]">
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--cs-accent)] underline-offset-4 hover:underline"
                  >
                    {t("landingV2.proof.repoLink")}
                  </a>
                  {CHANGELOG_URL && (
                    <>
                      {" · "}
                      <a href={CHANGELOG_URL} className="text-[var(--cs-accent)] underline-offset-4 hover:underline">
                        {t("landingV2.proof.changelogLink")}
                      </a>
                    </>
                  )}
                  {DOCS_URL && (
                    <>
                      {" · "}
                      <a href={DOCS_URL} className="text-[var(--cs-accent)] underline-offset-4 hover:underline">
                        {t("landingV2.proof.docsLink")}
                      </a>
                    </>
                  )}
                  {" · "}
                  <a href="mailto:support@codestore.global" className="text-[var(--cs-accent)] underline-offset-4 hover:underline">
                    support@codestore.global
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* PRICING — one plan, as a bordered block with a spec table.       */}
        {/* =============================================================== */}
        <section id="pricing" className="border-b border-[var(--cs-rule)]">
          <div className="cs-wrap py-16 lg:py-20">
            <div className="max-w-3xl">
              <p className="cs-label">{t("landingV2.pricing.eyebrow")}</p>
              <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.022em] sm:text-[34px]">
                {t("landingV2.pricing.h2")}
              </h2>
              <p className="mt-4 text-[16.5px] leading-[1.65] text-[var(--cs-body)]">
                {t("landingV2.pricing.body")}
              </p>
            </div>

            <div className="mt-12 grid gap-10 rounded-[10px] border border-[var(--cs-rule-2)] p-8 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
              <div>
                <h3 className="text-[17px] font-semibold">{t("landingV2.pricing.planName")}</h3>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="text-[46px] font-semibold leading-none tracking-[-0.03em]">
                    ${PRICE_PER_WORKSPACE_MONTH}
                  </span>
                  <span className="text-[14px] text-[var(--cs-mid)]">
                    {t("landingV2.pricing.priceSuffix")}
                  </span>
                </p>
                <dl className="mt-6 text-[14px]">
                  {PRICE_ROWS.map((k) => (
                    <div
                      key={k}
                      className="flex justify-between border-t border-[var(--cs-rule)] py-2.5 last:border-b"
                    >
                      <dt className="text-[var(--cs-body)]">{t(`landingV2.pricing.row.${k}Label`)}</dt>
                      <dd>{t(`landingV2.pricing.row.${k}Value`)}</dd>
                    </div>
                  ))}
                </dl>
                <Link href={demoHref} className="mt-7 block">
                  <Button className="h-auto w-full rounded-[6px] bg-[var(--cs-ink)] px-5 py-3 text-[15px] font-medium text-white hover:bg-black">
                    {t("landingV2.pricing.cta")}
                  </Button>
                </Link>
                <p className="mt-3 text-[12.5px] text-[var(--cs-faint)]">
                  {t("landingV2.pricing.provisionNote")}
                </p>
              </div>

              <div>
                <div className="cs-label">{t("landingV2.pricing.includedHeading")}</div>
                <ul className="mt-5 grid gap-2.5 text-[14.5px] sm:grid-cols-2">
                  {INCLUDED_KEYS.map((k) => (
                    <li key={k} className="flex gap-2.5">
                      <span aria-hidden="true" className="shrink-0 text-[var(--cs-accent)]">
                        ✓
                      </span>
                      <span className="text-[var(--cs-body)]">{t(`landingV2.included.${k}`)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[13px] text-[var(--cs-faint)]">
                  {t("landingV2.pricing.footnote")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* FINAL CTA — a bordered band, not a gradient slab.                */}
        {/* =============================================================== */}
        <section className="bg-[var(--cs-band)]">
          <div className="cs-wrap grid items-center gap-8 py-14 lg:grid-cols-[1.4fr_0.6fr]">
            <div>
              <h2 className="text-[26px] font-semibold tracking-[-0.022em] sm:text-[30px]">
                {t("landingV2.finalcta.heading")}
              </h2>
              <p className="mt-3 max-w-2xl text-[15.5px] leading-[1.65] text-[var(--cs-body)]">
                {t("landingV2.finalcta.subheading")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href={demoHref}>
                <Button className="h-auto rounded-[6px] bg-[var(--cs-ink)] px-5 py-3 text-[15px] font-medium text-white hover:bg-black">
                  {t("landingV2.finalcta.primary")}
                </Button>
              </Link>
              <Link href={REPO_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="h-auto rounded-[6px] border-[var(--cs-rule-2)] bg-transparent px-5 py-3 text-[15px] font-medium text-[var(--cs-ink)] hover:bg-white"
                >
                  {t("landingV2.finalcta.secondary")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
