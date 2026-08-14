"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function TenantMarketplacePage({ params }: { params: { tenantId: string } }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tenant/${params.tenantId}/dashboard`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setProducts(d.data?.recentProducts || []); setLoading(false); });
  }, [params.tenantId]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Marketplace</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <Card key={p.id} className="flex flex-col">
            <CardHeader>
              <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center"><ShoppingBag className="h-8 w-8 text-muted-foreground" /></div>
              <CardTitle className="text-lg">{p.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">{p.category?.replace("_", " ") || "PRODUCT"}</Badge>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1"><Tag className="h-3 w-3" /> v{p.version || "1.0.0"}</span>
                <span className="font-bold">{formatCurrency(Number(p.price))}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
