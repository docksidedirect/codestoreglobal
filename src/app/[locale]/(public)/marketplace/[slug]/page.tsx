import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  ArrowLeft,
  Tag,
  User,
  Calendar,
  Package,
  Star,
  Download,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { generateOpenGraph } from "@/components/seo/open-graph";
import { BuyButton } from "@/components/marketplace/buy-button";
import {
  BreadcrumbSchema,
  StructuredData,
} from "@/components/seo/structured-data";
import {
  locales,
  MARKETPLACE_CATEGORIES,
  getCategoryBySlug,
} from "@/lib/marketplace-categories";

export const revalidate = 60;

interface Params {
  params: { locale: string; slug: string };
}

function getCategorySlug(category: string): string {
  return (
    MARKETPLACE_CATEGORIES.find((c) => c.value === category)?.slug ||
    "templates"
  );
}

function getCategoryLabel(category: string, locale: string): string {
  const cat = getCategoryBySlug(getCategorySlug(category));
  if (!cat) return category.replace("_", " ");
  return (cat.labels as any)[locale] || cat.labels.en;
}

// Localized FAQ — unique content per product page for SEO + buyers
const FAQS: Record<string, { q: string; a: string }[]> = {
  en: [
    {
      q: "What exactly do I get when I buy this product?",
      a: "You get instant access to the complete source code, lifetime updates, and the seller's documentation. Everything listed on this page is included in a single purchase.",
    },
    {
      q: "How do I receive my purchase?",
      a: "Right after checkout you get the download link and access instructions by email and on your dashboard. Delivery is automated — no waiting.",
    },
    {
      q: "What if the product doesn't work for me?",
      a: "Every purchase is covered by buyer protection through our escrow payment system. Contact support within 14 days and we'll help resolve it or issue a refund.",
    },
  ],
  ar: [
    {
      q: "ماذا أحصل عليه عند شراء هذا المنتج؟",
      a: "تحصل فوراً على كود المصدر الكامل وتحديثات مدى الحياة وتوثيق البائع. كل ما هو مذكور في هذه الصفحة مشمول في عملية الشراء الواحدة.",
    },
    {
      q: "كيف أستلم مشترياتي؟",
      a: "بعد الدفع مباشرة تحصل على رابط التحميل وتعليمات الوصول عبر البريد ولوحة التحكم. التسليم آلي — بدون انتظار.",
    },
    {
      q: "ماذا لو لم ينجح المنتج معي؟",
      a: "كل عملية شراء محمية عبر نظام الدفع الآمن. تواصل مع الدعم خلال 14 يوماً وسنساعد في الحل أو نصدر استرداداً.",
    },
  ],
  fr: [
    {
      q: "Qu'est-ce que je reçois exactement en achetant ce produit ?",
      a: "Vous obtenez instantanément le code source complet, les mises à jour à vie et la documentation du vendeur. Tout ce qui est listé sur cette page est inclus dans un seul achat.",
    },
    {
      q: "Comment je reçois mon achat ?",
      a: "Juste après le paiement, vous recevez le lien de téléchargement et les instructions par e-mail et sur votre tableau de bord. La livraison est automatisée — sans attente.",
    },
    {
      q: "Et si le produit ne me convient pas ?",
      a: "Chaque achat est protégé par notre système de paiement séquestre. Contactez le support sous 14 jours et nous vous aiderons à résoudre le problème ou émettrons un remboursement.",
    },
  ],
  de: [
    {
      q: "Was genau erhalte ich beim Kauf dieses Produkts?",
      a: "Sie erhalten sofort den vollständigen Quellcode, lebenslange Updates und die Dokumentation des Verkäufers. Alles auf dieser Seite ist im Einzelkauf enthalten.",
    },
    {
      q: "Wie erhalte ich meinen Kauf?",
      a: "Direkt nach dem Checkout erhalten Sie den Download-Link und Zugangshinweise per E-Mail und auf Ihrem Dashboard. Die Lieferung ist automatisiert — ohne Wartezeit.",
    },
    {
      q: "Was tun, wenn das Produkt nicht funktioniert?",
      a: "Jeder Kauf ist durch unser Treuhand-Zahlungssystem geschützt. Kontaktieren Sie den Support innerhalb von 14 Tagen und wir helfen bei der Lösung oder erstatten den Kauf.",
    },
  ],
  es: [
    {
      q: "¿Qué recibo exactamente al comprar este producto?",
      a: "Recibes al instante el código fuente completo, actualizaciones de por vida y la documentación del vendedor. Todo lo listado en esta página está incluido en una sola compra.",
    },
    {
      q: "¿Cómo recibo mi compra?",
      a: "Justo después del pago recibes el enlace de descarga y las instrucciones por correo y en tu panel. La entrega es automática — sin esperas.",
    },
    {
      q: "¿Y si el producto no me funciona?",
      a: "Cada compra está protegida por nuestro sistema de pagos en fideicomiso. Contacta al soporte dentro de 14 días y te ayudaremos a resolverlo o emitiremos un reembolso.",
    },
  ],
};

