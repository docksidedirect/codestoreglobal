#!/usr/bin/env node
/**
 * capture-shots.cjs — captures the four landing-page screenshots.
 *
 * Pure browser automation against a dev server you are already running. It never
 * touches the database and never writes outside public/screenshots/.
 *
 * ---------------------------------------------------------------- setup
 *   cd "F:\New app to test\Zipped NEW\codestoreglobal"
 *   npm install -D playwright
 *   npx playwright install chromium
 *
 * ---------------------------------------------------------------- run
 *   npx next dev                     (in one terminal, leave it running)
 *
 *   # in a second terminal, from the project root:
 *   $env:BASE_URL="http://localhost:3000"
 *   $env:TENANT_SLUG="demo"
 *   node capture-shots.cjs
 *
 * All three of BASE_URL, TENANT_SLUG and LOCALE can also be passed as flags:
 *   node capture-shots.cjs --tenant demo --url http://localhost:3000
 *
 * Flags:
 *   --tenant <slug>   workspace slug for Shots 1-3   (env TENANT_SLUG)
 *   --url <origin>    dev server origin              (env BASE_URL)
 *   --locale <l>      en | ar | fr | de | es         (env LOCALE, default en)
 *   --headless        run without a visible window   (default: visible)
 *   --keep-open       pause before closing, for inspection
 *
 * Output: public/screenshots/{01-workspace-products,02-product-version-changelog,
 *         03-invite-members,04-purchase-record}.png at 1512x860.
 *
 * Selectors were read out of the actual source, not guessed:
 *   login      src/app/[locale]/(auth)/login/page.tsx   -> #email, #password,
 *                                                           button[type=submit]
 *   products   src/app/[locale]/[tenantId]/products/page.tsx
 *   members    src/app/[locale]/[tenantId]/settings/members/page.tsx
 *   earnings   src/components/admin/admin-dashboard.tsx  -> tab "earnings",
 *              table columns Date | Type | Amount | Platform Fee | Buyer | Status
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

/* ------------------------------------------------------------------ config */

const argv = process.argv.slice(2);
const argOf = (name, envName, fallback) => {
  const i = argv.indexOf(`--${name}`);
  if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--"))
    return argv[i + 1];
  return process.env[envName] || fallback;
};
const has = (name) => argv.includes(`--${name}`);

const BASE_URL = argOf("url", "BASE_URL", "http://localhost:3000").replace(
  /\/+$/,
  "",
);
const TENANT_SLUG = argOf("tenant", "TENANT_SLUG", null);
const LOCALE = argOf("locale", "LOCALE", "en");
const HEADLESS = has("headless");
const KEEP_OPEN = has("keep-open");

const VIEWPORT = { width: 1512, height: 860 };

const ACCOUNTS = {
  tenantAdmin: {
    email: "admin@demo.codestoreglobal.io",
    password: "TenantAdmin2024!",
  },
  superAdmin: {
    email: "superadmin@codestoreglobal.io",
    password: "SuperAdmin2024!",
  },
};

// The four filenames the landing page expects, in order.
const FILENAMES = [
  "01-workspace-products.png",
  "02-product-version-changelog.png",
  "03-invite-members.png",
  "04-admin-workspaces.png",
];

const OUT_DIR = path.join(process.cwd(), "public", "screenshots");

/* ------------------------------------------------------------------ helpers */

const log = (...a) => console.log(...a);
const fail = (msg) => {
  console.error("\n[FAIL] " + msg + "\n");
  process.exitCode = 1;
};

function requirePlaywright() {
  try {
    return require("playwright");
  } catch {
    fail(
      "playwright is not installed in this project.\n" +
        "  npm install -D playwright\n" +
        "  npx playwright install chromium",
    );
    return null;
  }
}

/** Resolves once the app has stopped mutating the DOM for a moment. */
async function settle(page, ms = 1200) {
  await page
    .waitForLoadState("networkidle", { timeout: 20000 })
    .catch(() => {});
  await page.waitForTimeout(ms);
}

/**
 * Waits for the dev-mode overlay and the Next.js dev indicator to go away, so
 * neither ends up in the PNG.
 */
async function hideDevChrome(page) {
  await page
    .addStyleTag({
      content: `
        nextjs-portal, #next-logo, [data-nextjs-toast],
        [data-nextjs-dialog-overlay], [data-nextjs-dev-tools-button] {
          display: none !important;
          visibility: hidden !important;
        }
      `,
    })
    .catch(() => {});
}

/** Logs in through the real UI and waits for the post-login hard redirect. */
async function login(page, account, label) {
  log(`  signing in as ${label}`);
  await page.goto(`${BASE_URL}/${LOCALE}/login`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("#email").waitFor({ state: "visible", timeout: 20000 });
  await page.fill("#email", account.email);
  await page.fill("#password", account.password);
  await Promise.all([
    page
      .waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 })
      .catch(() => {}),
    page.locator('button[type="submit"]').first().click(),
  ]);
  await settle(page, 800);

  const url = page.url();
  if (url.includes("/login")) {
    throw new Error(
      `still on /login after submitting — check the credentials for ${account.email}`,
    );
  }
  log(`    -> ${url}`);
  return url;
}

