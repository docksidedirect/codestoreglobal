// One-time: create/reset the three demo accounts with known passwords.
// Run from the project folder:  node reset-demo-accounts.js
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ACCOUNTS = [
  {
    email: "admin@demo.codestoreglobal.io",
    password: "TenantAdmin2024!",
    firstName: "Demo",
    lastName: "Admin",
    role: "TENANT_ADMIN",
    joinDemoTenant: true,
  },
  {
    email: "sarah.chen@demo.codestoreglobal.io",
    password: "Member2024!",
    firstName: "Sarah",
    lastName: "Chen",
    role: "MEMBER",
    joinDemoTenant: true,
  },
  {
    email: "marcus.weber@demo.codestoreglobal.io",
    password: "Freelancer2024!",
    firstName: "Marcus",
    lastName: "Weber",
    role: "FREELANCER",
    joinDemoTenant: false,
  },
];

(async () => {
  // Demo tenant = the seeded "demo" workspace (owner: superadmin)
  const demoTenant = await prisma.tenant.findUnique({
    where: { slug: "demo" },
  });
  if (!demoTenant)
    console.log(
      "NOTE: tenant slug 'demo' not found — accounts created without tenant.",
    );

  for (const a of ACCOUNTS) {
    const hash = await bcrypt.hash(a.password, 12);
    const data = {
      passwordHash: hash,
      firstName: a.firstName,
      lastName: a.lastName,
      role: a.role,
      isActive: true,
      emailVerified: true,
      ...(a.joinDemoTenant && demoTenant ? { tenantId: demoTenant.id } : {}),
    };
    const existing = await prisma.user.findUnique({
      where: { email: a.email },
    });
    if (existing) {
      await prisma.user.update({ where: { email: a.email }, data });
      console.log(`OK (updated): ${a.email} -> ${a.role}`);
    } else {
      await prisma.user.create({ data: { email: a.email, ...data } });
      console.log(`OK (created): ${a.email} -> ${a.role}`);
    }
  }
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error("FAILED:", e.message);
  await prisma.$disconnect();
  process.exit(1);
});
