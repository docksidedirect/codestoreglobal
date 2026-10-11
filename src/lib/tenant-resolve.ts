import { prisma } from "@/lib/prisma";

/**
 * Resolves a workspace URL segment to the canonical Tenant id.
 *
 * Why this exists: `Tenant` has both `id` (a cuid) and `slug` (a human-readable
 * segment such as "devnexus-demo"). URL segments are slugs, but every tenant API
 * filtered with `where: { tenantId: <segment> }`, comparing a cuid column against
 * a slug. Nothing matched, so the dashboard, products and members pages all
 * rendered as empty for any workspace in the app.
 *
 * Accepts either form, so existing links that already use a cuid keep working.
 */
export async function resolveTenantId(segment: string): Promise<string | null> {
  if (!segment) return null;

  const tenant = await prisma.tenant.findFirst({
    where: { OR: [{ id: segment }, { slug: segment }] },
    select: { id: true },
  });

  return tenant?.id ?? null;
}

/**
 * True when the user is allowed to act on this workspace.
 * Compares against the *resolved* id on both sides — the previous check compared
 * user.tenantId (a cuid) against a slug and always failed.
 */
export async function canAccessTenant(
  user: { role: string; tenantId: string | null } | null,
  segment: string
): Promise<{ ok: boolean; tenantId: string | null }> {
  if (!user) return { ok: false, tenantId: null };

  const tenantId = await resolveTenantId(segment);
  if (!tenantId) return { ok: false, tenantId: null };

  if (user.role === "SUPERADMIN") return { ok: true, tenantId };
  return { ok: user.tenantId === tenantId, tenantId };
}
