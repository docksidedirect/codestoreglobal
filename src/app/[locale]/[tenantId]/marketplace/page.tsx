"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface PageProps {
  params: any;
}

export default function TenantMarketplacePage({ params }: PageProps) {
  // Safe Next.js Async/Sync Params parser
  const resolvedParams =
    params instanceof Promise || (params && typeof params.then === "function")
      ? use(params)
      : params;

  const locale = resolvedParams?.locale;
  const tenantId = resolvedParams?.tenantId;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    fetch(`/api/tenant/${tenantId}/dashboard`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.data?.recentProducts || d.data?.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenantId]);

  // Helper function to extract a valid image source dynamically
  const getProductImage = (p: any): string | null => {
    // 1. Try p.imageUrls (Array or String)
    if (p.imageUrls) {
      if (Array.isArray(p.imageUrls) && p.imageUrls.length > 0)
        return p.imageUrls[0];
      if (typeof p.imageUrls === "string" && p.imageUrls.trim() !== "")
        return p.imageUrls;
    }
    // 2. Try alternate database field schemas
    if (p.images) {
      if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
      if (typeof p.images === "string" && p.images.trim() !== "")
        return p.images;
    }
    if (typeof p.imageUrl === "string" && p.imageUrl.trim() !== "")
      return p.imageUrl;
    if (typeof p.coverImage === "string" && p.coverImage.trim() !== "")
      return p.coverImage;

    return null;
  };

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Marketplace</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => {
          const productImgSrc = getProductImage(p);

          return (
            <Link
              key={p.id}
              href={`/${locale}/${tenantId}/products/${p.id}`}
              className="block group"
            >
              <Card className="flex flex-col h-full hover:shadow-lg transition-all cursor-pointer border group-hover:border-primary/50">
                <CardHeader>
                  <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center overflow-hidden">
                    {productImgSrc ? (
                      <img
                        src={productImgSrc}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {p.category?.replace("_", " ") || "PRODUCT"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {p.shortDesc || ""}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3 w-3" /> v{p.version || "1.0.0"}
                    </span>
                    <span className="font-bold">
                      {formatCurrency(Number(p.price))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
