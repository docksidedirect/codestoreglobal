// One-time: reset superadmin password to SuperAdmin2024!
// Run: node reset-admin-password.js
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const hash = await bcrypt.hash("SuperAdmin2024!", 12);
  await prisma.user.update({
    where: { email: "superadmin@codestoreglobal.io" },
    data: { passwordHash: hash },
  });
  console.log("OK: password reset");
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error("FAILED:", e.message);
  await prisma.$disconnect();
  process.exit(1);
});
