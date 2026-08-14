export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string | null;
  avatarUrl?: string | null;
}

export interface SafeTenant {
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
