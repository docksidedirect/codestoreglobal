import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Layers, ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { generateOpenGraph } from "@/components/seo/open-graph";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const titles: Record<string, string> = {
    en: "Programming Courses | CODESTORE GLOBAL",
    ar: "دورات البرمجة | CODESTORE GLOBAL",
    fr: "Cours de Programmation | CODESTORE GLOBAL",
    de: "Programmierkurse | CODESTORE GLOBAL",
    es: "Cursos de Programación | CODESTORE GLOBAL",
  };
  const descriptions: Record<string, string> = {
    en: "Browse expert-led programming courses. Learn Next.js, Prisma, TypeScript, Python, Rust and more. Start your developer journey today.",
    ar: "تصفح دورات البرمجة بقيادة الخبراء. تعلم Next.js و Prisma و TypeScript و Python و Rust والمزيد. ابدأ رحلة المطور الخاصة بك اليوم.",
    fr: "Parcourez des cours de programmation dirigés par des experts. Apprenez Next.js, Prisma, TypeScript, Python, Rust et plus encore. Commencez votre parcours de développeur aujourd'hui.",
    de: "Durchsuchen Sie expertengeführte Programmierkurse. Lernen Sie Next.js, Prisma, TypeScript, Python, Rust und mehr. Beginnen Sie noch heute Ihre Entwicklerreise.",
    es: "Explora cursos de programación dirigidos por expertos. Aprende Next.js, Prisma, TypeScript, Python, Rust y más. Comienza tu viaje de desarrollador hoy.",
  };

  return generateOpenGraph({
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    url: `https://codestoreglobal.com/${locale}/courses`,
    locale,
    type: "website",
  });
}

export default async function PublicCoursesPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      instructor: { select: { firstName: true, lastName: true } },
      tenant: { select: { name: true } },
    },
  });

  const breadcrumbItems = [
    { name: "Home", url: `https://codestoreglobal.com/${locale}` },
    { name: "Courses", url: `https://codestoreglobal.com/${locale}/courses` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <Badge
            variant="outline"
            className="mb-3 text-xs font-medium border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400"
          >
            Course Catalog
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Explore Our Courses
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Master modern development with expert-led courses across multiple
            programming languages and frameworks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/courses/${c.slug}`}
              className="group block"
            >
              <Card className="h-full overflow-hidden border-slate-200 bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-slate-900/50">
                <div className="h-2 w-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                <CardHeader className="pb-3">
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg mb-3 flex items-center justify-center group-hover:from-violet-50 group-hover:to-indigo-50 dark:group-hover:from-violet-950/30 dark:group-hover:to-indigo-950/30 transition-colors">
                    <BookOpen className="h-10 w-10 text-slate-400 group-hover:text-violet-500 transition-colors" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {c.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                    {c.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" /> {c.moduleCount} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {c.durationMinutes}m
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {c.difficulty}
                    </Badge>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">
                      {formatCurrency(Number(c.price))}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      by {c.instructor.firstName} {c.instructor.lastName}
                    </span>
                    <span className="text-xs font-medium text-violet-600 dark:text-violet-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
