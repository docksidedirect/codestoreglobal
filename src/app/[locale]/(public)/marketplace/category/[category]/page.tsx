import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingBag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { generateOpenGraph } from "@/components/seo/open-graph";
import { BreadcrumbSchema, StructuredData } from "@/components/seo/structured-data";
import { getCategoryBySlug, MARKETPLACE_CATEGORIES } from "@/lib/marketplace-categories";

export const revalidate = 60;

interface Params {
  params: { locale: string; category: string };
}


export async function generateMetadata({ params }: Params) {
  const { locale, category: categorySlug } = params;
  const cat = getCategoryBySlug(categorySlug);
  if (!cat) return {};

  const label = (cat.labels as any)[locale] || cat.labels.en;
  const siteName: Record<string, string> = {
    en: "CODESTORE GLOBAL Marketplace",
    ar: "سوق CODESTORE GLOBAL",
    fr: "Place de Marché CODESTORE GLOBAL",
    de: "CODESTORE GLOBAL Marktplatz",
    es: "Mercado CODESTORE GLOBAL",
  };
  const action: Record<string, string> = {
    en: "Buy", ar: "اشترِ", fr: "Achetez", de: "Kaufen", es: "Compra",
  };

  return generateOpenGraph({
    title: `${label} — ${action[locale] || action.en} ${label} Online | ${siteName[locale] || siteName.en}`,
    description: (cat.intro as any)[locale] || cat.intro.en,
    url: `https://codestore.global/${locale}/marketplace/category/${categorySlug}`,
    locale,
  });
}

export default async function CategoryPage({ params }: Params) {
  const { locale, category: categorySlug } = params;
  const cat = getCategoryBySlug(categorySlug);
  if (!cat) notFound();

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, category: cat.value },
      orderBy: { createdAt: "desc" },
      take: 48,
      include: {
        seller: { select: { firstName: true, lastName: true } },
        tenant: { select: { name: true, slug: true } },
      },
    }),
    prisma.product.count({ where: { isActive: true, category: cat.value } }),
  ]);

  const label = (cat.labels as any)[locale] || cat.labels.en;
  const intro = (cat.intro as any)[locale] || cat.intro.en;

  const breadcrumbItems = [
    { name: "Home", url: `https://codestore.global/${locale}` },
    { name: "Marketplace", url: `https://codestore.global/${locale}/marketplace` },
    { name: label, url: `https://codestore.global/${locale}/marketplace/category/${categorySlug}` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <BreadcrumbSchema items={breadcrumbItems} />
      <StructuredData
        type="WebPage"
        data={{
          name: label,
          description: intro,
          url: `https://codestore.global/${locale}/marketplace/category/${categorySlug}`,
          isPartOf: { "@type": "WebSite", name: "CODESTORE GLOBAL", url: "https://codestore.global" },
        }}
      />
      <StructuredData
        type="Product"
        data={{
          // ItemList via mainEntity so Google sees the listing
          mainEntity: {
            "@type": "ItemList",
            itemListElement: products.slice(0, 10).map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Product",
                name: p.name,
                url: `https://codestore.global/${locale}/marketplace/${p.slug}`,
                offers: {
                  "@type": "Offer",
                  price: Number(p.price),
                  priceCurrency: p.currency,
                  availability: "https://schema.org/InStock",
                },
              },
            })),
          },
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}/marketplace`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>

        <div className="mb-10 max-w-3xl">
          <Badge variant="outline" className="mb-3 text-xs font-medium">{totalCount} {totalCount === 1 ? "product" : "products"}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {label}
          </h1>
          {/* Unique localized copy — the core of programmatic SEO */}
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{intro}</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
            <p>No products in this category yet. Check back soon.</p>
            <Link href={`/${locale}/marketplace`} className="mt-4 inline-block text-violet-600 dark:text-violet-400 hover:underline">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const rawImages = product.imageUrls as string[] | null;
              const productImgSrc =
                Array.isArray(rawImages) && rawImages.length > 0 ? rawImages[0] : null;

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
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          {formatCurrency(Number(product.price))}
                        </span>
                        {product.salesCount > 0 && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">{product.salesCount} sales</span>
                        )}
                      </div>
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-2">
                        {product.name}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {product.shortDesc || product.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>by {product.seller?.firstName || "Seller"} {product.seller?.lastName || ""}</span>
                        <span className="flex items-center gap-0.5 font-medium text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Cross-category internal linking */}
        <div className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-10">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Browse all categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {MARKETPLACE_CATEGORIES.map((c) => (
              <Link
                key={c.value}
                href={`/${locale}/marketplace/category/${c.slug}`}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  c.slug === categorySlug
                    ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                    : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-violet-400"
                }`}
              >
                {(c.labels as any)[locale] || c.labels.en}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
