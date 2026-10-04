"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

type SafeUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string | null;
};

const languages = [
  {
    tab: "index.html",
    name: "HTML & CSS",
    accent: "text-orange-300",
    code: [
      { t: "<!-- where it all starts -->" },
      { t: "<h1>hello, codestore</h1>" },
      { t: '<link rel="stylesheet" href="style.css">' },
    ],
  },
  {
    tab: "app.js",
    name: "JavaScript",
    accent: "text-yellow-300",
    code: [
      { t: "// the language of the web" },
      { t: 'console.log("hello, codestore");' },
    ],
  },
  {
    tab: "main.py",
    name: "Python",
    accent: "text-sky-300",
    code: [
      { t: "# data, backends, ml — pick one" },
      { t: 'print("hello, codestore")' },
    ],
  },
  {
    tab: "app.ts",
    name: "TypeScript",
    accent: "text-blue-300",
    code: [
      { t: "// types that scale with your team" },
      { t: 'type Role = "dev" | "instructor" | "client";' },
    ],
  },
  {
    tab: "schema.sql",
    name: "SQL & Databases",
    accent: "text-emerald-300",
    code: [
      { t: "-- every tenant, its own data" },
      { t: "CREATE TABLE workspaces (" },
      { t: "  id INT PRIMARY KEY" },
      { t: ");" },
    ],
  },
  {
    tab: "main.rs",
    name: "Rust",
    accent: "text-rose-300",
    code: [
      { t: "// for when performance matters" },
      { t: "fn main() {" },
      { t: '    println!("hello, codestore");' },
      { t: "}" },
    ],
  },
];

const features = [
  {
    n: "01",
    titleKey: "landing.features.tenant",
    descKey: "landing.features.tenantDesc",
  },
  {
    n: "02",
    titleKey: "landing.features.courses",
    descKey: "landing.features.coursesDesc",
  },
  {
    n: "03",
    titleKey: "landing.features.marketplace",
    descKey: "landing.features.marketplaceDesc",
  },
  {
    n: "04",
    titleKey: "landing.features.jobs",
    descKey: "landing.features.jobsDesc",
  },
  {
    n: "05",
    titleKey: "landing.features.forum",
    descKey: "landing.features.forumDesc",
  },
  {
    n: "06",
    titleKey: "landing.features.i18n",
    descKey: "landing.features.i18nDesc",
  },
];

const steps = [
  {
    cmd: "codestore signup --role developer",
    out: "✓ account created",
    titleKey: "landing.steps.step1Title",
    descKey: "landing.steps.step1Desc",
  },
  {
    cmd: "codestore workspace create acme",
    out: "✓ tenant isolated → acme.codestore.global",
    titleKey: "landing.steps.step2Title",
    descKey: "landing.steps.step2Desc",
  },
  {
    cmd: "codestore publish ./my-course",
    out: "✓ live on the marketplace",
    titleKey: "landing.steps.step3Title",
    descKey: "landing.steps.step3Desc",
  },
];

