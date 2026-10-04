"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Shield,
  Zap,
  BookOpen,
  ShoppingBag,
  Briefcase,
  Code,
  Terminal,
  FileCode,
  Database,
  Layers,
  Cpu,
  ArrowRight,
  Sparkles,
  Users,
  Star,
  MessageSquare,
  TrendingUp,
  Lock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  OrganizationSchema,
  WebSiteSchema,
  BreadcrumbSchema,
} from "@/components/seo/structured-data";

const programmingLanguages = [
  {
    name: "HTML & CSS",
    icon: <FileCode className="h-6 w-6" />,
    descKey: "landing.languages.htmlDesc",
    level: "Beginner",
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10 text-orange-600",
  },
  {
    name: "JavaScript",
    icon: <Code className="h-6 w-6" />,
    descKey: "landing.languages.jsDesc",
    level: "Beginner",
    color: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-500/10 text-yellow-600",
  },
  {
    name: "Python",
    icon: <Terminal className="h-6 w-6" />,
    descKey: "landing.languages.pythonDesc",
    level: "Beginner",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10 text-blue-600",
  },
  {
    name: "TypeScript",
    icon: <Layers className="h-6 w-6" />,
    descKey: "landing.languages.tsDesc",
    level: "Intermediate",
    color: "from-sky-500 to-blue-600",
    bgColor: "bg-sky-500/10 text-sky-600",
  },
  {
    name: "SQL & Databases",
    icon: <Database className="h-6 w-6" />,
    descKey: "landing.languages.sqlDesc",
    level: "Intermediate",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10 text-emerald-600",
  },
  {
    name: "Rust",
    icon: <Cpu className="h-6 w-6" />,
    descKey: "landing.languages.rustDesc",
    level: "Advanced",
    color: "from-red-500 to-rose-500",
    bgColor: "bg-red-500/10 text-red-600",
  },
];

const features = [
  {
    icon: <Shield className="h-7 w-7" />,
    titleKey: "landing.features.tenant",
    descKey: "landing.features.tenantDesc",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: <BookOpen className="h-7 w-7" />,
    titleKey: "landing.features.courses",
    descKey: "landing.features.coursesDesc",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: <ShoppingBag className="h-7 w-7" />,
    titleKey: "landing.features.marketplace",
    descKey: "landing.features.marketplaceDesc",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: <Briefcase className="h-7 w-7" />,
    titleKey: "landing.features.jobs",
    descKey: "landing.features.jobsDesc",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: <MessageSquare className="h-7 w-7" />,
    titleKey: "landing.features.forum",
    descKey: "landing.features.forumDesc",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: <Globe className="h-7 w-7" />,
    titleKey: "landing.features.i18n",
    descKey: "landing.features.i18nDesc",
    color: "from-indigo-500 to-violet-600",
  },
];

interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string | null;
}

