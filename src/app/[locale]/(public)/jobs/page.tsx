import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  ChevronRight,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { generateOpenGraph } from "@/components/seo/open-graph";
import {
  BreadcrumbSchema,
  StructuredData,
} from "@/components/seo/structured-data";

export const revalidate = 60;

const locales = ["en", "ar", "fr", "de", "es"];

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t: Record<string, { title: string; desc: string }> = {
    en: {
      title: "Freelance Developer Jobs — Remote & Contract | CODESTORE GLOBAL",
      desc: "Browse open freelance jobs for developers: remote contracts, fixed-budget projects, and full-time roles from verified companies. Apply directly and get paid through secure escrow.",
    },
    ar: {
      title: "وظائف مطورين مستقلين — عن بعد وتعاقدية | CODESTORE GLOBAL",
      desc: "تصفح وظائف المطورين المستقلين المفتوحة: عقود عن بعد ومشاريع بميزانية ثابتة ووظائف بدوام كامل من شركات موثقة.",
    },
    fr: {
      title:
        "Emplois Freelance Développeurs — À distance & Contrat | CODESTORE GLOBAL",
      desc: "Parcourez les offres freelance pour développeurs : contrats à distance, projets au forfait et postes à temps plein d'entreprises vérifiées.",
    },
    de: {
      title: "Freelance-Entwickler-Jobs — Remote & Vertrag | CODESTORE GLOBAL",
      desc: "Durchsuchen Sie offene Freelance-Jobs für Entwickler: Remote-Verträge, Festpreisprojekte und Vollzeitstellen von verifizierten Unternehmen.",
    },
    es: {
      title:
        "Trabajos Freelance para Desarrolladores — Remoto y Contrato | CODESTORE GLOBAL",
      desc: "Explora empleos freelance para desarrolladores: contratos remotos, proyectos de precio fijo y puestos de tiempo completo de empresas verificadas.",
    },
  };
  const m = t[locale] || t.en;
  return generateOpenGraph({
    title: m.title,
    description: m.desc,
    url: `https://codestoreglobal.com/${locale}/jobs`,
    locale,
  });
}

export default async function PublicJobsPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;

  const now = new Date();
  const jobs = await prisma.jobListing.findMany({
    where: { status: "OPEN" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      tenant: { select: { name: true, slug: true } },
      _count: { select: { applications: true } },
    },
  });

  const activeFeatured = jobs.filter(
    (j) => j.featured && (!j.featuredUntil || j.featuredUntil > now),
  );
  const rest = jobs.filter((j) => !activeFeatured.includes(j));
  const sorted = [...activeFeatured, ...rest];

  const titles: Record<string, string> = {
    en: "Freelance Developer Jobs",
    ar: "وظائف المطورين المستقلين",
    fr: "Emplois Freelance Développeurs",
    de: "Freelance-Jobs für Entwickler",
    es: "Trabajos Freelance",
  };
  const subtitles: Record<string, string> = {
    en: "Remote contracts, fixed-budget projects, and full-time roles from verified companies. Payments protected by escrow.",
    ar: "عقود عن بعد ومشاريع بميزانية ثابتة ووظائف كاملة من شركات موثقة. المدفوعات محمية بالضمان الآمن.",
    fr: "Contrats à distance, projets au forfait et postes à temps plein d'entreprises vérifiées. Paiements protégés par séquestre.",
    de: "Remote-Verträge, Festpreisprojekte und Vollzeitstellen von verifizierten Unternehmen. Zahlungen durch Treuhandschutz gesichert.",
    es: "Contratos remotos, proyectos de precio fijo y puestos completos de empresas verificadas. Pagos protegidos con fideicomiso.",
  };

  const breadcrumbItems = [
    { name: "Home", url: `https://codestoreglobal.com/${locale}` },
    { name: "Jobs", url: `https://codestoreglobal.com/${locale}/jobs` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <BreadcrumbSchema items={breadcrumbItems} />
      <StructuredData
        type="WebPage"
        data={{
          name: titles[locale] || titles.en,
          description: subtitles[locale] || subtitles.en,
          url: `https://codestoreglobal.com/${locale}/jobs`,
        }}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="mb-10">
          <Badge variant="outline" className="mb-3 text-xs font-medium">
            {sorted.length}{" "}
            {sorted.length === 1 ? "open position" : "open positions"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            {titles[locale] || titles.en}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            {subtitles[locale] || subtitles.en}
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
            <p>No open positions right now — check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((job) => {
              const isFeatured =
                job.featured && (!job.featuredUntil || job.featuredUntil > now);
              const skills = (
                Array.isArray(job.skillsRequired) ? job.skillsRequired : []
              ).filter((s): s is string => typeof s === "string");

              return (
                <Link
                  key={job.id}
                  href={`/${locale}/jobs/${job.slug}`}
                  className="group block"
                >
                  <div
                    className={`rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 dark:bg-slate-900 ${
                      isFeatured
                        ? "border-amber-300 dark:border-amber-700 ring-1 ring-amber-200 dark:ring-amber-900"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {isFeatured && (
                            <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 gap-1">
                              <Flame className="h-3 w-3" /> Featured
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {job.status}
                          </Badge>
                          {job.isRemote && (
                            <Badge variant="outline" className="text-xs">
                              Remote
                            </Badge>
                          )}
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
                          {job.title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                          {job.description}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />{" "}
                            {job.location || "Remote"}
                          </span>
                          <span>{job.tenant.name}</span>
                          <span>{formatDate(job.createdAt)}</span>
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-0.5">
                            {job._count.applications} applicants
                          </span>
                        </div>
                        {skills.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {skills.slice(0, 6).map((s) => (
                              <Badge
                                key={s}
                                variant="outline"
                                className="text-xs"
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {job.budgetMin
                            ? `${formatCurrency(Number(job.budgetMin))}${job.budgetMax ? ` – ${formatCurrency(Number(job.budgetMax))}` : "+"}`
                            : "Negotiable"}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-0.5 text-sm font-medium text-violet-600 dark:text-violet-400">
                          View <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
