// One-time: attach demo admin/member accounts to the demo workspace.
// Run: node fix-demo-membership.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true, slug: true },
  });
  console.log("Workspaces on the platform:");
  tenants.forEach((t) =>
    console.log(` - ${t.name} (slug: ${t.slug}, id: ${t.id})`),
  );

  const demo =
    tenants.find((t) => /devnexus/i.test(t.name)) ||
    tenants.find((t) => /demo/i.test(t.name)) ||
    tenants.find((t) => /demo/i.test(t.slug));
  if (!demo) {
    console.log("No demo-looking workspace found — nothing attached.");
    await prisma.$disconnect();
    return;
  }
  console.log(`Using workspace: ${demo.name}`);

  for (const email of [
    "admin@demo.codestoreglobal.io",
    "sarah.chen@demo.codestoreglobal.io",
  ]) {
    await prisma.user.update({ where: { email }, data: { tenantId: demo.id } });
    console.log(`OK: attached ${email} -> ${demo.name}`);
  }
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error("FAILED:", e.message);
  await prisma.$disconnect();
  process.exit(1);
});
