"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  description: string | null;
  status: string;
  subscriptionTier: string;
  isVerified: boolean;
  logoUrl: string | null;
  bannerUrl: string | null;
}

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType>({ tenant: null, isLoading: true });

export function TenantProvider({ children, tenantId }: { children: ReactNode; tenantId: string }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tenant/current`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTenant(data.tenant);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [tenantId]);

  return (
    <TenantContext.Provider value={{ tenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
