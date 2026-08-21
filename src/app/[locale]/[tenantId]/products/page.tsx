"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface PageProps {
  params: any; // Kept flexible to accept both Promise and standard objects safely
}

export default function TenantMarketplacePage({ params }: PageProps) {
  // SAFELY UNWRAP: Check if params is a Promise. If it is, use(params). If not, read it directly.
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
        setProducts(d.data?.recentProducts || []);
        setLoading(false);
      });
  }, [tenantId]);

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
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/${locale}/${tenantId}/products/${p.id}`}
            className="block group"
          >
            <Card className="flex flex-col h-full hover:shadow-lg transition-all cursor-pointer border group-hover:border-primary/50">
              <CardHeader>
                <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center overflow-hidden">
                  {p.imageUrls &&
                  Array.isArray(p.imageUrls) &&
                  p.imageUrls.length > 0 ? (
                    <img
                      src={p.imageUrls[0]}
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
        ))}
      </div>
    </div>
  );
}
