"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Code2,
  Command,
  Cpu,
  Database,
  FileCode,
  Globe2,
  Layers3,
  LockKeyhole,
  MessageSquare,
  Play,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Terminal,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  OrganizationSchema,
  WebSiteSchema,
  BreadcrumbSchema,
} from "@/components/seo/structured-data";

const programmingLanguages = [
  {
    name: "HTML & CSS",
    icon: <FileCode className="h-5 w-5" />,
    descKey: "landing.languages.htmlDesc",
    level: "Beginner",
    color: "from-orange-500 to-amber-400",
    bgColor: "bg-orange-500/10 text-orange-600",
  },
  {
    name: "JavaScript",
    icon: <Code2 className="h-5 w-5" />,
    descKey: "landing.languages.jsDesc",
    level: "Beginner",
    color: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-500/10 text-yellow-600",
  },
  {
    name: "Python",
    icon: <Terminal className="h-5 w-5" />,
    descKey: "landing.languages.pythonDesc",
    level: "Beginner",
    color: "from-blue-500 to-cyan-400",
    bgColor: "bg-blue-500/10 text-blue-600",
  },
  {
    name: "TypeScript",
    icon: <Layers3 className="h-5 w-5" />,
    descKey: "landing.languages.tsDesc",
    level: "Intermediate",
    color: "from-sky-500 to-blue-600",
    bgColor: "bg-sky-500/10 text-sky-600",
  },
  {
    name: "SQL & Databases",
    icon: <Database className="h-5 w-5" />,
    descKey: "landing.languages.sqlDesc",
    level: "Intermediate",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10 text-emerald-600",
  },
  {
    name: "Rust",
    icon: <Cpu className="h-5 w-5" />,
    descKey: "landing.languages.rustDesc",
    level: "Advanced",
    color: "from-red-500 to-rose-500",
    bgColor: "bg-red-500/10 text-red-600",
  },
];

const features = [
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    titleKey: "landing.features.tenant",
    descKey: "landing.features.tenantDesc",
    color: "from-violet-500 to-indigo-500",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    titleKey: "landing.features.courses",
    descKey: "landing.features.coursesDesc",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: <ShoppingBag className="h-6 w-6" />,
    titleKey: "landing.features.marketplace",
    descKey: "landing.features.marketplaceDesc",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: <Briefcase className="h-6 w-6" />,
    titleKey: "landing.features.jobs",
    descKey: "landing.features.jobsDesc",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    titleKey: "landing.features.forum",
    descKey: "landing.features.forumDesc",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: <Globe2 className="h-6 w-6" />,
    titleKey: "landing.features.i18n",
    descKey: "landing.features.i18nDesc",
    color: "from-indigo-500 to-violet-500",
  },
];

type SafeUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string | null;
};

