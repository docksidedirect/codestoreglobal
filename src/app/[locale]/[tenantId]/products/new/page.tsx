"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
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

// ✅ FIX 1: Compress image to max 1280px JPEG before base64 (~5MB photo → ~150-400KB)
function fileToDataUrl(
  file: File,
  maxDim = 1280,
  quality = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas
          .getContext("2d")!
          .drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

export default function NewProductPage({
  params,
}: {
  params: { locale: string; tenantId: string };
}) {
  const { locale, tenantId } = params;
  const router = useRouter();
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ FIX 1: compress each file instead of raw readAsDataURL
  async function handleImageAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setError("");

    try {
      const compressed = await Promise.all(
        Array.from(files).map((f) => fileToDataUrl(f)),
      );
      setImageUrls((prev) => [...prev, ...compressed]);
    } catch {
      setError(
        "Failed to process one or more images. Please try different files.",
      );
    }
    e.target.value = "";
  }

  function removeImage(idx: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          shortDesc,
          price,
          category,
          tenantId,
          downloadUrl,
          demoUrl,
          imageUrls,
        }),
      });

      // ✅ FIX 2: read text first, parse safely — never crash on plain-text errors
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server error ${res.status}: ${text.slice(0, 150) || res.statusText}`,
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create product");
      }

      router.push(`/${locale}/${tenantId}/marketplace`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link
        href={`/${locale}/${tenantId}/marketplace`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Upload New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label>Short Description</Label>
              <Input
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Brief tagline shown on cards"
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <Label>Category</Label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Price (USD)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <Label>Download URL</Label>
              <Input
                type="url"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Demo URL</Label>
              <Input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Product Images</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageAdd}
                className="mt-1"
              />
              <div className="grid grid-cols-3 gap-2 mt-2">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt=""
                      className="h-24 w-full object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 font-medium">{error}</div>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Uploading..." : "Upload Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
