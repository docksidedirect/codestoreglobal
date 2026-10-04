import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const dynamic = "force-dynamic";

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

export default async function AdminPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getSession();

  if (!session || session.role !== "SUPERADMIN") {
    redirect(`/${params.locale}`);
  }

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <Link
            href={`/${params.locale}`}
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          <AdminDashboard />
        </div>
      </div>
    </>
  );
}