export default function LandingPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;
  const t = useTranslations();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) setUser(data.user as SafeUser);
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  const dashboardHref =
    user?.role === "SUPERADMIN"
      ? `/${locale}/admin`
      : user?.tenantId
        ? `/${locale}/${user.tenantId}/dashboard`
        : `/${locale}/login`;
  const primaryHref = user ? `/${locale}/marketplace` : `/${locale}/register`;
  const breadcrumbItems = [
    { name: "Home", url: `https://codestoreglobal.com/${locale}` },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <OrganizationSchema />
      <WebSiteSchema locale={locale} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <main>
        <section className="relative isolate border-b border-slate-200/70 dark:border-slate-800/70">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -left-40 -top-36 h-[520px] w-[520px] rounded-full bg-violet-300/25 blur-3xl dark:bg-violet-900/20" />
            <div className="absolute right-[-12%] top-20 h-[620px] w-[620px] rounded-full bg-cyan-200/25 blur-3xl dark:bg-cyan-900/20" />
            <div className="absolute inset-0 bg-grid-slate" />
          </div>
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-28 lg:pt-24">
            <div className="max-w-2xl">
              <Badge className="mb-7 rounded-full border-violet-200 bg-violet-50 px-3.5 py-1.5 text-violet-700 shadow-sm dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {t("landing.hero.badge")}
              </Badge>
              <h1 className="text-balance text-5xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.7rem] lg:leading-[1.02] dark:text-white">
                {t("landing.hero.title1")}{" "}
                <span className="text-gradient">
                  {t("landing.hero.title2")}
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-400">
                {t("landing.hero.subtitle")}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={
                    user && (user.role === "SUPERADMIN" || user.tenantId)
                      ? dashboardHref
                      : primaryHref
                  }
                >
                  <Button
                    size="lg"
                    className="group h-12 w-full rounded-xl bg-slate-950 px-6 text-base shadow-xl shadow-slate-950/15 hover:bg-violet-700 sm:w-auto dark:bg-white dark:text-slate-950 dark:hover:bg-violet-100"
                  >
                    {user && (user.role === "SUPERADMIN" || user.tenantId)
                      ? t("landing.hero.ctaDashboard")
                      : t("landing.hero.ctaPrimary")}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href={`/${locale}/marketplace`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full rounded-xl border-slate-300 bg-white/70 px-6 text-base hover:border-violet-300 hover:bg-violet-50 sm:w-auto dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800"
                  >
                    {t("landing.hero.ctaSecondary")}
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Built for global teams
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Secure by default
                </span>
              </div>
            </div>
            <ProductPreview />
          </div>
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 border-t border-slate-200/70 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8 dark:border-slate-800/70">
            <Stat value="10K+" label={t("landing.stats.devs")} />
            <Stat value="500+" label={t("landing.stats.components")} />
            <Stat value="1,200+" label={t("landing.stats.courses")} />
            <Stat value="$2M+" label={t("landing.stats.escrow")} />
          </div>
        </section>

        <section className="section-pad bg-slate-50/70 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              badge={t("landing.features.badge")}
              heading={t("landing.features.heading")}
              subheading={t("landing.features.subheading")}
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <Card
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl border-slate-200/80 bg-white/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-900/5 dark:border-slate-800 dark:bg-slate-900/70 ${i === 0 ? "lg:col-span-2" : ""}`}
                >
                  <CardContent className="p-7">
                    <div
                      className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg shadow-violet-500/10`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {t(feature.descKey)}
                    </p>
                    <div className="mt-6 inline-flex items-center text-sm font-medium text-violet-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-violet-400">
                      Explore capability{" "}
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="learn" className="section-pad">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              badge={t("landing.learn.badge")}
              heading={t("landing.learn.heading")}
              subheading={t("landing.learn.subheading")}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {programmingLanguages.map((lang) => (
                <Card
                  key={lang.name}
                  className="group overflow-hidden rounded-2xl border-slate-200/80 transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <CardContent className="p-0">
                    <div className={`h-1.5 bg-gradient-to-r ${lang.color}`} />
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl ${lang.bgColor}`}
                        >
                          {lang.icon}
                        </div>
                        <Badge
                          variant="secondary"
                          className="rounded-full bg-slate-100 text-xs dark:bg-slate-800"
                        >
                          {lang.level}
                        </Badge>
                      </div>
                      <h3 className="mt-5 text-lg font-semibold">
                        {lang.name}
                      </h3>
                      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {t(lang.descKey)}
                      </p>
                      <Link
                        href={`/${locale}/courses`}
                        className="mt-5 inline-flex items-center text-sm font-semibold text-violet-600 dark:text-violet-400"
                      >
                        {t("landing.learn.browse")}
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-slate-950 py-16 sm:py-20 text-white dark:bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,.35),transparent_35%),radial-gradient(circle_at_90%_100%,rgba(6,182,212,.2),transparent_35%)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              dark
              badge={t("landing.steps.badge")}
              heading={t("landing.steps.heading")}
              subheading={t("landing.steps.subheading")}
            />
            <div className="grid gap-5 md:grid-cols-3">
              <StepCard
                number="01"
                icon={<Users className="h-5 w-5" />}
                title={t("landing.steps.step1Title")}
                desc={t("landing.steps.step1Desc")}
              />
              <StepCard
                number="02"
                icon={<LockKeyhole className="h-5 w-5" />}
                title={t("landing.steps.step2Title")}
                desc={t("landing.steps.step2Desc")}
              />
              <StepCard
                number="03"
                icon={<TrendingUp className="h-5 w-5" />}
                title={t("landing.steps.step3Title")}
                desc={t("landing.steps.step3Desc")}
              />
            </div>
          </div>
        </section>

        <section className="section-pad bg-slate-50/70 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              badge={t("landing.testimonials.badge")}
              heading={t("landing.testimonials.heading")}
              subheading={t("landing.testimonials.subheading")}
            />
            <div className="mb-10 flex flex-wrap justify-center gap-2">
              {["English", "العربية", "Français", "Deutsch", "Español"].map(
                (lang) => (
                  <Badge
                    key={lang}
                    variant="secondary"
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
                  >
                    {lang}
                  </Badge>
                ),
              )}
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <TestimonialCard
                quote={t("landing.testimonials.q1")}
                author="Sarah Chen"
                role={t("landing.testimonials.r1")}
                initials="SC"
                color="bg-emerald-500"
              />
              <TestimonialCard
                quote={t("landing.testimonials.q2")}
                author="Marcus Weber"
                role={t("landing.testimonials.r2")}
                initials="MW"
                color="bg-blue-500"
              />
              <TestimonialCard
                quote={t("landing.testimonials.q3")}
                author="Demo Admin"
                role={t("landing.testimonials.r3")}
                initials="DA"
                color="bg-violet-500"
              />
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600 px-6 py-16 text-center shadow-2xl shadow-violet-500/20 sm:px-16">
              <div className="absolute inset-0 bg-grid-white opacity-20" />
              <div className="relative">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
                  <Command className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {t("landing.cta.heading")}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg leading-7 text-violet-100">
                  {t("landing.cta.subheading")}
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  {!authLoading && (
                    <Link
                      href={
                        user && (user.role === "SUPERADMIN" || user.tenantId)
                          ? dashboardHref
                          : primaryHref
                      }
                    >
                      <Button
                        size="lg"
                        className="h-12 rounded-xl bg-white px-6 text-base text-violet-700 shadow-lg hover:bg-violet-50"
                      >
                        {user && (user.role === "SUPERADMIN" || user.tenantId)
                          ? t("landing.cta.dashboard")
                          : t("landing.cta.primary")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Link href={`/${locale}/marketplace`}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 rounded-xl border-white/30 px-6 text-base text-white hover:bg-white/10"
                    >
                      {t("landing.cta.secondary")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionIntro({
  badge,
  heading,
  subheading,
  dark = false,
}: {
  badge: string;
  heading: string;
  subheading: string;
  dark?: boolean;
}) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <Badge
        variant="outline"
        className={
          dark
            ? "mb-4 rounded-full border-white/20 bg-white/5 text-slate-200"
            : "mb-4 rounded-full border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400"
        }
      >
        {badge}
      </Badge>
      <h2
        className={`text-3xl font-semibold tracking-tight sm:text-4xl ${dark ? "text-white" : "text-slate-950 dark:text-white"}`}
      >
        {heading}
      </h2>
      <p
        className={`mt-4 text-lg leading-7 ${dark ? "text-slate-400" : "text-slate-600 dark:text-slate-400"}`}
      >
        {subheading}
      </p>
    </div>
  );
}
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-500">
        {label}
      </div>
    </div>
  );
}
function StepCard({
  number,
  icon,
  title,
  desc,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-7 backdrop-blur transition-colors hover:bg-white/[0.1]">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
          {icon}
        </div>
        <span className="font-mono text-sm text-violet-300">{number}</span>
      </div>
      <h3 className="mt-8 text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{desc}</p>
    </div>
  );
}
function TestimonialCard({
  quote,
  author,
  role,
  initials,
  color,
}: {
  quote: string;
  author: string;
  role: string;
  initials: string;
  color: string;
}) {
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
      <CardContent className="p-7">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="mt-5 min-h-24 text-sm leading-6 text-slate-700 dark:text-slate-300">
          “{quote}”
        </p>
        <div className="mt-7 flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${color} text-sm font-bold text-white`}
          >
            {initials}
          </div>
          <div>
            <div className="text-sm font-semibold">{author}</div>
            <div className="text-xs text-slate-500">{role}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
      <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-r from-violet-500/20 via-cyan-400/10 to-indigo-500/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="rounded-md bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-500 dark:bg-slate-800">
            app.codestore.global
          </div>
          <div className="w-10" />
        </div>
        <div className="grid grid-cols-[112px_1fr]">
          <div className="hidden border-r border-slate-200 bg-slate-50 p-4 sm:block dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-600 text-white">
                <Zap className="h-3.5 w-3.5" />
              </div>
              Workspace
            </div>
            <div className="mt-8 space-y-3 text-[10px] text-slate-500">
              <div className="rounded-md bg-violet-100 px-2 py-1.5 font-medium text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                Overview
              </div>
              <div>Courses</div>
              <div>Marketplace</div>
              <div>Community</div>
            </div>
          </div>
          <div className="p-5 sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-violet-600">
                  Your workspace
                </div>
                <div className="mt-1 text-xl font-semibold tracking-tight">
                  Build & grow together
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-600 dark:bg-emerald-950/30">
                Live
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <PreviewMetric label="Members" value="2,481" />
              <PreviewMetric label="Revenue" value="$48.2K" />
              <PreviewMetric label="Courses" value="128" />
            </div>
            <div className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>Workspace activity</span>
                <span className="text-emerald-500">+18.4%</span>
              </div>
              <div className="mt-5 flex h-24 items-end gap-1.5">
                {[35, 48, 42, 62, 55, 74, 68, 86, 78, 94, 82, 100].map(
                  (height, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-500 to-cyan-400 opacity-80"
                      style={{ height: `${height}%` }}
                    />
                  ),
                )}
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300">
                <Play className="h-3.5 w-3.5 fill-current" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-medium">
                  Design systems for developers
                </div>
                <div className="mt-0.5 text-[10px] text-slate-500">
                  Continue learning · 68%
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:flex dark:border-slate-700 dark:bg-slate-900">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[10px] text-slate-500">This month</div>
          <div className="text-sm font-semibold">+24.8% growth</div>
        </div>
      </div>
    </div>
  );
}
function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/70">
      <div className="text-[9px] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
