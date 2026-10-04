import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Layers,
  ArrowLeft,
  User,
  Calendar,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { generateOpenGraph } from "@/components/seo/open-graph";
import {
  BreadcrumbSchema,
  StructuredData,
} from "@/components/seo/structured-data";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const { locale, slug } = params;
  const course = await prisma.course.findFirst({
    where: { slug },
    select: { title: true, description: true, price: true, difficulty: true },
  });

  if (!course) return {};

  const titleMap: Record<string, string> = {
    en: `${course.title} - Programming Course | CODESTORE GLOBAL`,
    ar: `${course.title} - دورة برمجة | CODESTORE GLOBAL`,
    fr: `${course.title} - Cours de Programmation | CODESTORE GLOBAL`,
    de: `${course.title} - Programmierkurs | CODESTORE GLOBAL`,
    es: `${course.title} - Curso de Programación | CODESTORE GLOBAL`,
  };

  return generateOpenGraph({
    title: titleMap[locale] || titleMap.en,
    description: course.description.slice(0, 160),
    url: `https://codestoreglobal.com/${locale}/courses/${slug}`,
    locale,
    type: "article",
  });
}

export default async function CourseDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const { locale, slug } = params;

  const course = await prisma.course.findFirst({
    where: { slug },
    include: {
      instructor: { select: { firstName: true, lastName: true, bio: true } },
      tenant: { select: { name: true } },
      modules: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!course) notFound();

  const tags = (Array.isArray(course.tags) ? course.tags : []).filter(
    (t): t is string => typeof t === "string",
  );
  const outcomes = (
    Array.isArray(course.learningOutcomes) ? course.learningOutcomes : []
  ).filter((o): o is string => typeof o === "string");

  const breadcrumbItems = [
    { name: "Home", url: `https://codestoreglobal.com/${locale}` },
    { name: "Courses", url: `https://codestoreglobal.com/${locale}/courses` },
    {
      name: course.title,
      url: `https://codestoreglobal.com/${locale}/courses/${slug}`,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <BreadcrumbSchema items={breadcrumbItems} />
      <StructuredData
        type="Course"
        data={{
          name: course.title,
          description: course.description,
          provider: {
            "@type": "Organization",
            name: "CODESTORE GLOBAL",
            sameAs: "https://codestoreglobal.com",
          },
          courseCode: course.slug,
          educationalLevel: course.difficulty,
          inLanguage: locale,
          offers: {
            "@type": "Offer",
            price: Number(course.price),
            priceCurrency: course.currency,
            availability: "https://schema.org/InStock",
          },
        }}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}/courses`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {course.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {course.currency}
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {course.description}
              </p>
            </div>

            {outcomes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What You Will Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {outcomes.map((outcome, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                      >
                        <Tag className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Course Modules ({course.modules.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.modules.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No modules published yet.
                  </p>
                ) : (
                  course.modules.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400">
                          {m.orderIndex + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {m.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {m.durationMinutes}m
                          </p>
                        </div>
                      </div>
                      {m.isPreview && (
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          Preview
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <div className="h-2 w-full bg-gradient-to-r from-violet-500 to-indigo-500" />
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(Number(course.price))}
                  </p>
                </div>
                <Button className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                  Enroll Now
                </Button>
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Layers className="h-4 w-4" /> {course.moduleCount} modules
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" /> {course.durationMinutes}{" "}
                    minutes
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <User className="h-4 w-4" /> {course.instructor.firstName}{" "}
                    {course.instructor.lastName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />{" "}
                    {formatDate(course.createdAt)}
                  </div>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[10px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
