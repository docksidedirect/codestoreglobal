"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Tag, Pencil, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function ProductsPage({ params }: { params: { locale: string; tenantId: string } }) {
  const { locale, tenantId } = params;
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tenant/${tenantId}/dashboard`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setProducts(d.data?.recentProducts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tenantId]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your digital products and offerings</p>
        </div>
        <Link href={`/${locale}/${tenantId}/products/new`}><Button>Upload Product</Button></Link>
      </div>

      {products.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>No products yet. Upload your first product to get started.</p>
        </CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <CardHeader>
                <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center overflow-hidden">
                  {p.imageUrls && Array.isArray(p.imageUrls) && p.imageUrls.length > 0 ? (
                    <img src={p.imageUrls[0]} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <CardTitle className="text-lg">{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">{p.category?.replace("_", " ") || "PRODUCT"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.shortDesc || p.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1"><Tag className="h-3 w-3" /> v{p.version || "1.0.0"}</span>
                  <span className="font-bold">{formatCurrency(Number(p.price))}</span>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Link href={`/${locale}/${tenantId}/products/${p.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1"><Eye className="h-3 w-3" /> View</Button>
                  </Link>
                  {user?.id === p.sellerId && (
                    <Link href={`/${locale}/${tenantId}/products/${p.id}/edit`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full gap-1"><Pencil className="h-3 w-3" /> Edit</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}