export default function LandingPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;
  const t = useTranslations();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) setUser(data.user as SafeUser);
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardHref =
    user?.role === "SUPERADMIN"
      ? `/${locale}/admin`
      : user?.tenantId
        ? `/${locale}/${user.tenantId}/dashboard`
        : `/${locale}/login`;

  const breadcrumbItems = [
    { name: "Home", url: `https://codestore.global/${locale}` },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      {/* SEO Structured Data */}
      <OrganizationSchema />
      <WebSiteSchema locale={locale} />
      <BreadcrumbSchema items={breadcrumbItems} />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),rgba(15,23,42,0))]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[1000px] bg-gradient-to-b from-violet-500/20 to-transparent blur-3xl opacity-50" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-6 px-4 py-1.5 text-xs font-medium bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800">
              <Sparkles className="h-3 w-3 mr-1.5" /> {t("landing.hero.badge")}
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              {t("landing.hero.title1")}
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {t("landing.hero.title2")}
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
              {t("landing.hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user && (user.role === "SUPERADMIN" || user.tenantId) ? (
                <Link href={dashboardHref}>
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-xl shadow-slate-900/20 dark:shadow-white/10"
                  >
                    {t("landing.hero.ctaDashboard")}{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link
                  href={user ? `/${locale}/marketplace` : `/${locale}/register`}
                >
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-xl shadow-slate-900/20 dark:shadow-white/10"
                  >
                    {t("landing.hero.ctaPrimary")}{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link href={`/${locale}/marketplace`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  {t("landing.hero.ctaSecondary")}
                </Button>
              </Link>
            </div>

            <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
              <Stat value="10K+" label={t("landing.stats.devs")} />
              <Stat value="500+" label={t("landing.stats.components")} />
              <Stat value="1,200+" label={t("landing.stats.courses")} />
              <Stat value="$2M+" label={t("landing.stats.escrow")} />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 text-xs font-medium border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400"
              >
                {t("landing.features.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {t("landing.features.heading")}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t("landing.features.subheading")}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <Card
                  key={i}
                  className="group relative overflow-hidden border-slate-200 bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-slate-900/50"
                >
                  <div
                    className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
                  <CardContent className="p-6">
                    <div
                      className={`mb-4 inline-flex rounded-xl p-3 bg-gradient-to-br ${feature.color} text-white shadow-lg`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t(feature.descKey)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Learn Programming Section */}
        <section id="learn" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 text-xs font-medium border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400"
              >
                {t("landing.learn.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {t("landing.learn.heading")}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t("landing.learn.subheading")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programmingLanguages.map((lang) => (
                <Card
                  key={lang.name}
                  className="group overflow-hidden border-slate-200 bg-white hover:shadow-lg transition-all duration-300 dark:border-slate-800 dark:bg-slate-900"
                >
                  <CardContent className="p-0">
                    <div
                      className={`h-2 w-full bg-gradient-to-r ${lang.color}`}
                    />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`inline-flex rounded-xl p-3 ${lang.bgColor}`}
                        >
                          {lang.icon}
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {lang.level}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {lang.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        {t(lang.descKey)}
                      </p>
                      <Link href={`/${locale}/courses`}>
                        <span className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors group/link">
                          {t("landing.learn.browse")}{" "}
                          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
                        </span>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-slate-900 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/20">
                {t("landing.steps.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {t("landing.steps.heading")}
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {t("landing.steps.subheading")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <StepCard
                number="01"
                icon={<Users className="h-6 w-6" />}
                title={t("landing.steps.step1Title")}
                desc={t("landing.steps.step1Desc")}
              />
              <StepCard
                number="02"
                icon={<Lock className="h-6 w-6" />}
                title={t("landing.steps.step2Title")}
                desc={t("landing.steps.step2Desc")}
              />
              <StepCard
                number="03"
                icon={<TrendingUp className="h-6 w-6" />}
                title={t("landing.steps.step3Title")}
                desc={t("landing.steps.step3Desc")}
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 text-xs font-medium border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400"
              >
                {t("landing.testimonials.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {t("landing.testimonials.heading")}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t("landing.testimonials.subheading")}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {["English", "العربية", "Français", "Deutsch", "Español"].map(
                (lang) => (
                  <Badge
                    key={lang}
                    variant="secondary"
                    className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  >
                    {lang}
                  </Badge>
                ),
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
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

        {/* CTA Section */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-8 sm:p-16 text-center shadow-2xl shadow-violet-500/20">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  {t("landing.cta.heading")}
                </h2>
                <p className="text-lg text-violet-100 max-w-xl mx-auto mb-8">
                  {t("landing.cta.subheading")}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {user && (user.role === "SUPERADMIN" || user.tenantId) ? (
                    <Link href={dashboardHref}>
                      <Button
                        size="lg"
                        className="h-12 px-8 text-base bg-white text-violet-700 hover:bg-violet-50 shadow-lg"
                      >
                        {t("landing.cta.dashboard")}{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      href={
                        user ? `/${locale}/marketplace` : `/${locale}/register`
                      }
                    >
                      <Button
                        size="lg"
                        className="h-12 px-8 text-base bg-white text-violet-700 hover:bg-violet-50 shadow-lg"
                      >
                        {t("landing.cta.primary")}{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Link href={`/${locale}/marketplace`}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 px-8 text-base border-white/30 text-white hover:bg-white/10"
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
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
    <div className="relative text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 text-white mb-6 backdrop-blur-sm border border-white/10">
        {icon}
      </div>
      <div className="text-sm font-bold text-violet-400 mb-2">{number}</div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
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
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <CardContent className="p-6">
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${color} text-white text-sm font-bold`}
          >
            {initials}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              {author}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              {role}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
