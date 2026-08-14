"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, ShoppingCart, Briefcase, BookOpen, Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage({ params }: { params: { locale: string; tenantId: string } }) {
  const { locale, tenantId } = params;
  const t = useTranslations();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tenant/${tenantId}/dashboard`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setData(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tenantId]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
  if (!data) return <div className="text-destructive">Failed to load dashboard</div>;

  const isAdmin = user?.role === "TENANT_ADMIN" || user?.role === "SUPERADMIN";
  const isPending = tenant?.status === "PENDING_APPROVAL";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tenant?.name}</h1>
          <p className="text-muted-foreground">{t("dashboard.welcome", { name: user?.firstName || "" })}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{tenant?.subscriptionTier}</Badge>
          {tenant?.isVerified && <Badge className="bg-emerald-600">Verified</Badge>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={<TrendingUp />} label={t("dashboard.analytics.revenue")} value={formatCurrency(data.analytics?.totalRevenue ?? 0)} />
        <MetricCard icon={<ShoppingCart />} label={t("dashboard.analytics.sales")} value={String(data.analytics?.totalSales ?? 0)} />
        <MetricCard icon={<Briefcase />} label={t("dashboard.analytics.jobs")} value={String(data.analytics?.activeJobs ?? 0)} />
        <MetricCard icon={<Users />} label={t("dashboard.analytics.members")} value={String(data.analytics?.totalMembers ?? 0)} />
      </div>

      {isAdmin && !isPending && (
        <Card>
          <CardHeader><CardTitle className="text-lg">{t("dashboard.quickActions.title")}</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction href={`/${locale}/${tenantId}/products/new`} label={t("dashboard.quickActions.uploadProduct")} desc={t("dashboard.quickActions.uploadProductDesc")} />
            <QuickAction href={`/${locale}/${tenantId}/courses/new`} label={t("dashboard.quickActions.createCourse")} desc={t("dashboard.quickActions.createCourseDesc")} />
            <QuickAction href={`/${locale}/${tenantId}/jobs/new`} label={t("dashboard.quickActions.postJob")} desc={t("dashboard.quickActions.postJobDesc")} />
            <QuickAction href={`/${locale}/${tenantId}/settings/members`} label={t("dashboard.quickActions.inviteMember")} desc={t("dashboard.quickActions.inviteMemberDesc")} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <ListCard title={t("dashboard.recent.courses")} href={`/${locale}/${tenantId}/courses`} items={data.recentCourses || []} render={(c: any) => (
          <div className="flex justify-between items-start">
            <div><p className="font-medium">{c.title}</p><p className="text-xs text-muted-foreground">{c.moduleCount} modules</p></div>
            <span className="text-sm font-semibold">{formatCurrency(c.price)}</span>
          </div>
        )} />
        <ListCard title={t("dashboard.recent.products")} href={`/${locale}/${tenantId}/products`} items={data.recentProducts || []} render={(p: any) => (
          <div className="flex justify-between items-start">
            <div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.category}</p></div>
            <span className="text-sm font-semibold">{formatCurrency(p.price)}</span>
          </div>
        )} />
        <ListCard title={t("dashboard.recent.jobs")} href={`/${locale}/${tenantId}/jobs`} items={data.recentJobs || []} render={(j: any) => (
          <div>
            <p className="font-medium">{j.title}</p>
            <div className="flex gap-2 mt-1"><Badge variant="outline" className="text-xs">{j.status}</Badge>{j.budgetMin && <span className="text-xs text-muted-foreground">{formatCurrency(j.budgetMin)} - {formatCurrency(j.budgetMax)}</span>}</div>
          </div>
        )} />
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="text-primary">{icon}</div>
        </div>
        <p className="mt-2 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function QuickAction({ href, label, desc }: any) {
  return (
    <Link href={href} className="flex items-start gap-3 rounded-lg border p-4 hover:bg-accent transition-colors">
      <div className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary"><Plus className="h-4 w-4" /></div>
      <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
    </Link>
  );
}

function ListCard({ title, href, items, render }: any) {
  const t = useTranslations();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <Link href={href} className="text-xs text-primary hover:underline">{t("dashboard.recent.viewAll")}</Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No items</p> : items.map((item: any) => <div key={item.id} className="border-b last:border-0 pb-2 last:pb-0">{render(item)}</div>)}
      </CardContent>
    </Card>
  );
}