export async function generateMetadata({ params }: Params) {
  const { locale, slug } = params;
  const product = await prisma.product.findFirst({
    where: { slug },
    select: {
      name: true,
      shortDesc: true,
      description: true,
      price: true,
      currency: true,
      category: true,
      imageUrls: true,
    },
  });

  if (!product) return {};

  // Only http(s) images work for social scrapers — ignore base64 data URLs
  const images = (
    Array.isArray(product.imageUrls) ? product.imageUrls : []
  ).filter((u): u is string => typeof u === "string" && u.startsWith("http"));
  const ogImage = images[0];

  const label = getCategoryLabel(product.category, locale);
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
  }).format(Number(product.price));

  const titleMap: Record<string, string> = {
    en: `Buy ${product.name} — ${price} | ${label} | CODESTORE GLOBAL`,
    ar: `اشترِ ${product.name} — ${price} | ${label} | CODESTORE GLOBAL`,
    fr: `Achetez ${product.name} — ${price} | ${label} | CODESTORE GLOBAL`,
    de: `${product.name} kaufen — ${price} | ${label} | CODESTORE GLOBAL`,
    es: `Compra ${product.name} — ${price} | ${label} | CODESTORE GLOBAL`,
  };

  return generateOpenGraph({
    title: titleMap[locale] || titleMap.en,
    description: (product.shortDesc || product.description).slice(0, 160),
    url: `https://codestore.global/${locale}/marketplace/${slug}`,
    locale,
    type: "article",
    image: ogImage,
  });
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: Params & { searchParams: { purchased?: string; payment?: string } }) {
  const { locale, slug } = params;

  const product = await prisma.product.findFirst({
    where: { slug },
    include: {
      seller: { select: { firstName: true, lastName: true, bio: true } },
      tenant: { select: { name: true } },
    },
  });

  if (!product) notFound();

  const [related, categorySlug] = [
    await prisma.product.findMany({
      where: {
        isActive: true,
        category: product.category,
        NOT: { id: product.id },
      },
      orderBy: { salesCount: "desc" },
      take: 3,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        imageUrls: true,
        shortDesc: true,
      },
    }),
    getCategorySlug(product.category),
  ];

  const tags = (Array.isArray(product.tags) ? product.tags : []).filter(
    (t): t is string => typeof t === "string",
  );
  const allImages = (
    Array.isArray(product.imageUrls) ? product.imageUrls : []
  ).filter((u): u is string => typeof u === "string");
  const absoluteImages = allImages.filter((u) => u.startsWith("http"));
  const schemaImages =
    absoluteImages.length > 0
      ? absoluteImages
      : ["https://codestore.global/og-default.jpg"];
  const faqs = FAQS[locale] || FAQS.en;
  const label = getCategoryLabel(product.category, locale);
  const validThrough = new Date(
    Date.now() + 365 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const breadcrumbItems = [
    { name: "Home", url: `https://codestore.global/${locale}` },
    {
      name: "Marketplace",
      url: `https://codestore.global/${locale}/marketplace`,
    },
    {
      name: label,
      url: `https://codestore.global/${locale}/marketplace/category/${categorySlug}`,
    },
    {
      name: product.name,
      url: `https://codestore.global/${locale}/marketplace/${slug}`,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <BreadcrumbSchema items={breadcrumbItems} />
      <StructuredData
        type="Product"
        data={{
          name: product.name,
          description: product.description.slice(0, 5000),
          image: schemaImages,
          sku: product.slug,
          category: label,
          brand: { "@type": "Brand", name: product.tenant.name },
          url: `https://codestore.global/${locale}/marketplace/${slug}`,
          offers: {
            "@type": "Offer",
            url: `https://codestore.global/${locale}/marketplace/${slug}`,
            price: Number(product.price),
            priceCurrency: product.currency,
            priceValidUntil: validThrough,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: {
              "@type": "Organization",
              name: product.tenant.name,
            },
          },
          ...(product.rating
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: Number(product.rating),
                  reviewCount: Math.max(product.salesCount, 1),
                },
              }
            : {}),
        }}
      />
      <StructuredData
        type="FAQPage"
        data={{
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
        {searchParams?.purchased && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            Payment successful — your purchase is complete. Download access is
            being prepared by the seller.
          </div>
        )}
        {searchParams?.payment === "failed" && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            Payment failed — please try again.
          </div>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}/marketplace`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shrink-0 overflow-hidden">
                {allImages[0] ? (
                  <img
                    src={allImages[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-10 w-10" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Link
                    href={`/${locale}/marketplace/category/${categorySlug}`}
                  >
                    <Badge
                      variant="secondary"
                      className="text-xs hover:bg-violet-100 dark:hover:bg-violet-950 cursor-pointer"
                    >
                      {label}
                    </Badge>
                  </Link>
                  <Badge variant="outline" className="text-xs">
                    v{product.version || "1.0.0"}
                  </Badge>
                  {product.isActive && (
                    <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      Active
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  {product.name}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  by {product.seller.firstName} {product.seller.lastName} ·{" "}
                  {product.tenant.name}
                </p>
              </div>
            </div>

            {/* Real image gallery (base64 images render instantly) */}
            {allImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allImages.slice(0, 6).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${product.name} screenshot ${i + 1}`}
                    className="h-36 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                    loading="lazy"
                  />
                ))}
              </div>
            )}

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
                {product.shortDesc && (
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 italic">
                    {product.shortDesc}
                  </p>
                )}
              </CardContent>
            </Card>

            {product.changelog && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Changelog</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {product.changelog}
                  </p>
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

            {/* FAQ — visible content matching the FAQPage schema */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((f) => (
                  <div key={f.q}>
                    <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                      {f.q}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {f.a}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <div className="h-2 w-full bg-gradient-to-r from-violet-500 to-indigo-500" />
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(Number(product.price))}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {product.salesCount} sales
                  </p>
                </div>
                <BuyButton
                  productId={product.id}
                  locale={locale}
                  className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                />
                {product.demoUrl && (
                  <Button variant="outline" className="w-full h-11" asChild>
                    <a
                      href={product.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-2" /> Live Demo
                    </a>
                  </Button>
                )}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <User className="h-4 w-4" /> {product.seller.firstName}{" "}
                    {product.seller.lastName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />{" "}
                    {formatDate(product.createdAt)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Package className="h-4 w-4" /> {label}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Star className="h-4 w-4" /> v{product.version || "1.0.0"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related products — internal linking for SEO + discovery */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              More {label} you may like
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.map((p) => {
                const imgs = (
                  Array.isArray(p.imageUrls) ? p.imageUrls : []
                ).filter((u): u is string => typeof u === "string");
                return (
                  <Link
                    key={p.id}
                    href={`/${locale}/marketplace/${p.slug}`}
                    className="group block"
                  >
                    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900">
                      <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 h-36 flex items-center justify-center">
                        {imgs[0] ? (
                          <img
                            src={imgs[0]}
                            alt={p.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <ShoppingBag className="h-10 w-10 text-slate-400" />
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 line-clamp-1">
                          {p.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {formatCurrency(Number(p.price))}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
