import { TenantProvider } from "@/hooks/useTenant";
import { TenantHeader } from "@/components/tenant-header";
import { TenantSidebar } from "@/components/tenant-sidebar";

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string; tenantId: string };
}) {
  return (
    <TenantProvider tenantId={params.tenantId}>
      <div className="flex min-h-screen flex-col">
        <TenantHeader tenantId={params.tenantId} locale={params.locale} />
        <div className="flex flex-1">
          <TenantSidebar locale={params.locale} tenantId={params.tenantId} />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </TenantProvider>
  );
}
