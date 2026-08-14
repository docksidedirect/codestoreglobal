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
  const token = cookies().get("token")?.value; // ← FIXED: was "token"
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
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-sm font-bold">
            C
          </div>
          <h1 className="text-3xl font-bold">CODESTORE GLOBAL Admin</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Platform overview and workspace management.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Workspaces</p>
                  <p className="text-2xl font-bold">
                    {allTenants.length + pendingTenants.length}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Users</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingTenants.length}</p>
                </div>
                <Badge
                  variant={
                    pendingTenants.length > 0 ? "destructive" : "secondary"
                  }
                >
                  {pendingTenants.length > 0 ? "Action Needed" : "All Clear"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mb-4">Pending Verifications</h2>
        <div className="grid gap-4 mb-8">
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
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{t.name}</CardTitle>
                      <CardDescription>
                        Owner: {t.owner.firstName} {t.owner.lastName} ·{" "}
                        {t.owner.email}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {t.subdomain}.codestore.io
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
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

        <h2 className="text-xl font-semibold mb-4">Active Workspaces</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allTenants.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t.name}</CardTitle>
                  <Badge variant="outline">{t.subscriptionTier}</Badge>
                </div>
                <CardDescription className="text-xs">
                  Owner: {t.owner.firstName} {t.owner.lastName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
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
