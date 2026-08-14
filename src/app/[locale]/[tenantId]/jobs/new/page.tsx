"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewJobPage({ params }: { params: { locale: string; tenantId: string } }) {
  const { locale, tenantId } = params;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    alert("Job posting is a placeholder in this demo.");
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
            <div><Label>Budget (USD)</Label><Input type="number" required value={budget} onChange={(e) => setBudget(e.target.value)} /></div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Posting..." : "Post Job"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
