import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Calendar,
  Users,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { generateOpenGraph } from "@/components/seo/open-graph";
import {
  BreadcrumbSchema,
  StructuredData,
} from "@/components/seo/structured-data";

export const revalidate = 60;

interface Params {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: Params) {
  const { locale, slug } = params;
  const job = await prisma.jobListing.findFirst({
    where: { slug },
    select: {
      title: true,
      description: true,
      budgetMin: true,
      budgetMax: true,
      location: true,
      isRemote: true,
      skillsRequired: true,
    },
  });

  if (!job) return {};

  const skills = (Array.isArray(job.skillsRequired) ? job.skillsRequired : [])
    .slice(0, 5)
    .join(", ");
  const title = `${job.title} — ${job.isRemote ? "Remote" : job.location || "Remote"} | CODESTORE GLOBAL Jobs`;
  const description = `${job.description.slice(0, 110)}${skills ? ` Skills: ${skills}.` : ""} ${job.budgetMin ? `Budget: ${formatCurrency(Number(job.budgetMin))}${job.budgetMax ? `–${formatCurrency(Number(job.budgetMax))}` : "+"}.` : ""}`;

  return generateOpenGraph({
    title,
    description: description.slice(0, 200),
    url: `https://codestore.global/${locale}/jobs/${slug}`,
    locale,
  });
}

export default async function PublicJobDetailPage({ params }: Params) {
  const { locale, slug } = params;

  const job = await prisma.jobListing.findFirst({
    where: { slug },
    include: {
      tenant: { select: { name: true, slug: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!job) notFound();

  const isFeatured =
    job.featured && (!job.featuredUntil || job.featuredUntil > new Date());
  const skills = (
    Array.isArray(job.skillsRequired) ? job.skillsRequired : []
  ).filter((s): s is string => typeof s === "string");
  const validThrough = (
    job.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).toISOString();

  const breadcrumbItems = [
    { name: "Home", url: `https://codestore.global/${locale}` },
    { name: "Jobs", url: `https://codestore.global/${locale}/jobs` },
    { name: job.title, url: `https://codestore.global/${locale}/jobs/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <BreadcrumbSchema items={breadcrumbItems} />
      {/* JobPosting structured data — enables Google Jobs rich results */}
      <StructuredData
        type="JobPosting"
        data={{
          title: job.title,
          description: `${job.description}\n\nRequirements: ${job.requirements || "See description."}`,
          identifier: {
            "@type": "PropertyValue",
            name: "CODESTORE GLOBAL",
            value: job.id,
          },
          datePosted: job.createdAt.toISOString(),
          validThrough,
          hiringOrganization: {
            "@type": "Organization",
            name: job.tenant.name,
            sameAs: `https://codestore.global/${locale}`,
          },
          employmentType: "CONTRACTOR",
          jobLocationType: job.isRemote ? "TELECOMMUTE" : undefined,
          ...(job.isRemote
            ? {
                applicantLocationRequirements: {
                  "@type": "Country",
                  name:
                    job.location && job.location !== "Remote"
                      ? job.location
                      : "Worldwide",
                },
              }
            : {
                jobLocation: {
                  "@type": "Place",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: job.location || "Not specified",
                  },
                },
              }),
          baseSalary: job.budgetMin
            ? {
                "@type": "MonetaryAmount",
                currency: job.currency,
                value: {
                  "@type": "QuantitativeValue",
                  minValue: Number(job.budgetMin),
                  ...(job.budgetMax ? { maxValue: Number(job.budgetMax) } : {}),
                  unitText: "MONTH",
                },
              }
            : undefined,
          skills: skills.join(", "),
          directApply: true,
        }}
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}/jobs`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> All Jobs
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {isFeatured && (
              <Badge className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Sparkles className="h-3 w-3" /> Featured
              </Badge>
            )}
            <Badge variant="secondary">{job.status}</Badge>
            {job.isRemote && <Badge variant="outline">Remote</Badge>}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {job.title}
          </h1>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" /> {job.tenant.name}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />{" "}
              {job.isRemote
                ? `Remote${job.location && job.location !== "Remote" ? ` (${job.location})` : ""}`
                : job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Posted{" "}
              {formatDate(job.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> {job._count.applications} applicants
            </span>
          </div>

          <div className="prose-sm space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                About this job
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </section>

            {job.requirements && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Requirements
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {job.requirements}
                </p>
              </section>
            )}

            {skills.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="mt-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {job.budgetMin
                  ? `${formatCurrency(Number(job.budgetMin))}${job.budgetMax ? ` – ${formatCurrency(Number(job.budgetMax))}` : "+"}`
                  : "Negotiable"}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                  {" "}
                  {job.budgetMin ? "budget" : ""}
                </span>
              </p>
              {job.deadline && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Apply before {formatDate(job.deadline)}
                </p>
              )}
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
            >
              <Link href={`/${locale}/${job.tenant.slug}/jobs`}>Apply Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
