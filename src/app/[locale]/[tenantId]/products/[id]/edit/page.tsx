"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "SAAS_TOOL", label: "SaaS Tool" },
  { value: "COMPONENT_LIBRARY", label: "Component Library" },
  { value: "TEMPLATE", label: "Template" },
  { value: "PLUGIN", label: "Plugin" },
  { value: "API_SERVICE", label: "API Service" },
  { value: "EBOOK", label: "E-Book" },
  { value: "COURSE_BUNDLE", label: "Course Bundle" },
] as const;

export default function EditProductPage({ params }: { params: { locale: string; tenantId: string; id: string } }) {
  const { locale, tenantId, id } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", shortDesc: "", description: "", price: "", category: "", downloadUrl: "", demoUrl: "", imageUrls: [] as string[] });

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const p = data.product;
          setForm({ name: p.name || "", shortDesc: p.shortDesc || "", description: p.description || "", price: p.price?.toString() || "", category: p.category || "", downloadUrl: p.downloadUrl || "", demoUrl: p.demoUrl || "", imageUrls: (p.imageUrls as string[]) || [] });
        } else setError(data.error || "Failed to load product");
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  function handleImageAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, reader.result as string] }));
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function removeImage(idx: number) { setForm((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== idx) })); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Update failed");
      router.push(`/${locale}/${tenantId}/products/${id}`); router.refresh();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  }

  async function onDelete() {
    if (!confirm("Are you sure you want to delete this product? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");
      router.push(`/${locale}/${tenantId}/marketplace`); router.refresh();
    } catch (err: any) { setError(err.message); } finally { setDeleting(false); }
  }

  if (loading) return <div className="max-w-2xl mx-auto p-8 text-sm text-muted-foreground">Loading product...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href={`/${locale}/${tenantId}/products/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Product</Link>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Edit Product</CardTitle><Button variant="destructive" size="sm" onClick={onDelete} disabled={deleting}><Trash2 className="h-4 w-4 mr-1" /> {deleting ? "Deleting..." : "Delete"}</Button></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Short Description</Label><Input value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} placeholder="Brief tagline shown on cards" /></div>
            <div><Label>Description</Label><textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
            <div><Label>Category</Label><select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="" disabled>Select a category</option>{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
            <div><Label>Price (USD)</Label><Input type="number" step="0.01" min="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div><Label>Download URL</Label><Input type="url" value={form.downloadUrl} onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })} placeholder="https://..." /></div>
            <div><Label>Demo URL</Label><Input type="url" value={form.demoUrl} onChange={(e) => setForm({ ...form, demoUrl: e.target.value })} placeholder="https://..." /></div>
            <div><Label>Product Images</Label><Input type="file" accept="image/*" multiple onChange={handleImageAdd} className="mt-1" /><div className="grid grid-cols-3 gap-2 mt-2">{form.imageUrls.map((url, i) => (<div key={i} className="relative group"><img src={url} alt="" className="h-24 w-full object-cover rounded-md border" /><button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">&times;</button></div>))}</div></div>
            {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
            <Button type="submit" disabled={saving} className="w-full">{saving ? "Saving..." : "Save Changes"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}