export default function LandingPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;
  const t = useTranslations();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeLang, setActiveLang] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) setUser(d.user as SafeUser);
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  const authed = !!(user && (user.role === "SUPERADMIN" || user.tenantId));
  const dashboardHref =
    user?.role === "SUPERADMIN"
      ? `/${locale}/admin`
      : user?.tenantId
        ? `/${locale}/${user.tenantId}/dashboard`
        : `/${locale}/login`;
  const primaryHref = user ? `/${locale}/marketplace` : `/${locale}/register`;
  const lang = languages[activeLang];

  return (
    <div className="noise-overlay min-h-screen bg-[#0a0a0a] text-neutral-200 antialiased">
      <main className="font-display">
        {/* ── HERO ── */}
        <section className="relative border-b border-white/10">
          <div className="mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:pb-28 lg:pt-28">
            <div>
              <p className="font-term text-sm text-amber-400">
                ~/codestore ${" "}
                <span className="text-neutral-500">v2.0 — live</span>
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-emerald-400 align-middle" />
              </p>
              <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-neutral-50 sm:text-6xl lg:text-7xl">
                {t("landing.hero.title1")}{" "}
                <span className="cursor-blink text-amber-400">
                  {t("landing.hero.title2")}
                </span>
              </h1>
              <p className="mt-7 max-w-lg text-lg leading-8 text-neutral-400">
                {t("landing.hero.subtitle")}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href={authed ? dashboardHref : primaryHref}>
                  <button className="group flex h-12 w-full items-center justify-center rounded-md bg-amber-400 px-7 font-term text-sm font-bold text-black transition-colors hover:bg-amber-300 sm:w-auto">
                    {authed
                      ? t("landing.hero.ctaDashboard")
                      : t("landing.hero.ctaPrimary")}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
                <Link href={`/${locale}/marketplace`}>
                  <button className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-white/15 px-7 font-term text-sm text-neutral-300 transition-colors hover:border-amber-400/50 hover:text-amber-300 sm:w-auto">
                    {t("landing.hero.ctaSecondary")}
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>

            {/* terminal preview — no fake numbers, just the product's real shell */}
            <div className="relative">
              <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0d0d0d] shadow-2xl">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-rose-500/70" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/70" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
                  <span className="ml-3 font-term text-xs text-neutral-500">
                    codestore — zsh
                  </span>
                </div>
                <div className="space-y-2.5 p-6 font-term text-sm leading-7">
                  <p>
                    <span className="text-amber-400">$</span> npx codestore init
                  </p>
                  <p className="text-neutral-500">
                    → multi-tenant platform · v2.0
                  </p>
                  <p className="text-emerald-400">
                    ✓ workspaces&nbsp;&nbsp;· courses · marketplace · jobs
                  </p>
                  <p className="text-emerald-400">✓ 5 locales, RTL ready</p>
                  <p className="text-emerald-400">
                    ✓ escrow payments via PayPal
                  </p>
                  <p>
                    <span className="text-amber-400">$</span>{" "}
                    <span className="cursor-blink" />
                  </p>
                </div>
              </div>
              <a
                href="https://app.codestore.global"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 font-term text-xs text-neutral-500 transition-colors hover:text-amber-300"
              >
                → app.codestore.global
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* honest status strip — replaces the fake stat counters */}
          <div className="border-t border-white/10">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-5 py-5 font-term text-xs text-neutral-500 sm:px-8">
              <span>
                <span className="text-amber-400">$</span> codestore --info
              </span>
              <span>v2.0 live</span>
              <span className="text-neutral-700">/</span>
              <span>5 languages · RTL</span>
              <span className="text-neutral-700">/</span>
              <span>escrow: PayPal</span>
              <span className="text-neutral-700">/</span>
              <span>tenant isolation: prisma + mysql</span>
            </div>
          </div>
        </section>

        {/* ── FEATURES — editorial index list, not icon cards ── */}
        <section className="border-b border-white/10 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <p className="font-term text-sm text-amber-400">$ ls ./features</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-neutral-50 sm:text-5xl">
              {t("landing.features.heading")}
            </h2>
            <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
              {features.map((f) => (
                <div
                  key={f.n}
                  className="group grid gap-2 py-7 transition-colors hover:bg-white/[0.03] sm:grid-cols-[80px_220px_1fr_40px] sm:items-baseline sm:gap-6 sm:px-4"
                >
                  <span className="font-term text-sm text-amber-400/60">
                    {f.n}
                  </span>
                  <h3 className="text-xl font-semibold text-neutral-100">
                    {t(f.titleKey)}
                  </h3>
                  <p className="text-sm leading-6 text-neutral-500">
                    {t(f.descKey)}
                  </p>
                  <ArrowUpRight className="hidden h-5 w-5 text-amber-400 opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LANGUAGES — interactive editor tabs ── */}
        <section className="border-b border-white/10 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <p className="font-term text-sm text-amber-400">$ open ./learn</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-50 sm:text-5xl">
              {t("landing.learn.heading")}
            </h2>
            <p className="mt-4 max-w-xl text-lg text-neutral-400">
              {t("landing.learn.subheading")}
            </p>

            <div className="mt-14 overflow-hidden rounded-lg border border-white/10 bg-[#0d0d0d]">
              <div className="flex overflow-x-auto border-b border-white/10">
                {languages.map((l, i) => (
                  <button
                    key={l.tab}
                    onClick={() => setActiveLang(i)}
                    className={`whitespace-nowrap border-r border-white/10 px-5 py-3 font-term text-xs transition-colors ${
                      i === activeLang
                        ? "bg-white/5 text-amber-300"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {l.tab}
                  </button>
                ))}
              </div>
              <div className="p-7 font-term text-sm leading-8">
                <p className="mb-4 text-xs text-neutral-600">// {lang.name}</p>
                {lang.code.map((line, i) => (
                  <p key={i} className="flex gap-5">
                    <span className="w-6 select-none text-right text-neutral-700">
                      {i + 1}
                    </span>
                    <span className={lang.accent}>{line.t}</span>
                  </p>
                ))}
              </div>
            </div>

            <Link
              href={`/${locale}/courses`}
              className="mt-7 inline-flex items-center gap-2 font-term text-sm text-amber-400 hover:text-amber-300"
            >
              {t("landing.learn.browse")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ── STEPS — as a real terminal session ── */}
        <section className="border-b border-white/10 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <p className="font-term text-sm text-amber-400">
              $ codestore --how-it-works
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-50 sm:text-5xl">
              {t("landing.steps.heading")}
            </h2>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/10 bg-[#0d0d0d] p-7"
                >
                  <p className="font-term text-sm">
                    <span className="mr-2 text-neutral-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-amber-400">$</span>{" "}
                    <span className="text-neutral-200">{s.cmd}</span>
                  </p>
                  <p className="mt-3 font-term text-sm text-emerald-400">
                    {s.out}
                  </p>
                  <h3 className="mt-7 text-lg font-semibold text-neutral-100">
                    {t(s.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    {t(s.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── honest block — replaces fake testimonials ── */}
        <section className="border-b border-white/10 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
            <p className="font-term text-sm text-amber-400"># testimonials</p>
            <p className="mt-6 text-2xl font-medium leading-relaxed text-neutral-300 sm:text-3xl">
              No invented quotes. No stock headshots.
              <span className="text-neutral-50">
                {" "}
                When real users talk about CodeStore, their words go here.
              </span>
            </p>
            <p className="mt-5 font-term text-xs text-neutral-600">
              // shipped v2.0 — collecting real feedback now
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
            <p className="font-term text-sm text-amber-400">
              $ {t("landing.cta.heading").toLowerCase()}
            </p>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-neutral-50 sm:text-6xl">
              {t("landing.cta.heading")}
              <span className="cursor-blink text-amber-400" />
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-400">
              {t("landing.cta.subheading")}
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              {!authLoading && (
                <Link href={authed ? dashboardHref : primaryHref}>
                  <button className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-amber-400 px-8 font-term text-sm font-bold text-black transition-colors hover:bg-amber-300 sm:w-auto">
                    {authed
                      ? t("landing.cta.dashboard")
                      : t("landing.cta.primary")}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              )}
              <Link href={`/${locale}/marketplace`}>
                <button className="flex h-12 w-full items-center justify-center rounded-md border border-white/15 px-8 font-term text-sm text-neutral-300 transition-colors hover:border-amber-400/50 hover:text-amber-300 sm:w-auto">
                  {t("landing.cta.secondary")}
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
