"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Flame } from "lucide-react";
import Link from "next/link";

export default function JobsPage({ params }: { params: { locale: string; tenantId: string } }) {
  const { locale, tenantId } = params;
  const t = useTranslations();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tenant/${tenantId}/jobs`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setJobs(d.jobs || []); setLoading(false); });
  }, [tenantId]);

  if (loading) return <Skeleton className="h-32" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("jobs.title")}</h1>
        <Link href={`/${locale}/${tenantId}/jobs/new`}><Button>{t("jobs.postJob")}</Button></Link>
      </div>
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {job.featured && (!job.featuredUntil || new Date(job.featuredUntil) > new Date()) && (
                    <Badge className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      <Flame className="h-3 w-3" /> Featured
                      {job.featuredUntil && (
                        <span className="font-normal opacity-70">
                          · {Math.max(0, Math.ceil((new Date(job.featuredUntil).getTime() - Date.now()) / 86400000))}d left
                        </span>
                      )}
                    </Badge>
                  )}
                  <Badge variant={job.status === "OPEN" ? "default" : "secondary"}>{job.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                {job.isRemote && <Badge variant="outline">Remote</Badge>}
                {job.budgetMin && <span className="font-medium">{formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)}</span>}
                <span className="text-xs text-muted-foreground">
                  {job.commissionAmount != null
                    ? `Platform fee 10%: $${Number(job.commissionAmount).toFixed(2)} (${String(job.commissionStatus).toLowerCase()})`
                    : "Platform fee 10% on hire"}
                </span>
                <div className="flex gap-1">{Array.isArray(job.skillsRequired) ? job.skillsRequired.slice(0, 3).map((s: string) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>) : null}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
