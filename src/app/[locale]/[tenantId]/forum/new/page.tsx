"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewThreadPage({ params }: { params: { locale: string; tenantId: string } }) {
  const { locale, tenantId } = params;
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/tenant/${tenantId}/forum/categories`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setCategories(d.categories || []); if (d.categories?.[0]) setCategoryId(d.categories[0].id); });
  }, [tenantId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const res = await fetch(`/api/tenant/${tenantId}/forum/threads`, {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, content, categoryId }),
    });
    setLoading(false);
    if (res.ok) { const d = await res.json(); router.push(`/${locale}/${tenantId}/forum/thread/${d.thread.id}`); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href={`/${locale}/${tenantId}/forum`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Forum</Link>
      <Card>
        <CardHeader><CardTitle>Create New Thread</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label>Category</Label><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><Label>Title</Label><Input required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><Label>Content</Label><textarea required value={content} onChange={(e) => setContent(e.target.value)} className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Create Thread"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
