import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  Users,
  Building2,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getSession() {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      clockTolerance: 60,
    });
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

export default async function AdminDashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") redirect(`/${params.locale}/`);

  const [pendingTenants, allTenants, totalUsers, totalTransactions] =
    await Promise.all([
      prisma.tenant.findMany({
        where: { status: "PENDING_APPROVAL" },
        orderBy: { createdAt: "desc" },
        include: {
          owner: { select: { firstName: true, lastName: true, email: true } },
          _count: { select: { members: true } },
        },
      }),
      prisma.tenant.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        include: {
          owner: { select: { firstName: true, lastName: true } },
          _count: {
            select: {
              members: true,
              courses: true,
              products: true,
              jobListings: true,
            },
          },
        },
      }),
      prisma.user.count(),
      prisma.platformTransaction.aggregate({ _sum: { amount: true } }),
    ]);

  const totalRevenue = Number(totalTransactions._sum.amount ?? 0);

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
            C
          </div>
          <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">
            CODESTORE GLOBAL Admin
          </h1>
        </div>
        <p className="mb-8 text-muted-foreground">
          Platform overview and workspace management.
        </p>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground sm:text-sm">
                    Workspaces
                  </p>
                  <p className="text-xl font-bold sm:text-2xl">
                    {allTenants.length + pendingTenants.length}
                  </p>
                </div>
                <Building2 className="h-6 w-6 shrink-0 text-muted-foreground sm:h-8 sm:w-8" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground sm:text-sm">
                    Users
                  </p>
                  <p className="text-xl font-bold sm:text-2xl">{totalUsers}</p>
                </div>
                <Users className="h-6 w-6 shrink-0 text-muted-foreground sm:h-8 sm:w-8" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground sm:text-sm">
                    Revenue
                  </p>
                  <p className="truncate text-xl font-bold sm:text-2xl">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 shrink-0 text-muted-foreground sm:h-8 sm:w-8" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground sm:text-sm">
                    Pending
                  </p>
                  <p className="text-xl font-bold sm:text-2xl">
                    {pendingTenants.length}
                  </p>
                </div>
                <Badge
                  variant={
                    pendingTenants.length > 0 ? "destructive" : "secondary"
                  }
                  className="shrink-0 whitespace-nowrap text-xs"
                >
                  {pendingTenants.length > 0 ? "Action Needed" : "All Clear"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Verifications */}
        <h2 className="mb-4 text-xl font-semibold">Pending Verifications</h2>
        <div className="mb-8 grid gap-4">
          {pendingTenants.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending approvals.
              </CardContent>
            </Card>
          ) : (
            pendingTenants.map((t) => (
              <Card key={t.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-lg">{t.name}</CardTitle>
                      <CardDescription className="break-all">
                        Owner: {t.owner.firstName} {t.owner.lastName} ·{" "}
                        {t.owner.email}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {t.subdomain}.codestore.io
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                      Submitted {formatDate(t.createdAt)} · Industry:{" "}
                      {t.industry || "N/A"}
                    </div>
                    <div className="flex gap-2">
                      <form
                        action={`/api/admin/approvals/${t.id}/approve`}
                        method="POST"
                      >
                        <Button type="submit" size="sm" className="gap-1">
                          <CheckCircle className="h-4 w-4" /> Approve
                        </Button>
                      </form>
                      <form
                        action={`/api/admin/approvals/${t.id}/reject`}
                        method="POST"
                      >
                        <Button
                          type="submit"
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Active Workspaces */}
        <h2 className="mb-4 text-xl font-semibold">Active Workspaces</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allTenants.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="min-w-0 truncate text-base">
                    {t.name}
                  </CardTitle>
                  <Badge variant="outline" className="shrink-0">
                    {t.subscriptionTier}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Owner: {t.owner.firstName} {t.owner.lastName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-bold">{t._count.members}</div>
                    <div className="text-xs text-muted-foreground">Members</div>
                  </div>
                  <div>
                    <div className="font-bold">{t._count.courses}</div>
                    <div className="text-xs text-muted-foreground">Courses</div>
                  </div>
                  <div>
                    <div className="font-bold">{t._count.products}</div>
                    <div className="text-xs text-muted-foreground">
                      Products
                    </div>
                  </div>
                </div>
                <Link href={`/${params.locale}/${t.id}/dashboard`}>
                  <Button variant="outline" size="sm" className="w-full gap-1">
                    <ExternalLink className="h-3 w-3" /> View Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
