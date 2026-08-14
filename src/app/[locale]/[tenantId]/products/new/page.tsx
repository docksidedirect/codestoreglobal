"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage({ params }: { params: { locale: string; tenantId: string } }) {
  const { locale, tenantId } = params;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    alert("Product creation is a placeholder in this demo.");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href={`/${locale}/${tenantId}/marketplace`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Marketplace</Link>
      <Card>
        <CardHeader><CardTitle>Upload New Product</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label>Name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Description</Label><textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
            <div><Label>Price (USD)</Label><Input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} /></div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Uploading..." : "Upload Product"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
