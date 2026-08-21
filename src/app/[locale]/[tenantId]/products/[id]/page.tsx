import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export default async function ProductDetailPage({
  params,
}: {
  params: { locale: string; tenantId: string; id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      seller: { select: { firstName: true, lastName: true } },
    },
  });

  if (!product || product.tenantId !== params.tenantId) {
    notFound();
  }

  const images = (product.imageUrls as string[]) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href={`/${params.locale}/${params.tenantId}/marketplace`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${product.name} screenshot ${i + 1}`}
                  className="rounded-lg border object-cover w-full h-48"
                />
              ))}
            </div>
          ) : (
            <div className="h-64 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground">
              No images
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            {product.shortDesc && (
              <p className="text-muted-foreground mt-1">{product.shortDesc}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              {product.category.replace("_", " ")}
            </Badge>
            <span className="text-2xl font-bold">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {product.description}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {product.demoUrl && (
              <Button asChild variant="outline" size="sm">
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> Live Demo
                </a>
              </Button>
            )}
            {product.downloadUrl && (
              <Button asChild size="sm">
                <a
                  href={product.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-1" /> Download
                </a>
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground pt-4 border-t">
            Sold by {product.seller.firstName} {product.seller.lastName} •
            Version {product.version || "1.0.0"}
          </div>
        </div>
      </div>
    </div>
  );
}
