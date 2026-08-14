import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, Tag, User, Calendar, Package, Star, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { generateOpenGraph } from "@/components/seo/open-graph";
import { BreadcrumbSchema, StructuredData } from "@/components/seo/structured-data";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = params;
  const product = await prisma.product.findFirst({
    where: { slug },
    select: { name: true, description: true, price: true, category: true },
  });

  if (!product) return {};

  const titleMap: Record<string, string> = {
    en: `${product.name} - ${product.category.replace("_", " ")} | CODESTORE GLOBAL Marketplace`,
    ar: `${product.name} - ${product.category.replace("_", " ")} | سوق CODESTORE GLOBAL`,
    fr: `${product.name} - ${product.category.replace("_", " ")} | Place de Marché CODESTORE GLOBAL`,
    de: `${product.name} - ${product.category.replace("_", " ")} | CODESTORE GLOBAL Marktplatz`,
    es: `${product.name} - ${product.category.replace("_", " ")} | Mercado CODESTORE GLOBAL`,
  };

  return generateOpenGraph({
    title: titleMap[locale] || titleMap.en,
    description: product.description.slice(0, 160),
    url: `https://codestore.global/${locale}/marketplace/${slug}`,
    locale,
    type: "article",
  });
}

export default async function ProductDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = params;

  const product = await prisma.product.findFirst({
    where: { slug },
    include: {
      seller: { select: { firstName: true, lastName: true, bio: true } },
      tenant: { select: { name: true } },
    },
  });

  if (!product) notFound();

  const tags = (Array.isArray(product.tags) ? product.tags : []).filter((t): t is string => typeof t === "string");

  const breadcrumbItems = [
    { name: "Home", url: `https://codestore.global/${locale}` },
    { name: "Marketplace", url: `https://codestore.global/${locale}/marketplace` },
    { name: product.name, url: `https://codestore.global/${locale}/marketplace/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <BreadcrumbSchema items={breadcrumbItems} />
      <StructuredData
        type="Product"
        data={{
          name: product.name,
          description: product.description,
          image: "https://codestore.global/product-placeholder.jpg",
          sku: product.slug,
          brand: {
            "@type": "Brand",
            name: product.tenant.name,
          },
          offers: {
            "@type": "Offer",
            url: `https://codestore.global/${locale}/marketplace/${slug}`,
            price: Number(product.price),
            priceCurrency: product.currency,
            availability: "https://schema.org/InStock",
            seller: {
              "@type": "Person",
              name: `${product.seller.firstName} ${product.seller.lastName}`,
            },
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(product.rating || 4.5),
            reviewCount: product.salesCount,
          },
        }}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href={`/${locale}/marketplace`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                <Package className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">{product.category.replace("_", " ")}</Badge>
                  <Badge variant="outline" className="text-xs">v{product.version || "1.0.0"}</Badge>
                  {product.isActive && <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Active</Badge>}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">{product.name}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">by {product.seller.firstName} {product.seller.lastName} · {product.tenant.name}</p>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                {product.shortDesc && (
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 italic">{product.shortDesc}</p>
                )}
              </CardContent>
            </Card>

            {product.changelog && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Changelog</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{product.changelog}</p>
                </CardContent>
              </Card>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs gap-1">
                    <Tag className="h-3 w-3" /> {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <div className="h-2 w-full bg-gradient-to-r from-violet-500 to-indigo-500" />
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(Number(product.price))}</p>
                  <p className="text-xs text-slate-500 mt-1">{product.salesCount} sales</p>
                </div>
                <Button className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                  <ShoppingBag className="h-4 w-4 mr-2" /> Buy Now
                </Button>
                {product.demoUrl && (
                  <Button variant="outline" className="w-full h-11">
                    <Download className="h-4 w-4 mr-2" /> Live Demo
                  </Button>
                )}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <User className="h-4 w-4" /> {product.seller.firstName} {product.seller.lastName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" /> {formatDate(product.createdAt)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Package className="h-4 w-4" /> {product.category.replace("_", " ")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Star className="h-4 w-4" /> v{product.version || "1.0.0"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