/** Captures the viewport at exactly 1512x860 and returns the written path. */
async function capture(page, filename) {
  const file = path.join(OUT_DIR, filename);
  await page.screenshot({
    path: file,
    type: "png",
    clip: { x: 0, y: 0, ...VIEWPORT },
    animations: "disabled",
  });
  const { size } = fs.statSync(file);
  log(`  wrote ${filename}  (${(size / 1024).toFixed(0)} KB)`);
  return file;
}

/* ------------------------------------------------------------------ main */

(async () => {
  // Dependency check first: telling someone their tenant slug is missing when
  // they have not installed playwright yet sends them down the wrong path.
  const playwright = requirePlaywright();
  if (!playwright) return;

  if (!TENANT_SLUG) {
    fail(
      "TENANT_SLUG is required, because Shots 1-3 live under /{locale}/{tenantId}/...\n" +
        '  $env:TENANT_SLUG="demo"\n' +
        "  node capture-shots.cjs\n\n" +
        "Not sure of the slug? Open your workspace in the browser and read it out of\n" +
        "the address bar: /en/<slug>/dashboard",
    );
    return;
  }

  // Fail fast with a clear message if the dev server isn't up.
  try {
    const res = await fetch(`${BASE_URL}/${LOCALE}`, { redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    fail(
      `cannot reach ${BASE_URL}/${LOCALE} — is "npx next dev" running?\n` +
        `  ${e && e.message ? e.message : e}`,
    );
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  log(`\nCapture plan`);
  log(`  base   : ${BASE_URL}`);
  log(`  tenant : ${TENANT_SLUG}`);
  log(`  locale : ${LOCALE}`);
  log(`  output : ${OUT_DIR}`);
  log(`  mode   : ${HEADLESS ? "headless" : "visible"}\n`);

  const { chromium } = playwright;
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1, // exactly 1512x860, no retina doubling
    colorScheme: "light", // one theme for all four
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  const written = [];

  try {
    /* ---------------------------------------------- Shot 1: workspace products */
    await login(page, ACCOUNTS.tenantAdmin, "tenant admin");
    await hideDevChrome(page);

    const productsUrl = `${BASE_URL}/${LOCALE}/${TENANT_SLUG}/products`;
    log(`\n  Shot 1 — ${productsUrl}`);
    await page.goto(productsUrl, { waitUntil: "domcontentloaded" });
    await settle(page, 2200); // this page fetches from the API after mount

    const productLinks = await page
      .locator(`a[href*="/${TENANT_SLUG}/products/"]`)
      .evaluateAll((els) =>
        els
          .map((el) => el.getAttribute("href") || "")
          .filter((h) => !h.endsWith("/new") && !h.includes("/edit")),
      );
    log(`    product links found: ${productLinks.length}`);
    if (!productLinks.length) {
      log(
        "    WARNING: no products in this workspace — the frame will look empty.",
      );
    }
    written.push(await capture(page, FILENAMES[0]));

    /* ------------------------------------ Shot 2: product detail (version + log) */
    log(`\n  Shot 2 — product detail`);
    if (productLinks.length) {
      const href = productLinks[0];
      await page.goto(new URL(href, BASE_URL).toString(), {
        waitUntil: "domcontentloaded",
      });
      await settle(page, 1500);
      written.push(await capture(page, FILENAMES[1]));
    } else {
      log("    SKIPPED — no product to open, so no version/changelog to show.");
      log("    Add a product with a changelog, then re-run.");
    }

    /* ------------------------------------------------- Shot 3: members + invites */
    const membersUrl = `${BASE_URL}/${LOCALE}/${TENANT_SLUG}/settings/members`;
    log(`\n  Shot 3 — ${membersUrl}`);
    await page.goto(membersUrl, { waitUntil: "domcontentloaded" });
    await settle(page, 2000);
    written.push(await capture(page, FILENAMES[2]));

    /* ------------------------------------------------ Shot 4: admin, redacted */
    const adminUrl = `${BASE_URL}/${LOCALE}/admin`;
    log(`\n  Shot 4 — ${adminUrl}`);
    await context.clearCookies(); // swap identity to SUPERADMIN
    await login(page, ACCOUNTS.superAdmin, "super admin");
    await hideDevChrome(page);

    await page.goto(adminUrl, { waitUntil: "domcontentloaded" });
    await settle(page, 1500);

    // Shot 4 now shows the admin Overview / Workspaces screen (the earnings
    // ledger is empty, so the landing page step 4 was rewritten around this).
    const workspacesTab = page
      .locator("button", { hasText: /Workspaces/ })
      .first();
    if (await workspacesTab.count()) {
      await workspacesTab.click();
      await settle(page, 2500);
    } else {
      log(
        '    WARNING: no "Workspaces" tab found — capturing the default tab instead.',
      );
    }

    /*
     * Redaction.
     *
     * There is deliberately no PayPal capture-id column in this table. Its
     * columns are: Date | Type | Amount | Platform Fee | Buyer | Status.
     * Currency amounts are the commercial detail we agreed not to publish, and
     * the Buyer column is a real customer's email address, so both are covered
     * with flat grey boxes. Everything that supports the landing-page claim —
     * order ids, transaction types, statuses, the ledger itself — stays visible.
     *
     * The boxes are real elements appended to the DOM, so they are baked into the
     * PNG pixels by page.screenshot(). Nothing is drawn after capture.
     */
    const redaction = await page.evaluate(() => {
      // Find the transaction table by its header row.
      const wanted = ["amount", "platform fee", "buyer"];
      const tables = [...document.querySelectorAll("table")];
      let target = null;
      let headIndexes = [];

      for (const table of tables) {
        const heads = [...table.querySelectorAll("thead th")].map((th) =>
          (th.textContent || "").trim().toLowerCase(),
        );
        const idx = wanted
          .map((w) => heads.findIndex((h) => h === w))
          .filter((i) => i >= 0);
        if (idx.length === wanted.length) {
          target = table;
          headIndexes = wanted.map((w) => heads.findIndex((h) => h === w));
          break;
        }
      }
      if (!target)
        return {
          ok: false,
          reason: "transaction table not found (or no headers matched)",
        };

      let boxes = 0;
      const draw = (cell) => {
        const r = cell.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        const box = document.createElement("span");
        box.setAttribute("data-redaction", "1");
        box.style.cssText = [
          "position:fixed",
          `left:${Math.floor(r.left)}px`,
          `top:${Math.floor(r.top)}px`,
          `width:${Math.ceil(r.width)}px`,
          `height:${Math.ceil(r.height)}px`,
          "background:#9ca3af",
          "border-radius:2px",
          "z-index:2147483647",
          "pointer-events:none",
        ].join(";");
        document.body.appendChild(box);
        boxes++;
      };

      for (const tr of target.querySelectorAll("tbody tr")) {
        const cells = tr.querySelectorAll("td");
        if (cells.length === 1) continue; // the "No transactions yet" colspan row
        for (const i of headIndexes) if (cells[i]) draw(cells[i]);
      }

      const rows = target.querySelectorAll("tbody tr").length;
      const heads = [...target.querySelectorAll("thead th")].map((th) =>
        th.textContent.trim(),
      );
      return { ok: true, rows, heads, boxes };
    });

    if (redaction.ok) {
      log(`    table columns: ${JSON.stringify(redaction.heads)}`);
      log(`    rows: ${redaction.rows}, grey boxes drawn: ${redaction.boxes}`);
      if (redaction.rows <= 1) {
        log(
          "    WARNING: no transaction rows — the ledger is empty, so this shot",
        );
        log(
          "             shows an empty state rather than the purchase record.",
        );
      }
    } else {
      log(`    WARNING: redaction could not run — ${redaction.reason}`);
      log(
        "             Re-run with --keep-open and redact Shot 4 by hand before publishing.",
      );
    }
    await page.waitForTimeout(400); // let the boxes paint
    written.push(await capture(page, FILENAMES[3]));

    if (KEEP_OPEN) {
      log("\n  --keep-open: leaving the browser open. Press Enter to close.");
      await new Promise((r) => process.stdin.once("data", r));
    }
  } catch (e) {
    fail(e && e.message ? e.message : String(e));
  } finally {
    await browser.close().catch(() => {});
  }

  /* ------------------------------------------------------------------ report */
  log("\n" + "-".repeat(64));
  const expected = FILENAMES.map((f) => path.join(OUT_DIR, f));
  const missing = expected.filter((f) => !fs.existsSync(f));

  if (missing.length === 0) {
    log("DONE");
    for (const f of expected) {
      const kb = (fs.statSync(f).size / 1024).toFixed(0);
      log(`  ${f}  (${kb} KB)`);
    }
    log("-".repeat(64));
    log(
      "\nNext: review the four PNGs, then hand them back. `available: true` gets",
    );
    log(
      "set in src/app/[locale]/(public)/page.tsx, along with the real tenant slug",
    );
    log(
      `in each \`chrome\` caption (currently "yourteam" -> use "${TENANT_SLUG}").\n`,
    );
  } else {
    log(`INCOMPLETE — ${missing.length} of 4 not written:`);
    for (const f of missing) log(`  MISSING ${f}`);
    log("-".repeat(64) + "\n");
    process.exitCode = 1;
  }
})();
