"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Flame } from "lucide-react";
import Link from "next/link";

export default function NewJobPage({
  params,
}: {
  params: { locale: string; tenantId: string };
}) {
  const { locale, tenantId } = params;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(true);
  const [deadline, setDeadline] = useState("");
  const [skills, setSkills] = useState("");
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/tenant/${tenantId}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          requirements,
          budgetMin: budgetMin || null,
          budgetMax: budgetMax || null,
          location,
          isRemote,
          deadline: deadline || null,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          featured,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server error ${res.status}: ${text.slice(0, 150) || res.statusText}`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to post job");
      }

      router.push(`/${locale}/${tenantId}/jobs`);
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
        href={`/${locale}/${tenantId}/jobs`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Jobs
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Job Title</Label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Next.js Developer"
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="What is the project? What will the freelancer do?"
              />
            </div>
            <div>
              <Label>Requirements</Label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Experience, skills, portfolio requirements..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Budget Min (USD)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                />
              </div>
              <div>
                <Label>Budget Max (USD)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Global, Riyadh, Berlin"
                />
              </div>
              <div>
                <Label>Application Deadline</Label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Skills (comma separated)</Label>
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Next.js, Prisma, TypeScript"
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
                className="h-4 w-4 accent-violet-600"
              />
              This is a remote position
            </label>

            {/* Featured placement — monetization */}
            <div
              className={`rounded-xl border p-4 cursor-pointer transition-colors ${
                featured
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
                  : "border-slate-200 dark:border-slate-800 hover:border-amber-300"
              }`}
              onClick={() => setFeatured(!featured)}
            >
              <div className="flex items-start gap-3">
                <Flame className={`h-5 w-5 mt-0.5 ${featured ? "text-amber-500" : "text-slate-400"}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">Feature this job — $19 / 7 days</p>
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={() => setFeatured(!featured)}
                      className="h-4 w-4 accent-amber-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Pinned to the top of the jobs board, highlighted with a Featured badge, and
                    shown first on the public jobs page (codestore.global/jobs) for 7 days.
                  </p>
                </div>
              </div>
            </div>

            {featured && (
              <div className="text-xs rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-slate-600 dark:text-slate-400">
                Note: featured placement is recorded instantly. Collect the $19 fee via your
                PayPal account — automated billing can be enabled in a future update.
              </div>
            )}

            {error && (
              <div className="text-sm text-red-500 font-medium">{error}</div>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Posting..." : featured ? "Post Job — $19 Featured" : "Post Job (Free)"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
