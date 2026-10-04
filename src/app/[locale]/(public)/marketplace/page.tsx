import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { generateOpenGraph } from "@/components/seo/open-graph";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace-categories";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const titles: Record<string, string> = {
    en: "SaaS Marketplace | CODESTORE GLOBAL",
    ar: "سوق SaaS | CODESTORE GLOBAL",
    fr: "Place de Marché SaaS | CODESTORE GLOBAL",
    de: "SaaS-Marktplatz | CODESTORE GLOBAL",
    es: "Mercado SaaS | CODESTORE GLOBAL",
  };
  const descriptions: Record<string, string> = {
    en: "Buy and sell premium SaaS components, templates, API services and developer tools. Secure escrow payments and verified sellers.",
    ar: "اشترِ وبيع مكونات SaaS المتميزة والقوالب وخدمات API وأدوات المطورين. مدفوعات الضمان الآمنة والبائعين المعتمدين.",
    fr: "Achetez et vendez des composants SaaS premium, des modèles, des services API et des outils de développement. Paiements séquestre sécurisés et vendeurs vérifiés.",
    de: "Kaufen und verkaufen Sie Premium-SaaS-Komponenten, Vorlagen, API-Dienste und Entwicklertools. Sichere Treuhandzahlungen und verifizierte Verkäufer.",
    es: "Compra y vende componentes SaaS premium, plantillas, servicios API y herramientas de desarrollo. Pagos en fideicomiso seguros y vendedores verificado.",
  };

  return generateOpenGraph({
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    url: `https://codestoreglobal.com/${locale}/marketplace`,
    locale,
    type: "website",
  });
}

export default async function MarketplacePage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      seller: { select: { firstName: true, lastName: true } },
      tenant: { select: { name: true, slug: true } },
    },
  });

  const breadcrumbItems = [
    { name: "Home", url: `https://codestoreglobal.com/${locale}` },
    {
      name: "Marketplace",
      url: `https://codestoreglobal.com/${locale}/marketplace`,
    },
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
            Marketplace
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            SaaS Marketplace
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Buy and sell components, templates, API services, and developer
            tools from verified creators.
          </p>
        </div>

        {/* Category internal links for SEO */}
        <div className="flex flex-wrap gap-2 mb-10">
          {MARKETPLACE_CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={`/${locale}/marketplace/category/${c.slug}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 hover:border-violet-300 hover:text-violet-600 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-violet-400"
            >
              {(c.labels as any)[locale] || c.labels.en}
            </Link>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const tags = (Array.isArray(product.tags) ? product.tags : [])
              .filter((t): t is string => typeof t === "string")
              .slice(0, 3);

            // ✅ Safe Type Assertion for Prisma JSON array types
            const rawImages = product.imageUrls as string[] | null;
            const productImgSrc =
              Array.isArray(rawImages) && rawImages.length > 0
                ? rawImages[0]
                : null;

            return (
              <Link
                key={product.id}
                href={`/${locale}/marketplace/${product.slug}`}
                className="group block"
              >
                <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-slate-900/50">
                  <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 h-48 flex items-center justify-center">
                    {productImgSrc ? (
                      <img
                        src={productImgSrc}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <ShoppingBag className="h-12 w-12 text-slate-400 group-hover:text-violet-500 transition-colors duration-300" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                        {product.category.replace("_", " ")}
                      </span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatCurrency(Number(product.price))}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                      {product.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        by {product.seller?.firstName || "Admin"}{" "}
                        {product.seller?.lastName || ""}
                      </span>
                      <span className="flex items-center gap-0.5 font-medium text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
