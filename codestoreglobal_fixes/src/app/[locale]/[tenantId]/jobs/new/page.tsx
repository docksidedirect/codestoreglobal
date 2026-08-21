"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewJobPage({ params }: { params: { locale: string; tenantId: string } }) {
  const { locale, tenantId } = params;
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, requirements, budgetMin, budgetMax, tenantId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to post job");
      router.push(`/${locale}/${tenantId}/jobs`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href={`/${locale}/${tenantId}/jobs`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Jobs</Link>
      <Card>
        <CardHeader><CardTitle>Post a New Job</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label>Title</Label><Input required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><Label>Description</Label><textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
            <div><Label>Requirements</Label><textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Budget Min (USD)</Label><Input type="number" step="0.01" min="0" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} /></div>
              <div><Label>Budget Max (USD)</Label><Input type="number" step="0.01" min="0" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} /></div>
            </div>
            {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Posting..." : "Post Job"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
