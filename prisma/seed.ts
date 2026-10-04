import { PrismaClient, UserRole, TenantStatus, SubscriptionTier, ProductCategory, JobStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding DevNexus Professional Platform...");

  const hash = (pw: string) => bcrypt.hash(pw, 12);

  // Clean slate
  await prisma.forumVote.deleteMany();
  await prisma.forumPost.deleteMany();
  await prisma.forumThread.deleteMany();
  await prisma.forumCategory.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatParticipant.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.jobListing.deleteMany();
  await prisma.review.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.course.deleteMany();
  await prisma.product.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.platformTransaction.deleteMany();
  await prisma.tenantInvite.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  console.log("🧹 Database cleaned");

  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@codestoreglobal.io",
      passwordHash: await hash("SuperAdmin2024!"),
      firstName: "System", lastName: "Administrator",
      role: UserRole.SUPERADMIN, isActive: true, emailVerified: true,
      language: "en", timezone: "UTC",
    },
  });
  console.log(`✅ SuperAdmin: ${superAdmin.email}`);

  const demoTenant = await prisma.tenant.create({
    data: {
      name: "DevNexus Demo Workspace",
      slug: "devnexus-demo", subdomain: "demo",
      description: "Official demonstration workspace for the DevNexus platform.",
      industry: "Technology", companySize: "11-50", foundedYear: 2022,
      status: TenantStatus.ACTIVE, subscriptionTier: SubscriptionTier.ENTERPRISE,
      isVerified: true, ownerId: superAdmin.id,
      socialLinks: JSON.stringify({ twitter: "@devnexus", linkedin: "devnexus" }),
    },
  });
  console.log(`✅ Demo Tenant: ${demoTenant.name}`);

  const tenantAdmin = await prisma.user.create({
    data: {
      email: "admin@demo.codestoreglobal.io",
      passwordHash: await hash("TenantAdmin2024!"),
      firstName: "Demo", lastName: "Admin",
      role: UserRole.TENANT_ADMIN, tenantId: demoTenant.id,
      isActive: true, emailVerified: true, language: "en",
      paypalEmail: "admin-paypal@demo.codestoreglobal.io",
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: "sarah.chen@demo.codestoreglobal.io",
      passwordHash: await hash("Member2024!"),
      firstName: "Sarah", lastName: "Chen",
      role: UserRole.MEMBER, tenantId: demoTenant.id,
      isActive: true, emailVerified: true, language: "en",
      githubUrl: "https://github.com/sarahchen",
    },
  });

  const freelancer1 = await prisma.user.create({
    data: {
      email: "marcus.weber@demo.codestoreglobal.io",
      passwordHash: await hash("Freelancer2024!"),
      firstName: "Marcus", lastName: "Weber",
      role: UserRole.FREELANCER, tenantId: demoTenant.id,
      isActive: true, emailVerified: true, language: "de",
      portfolioUrl: "https://marcusweber.dev",
      paypalEmail: "marcus@weber.dev",
    },
  });

  await prisma.tenant.create({
    data: {
      name: "Acme Startup", slug: "acme-startup", subdomain: "acme",
      description: "A promising SaaS startup seeking verification.",
      industry: "SaaS", status: TenantStatus.PENDING_APPROVAL,
      subscriptionTier: SubscriptionTier.STARTER,
      ownerId: superAdmin.id,
    },
  });

  // ─── Courses ───
  const courses = [
    { title: "Advanced Next.js Multi-Tenant Patterns", slug: "advanced-nextjs-multi-tenant", description: "Deep dive into building scalable multi-tenant SaaS applications using Next.js App Router, Prisma, and MySQL.", price: 149.99, moduleCount: 12, durationMinutes: 840, difficulty: "ADVANCED", tags: JSON.stringify(["nextjs", "multi-tenant", "architecture"]), learningOutcomes: JSON.stringify(["Build scalable tenant isolation", "Implement subdomain routing", "Design RBAC systems"]) },
    { title: "Prisma ORM Mastery for Production", slug: "prisma-orm-mastery", description: "Master Prisma ORM with real-world patterns: soft deletes, connection pooling, row-level security, and complex relation queries.", price: 99.99, moduleCount: 8, durationMinutes: 480, difficulty: "INTERMEDIATE", tags: JSON.stringify(["prisma", "mysql", "orm"]), learningOutcomes: JSON.stringify(["Complex relation queries", "Connection pooling", "RLS strategies"]) },
    { title: "PayPal Commerce Platform Integration", slug: "paypal-commerce-integration", description: "Implement subscription billing, merchant onboarding, and automated fee-splitting using PayPal's REST SDK.", price: 79.99, moduleCount: 6, durationMinutes: 360, difficulty: "INTERMEDIATE", tags: JSON.stringify(["paypal", "payments", "subscriptions"]), learningOutcomes: JSON.stringify(["Subscription billing", "Fee splitting", "Refund handling"]) },
    { title: "Real-Time Chat with WebSockets", slug: "realtime-chat-websockets", description: "Build real-time chat systems with Socket.io, room management, and message persistence in Next.js.", price: 59.99, moduleCount: 5, durationMinutes: 300, difficulty: "BEGINNER", tags: JSON.stringify(["websocket", "socket.io", "real-time"]), learningOutcomes: JSON.stringify(["Socket.io architecture", "Room management", "Message persistence"]) },
    { title: "i18n & Localization at Scale", slug: "i18n-localization-scale", description: "Implement multi-language support with next-intl, RTL layouts, and translation management for global SaaS.", price: 49.99, moduleCount: 4, durationMinutes: 240, difficulty: "BEGINNER", tags: JSON.stringify(["i18n", "next-intl", "localization"]), learningOutcomes: JSON.stringify(["Multi-language routing", "RTL support", "Translation management"]) },
  ];

  for (const c of courses) {
    await prisma.course.create({
      data: { ...c, currency: "USD", isPublished: true, tenantId: demoTenant.id, instructorId: tenantAdmin.id },
    });
  }
  console.log(`✅ ${courses.length} courses seeded`);

  // ─── Products ───
  const products = [
    { name: "React Data Grid Pro", slug: "react-data-grid-pro", description: "High-performance virtualized data grid with sorting, filtering, and inline editing.", category: ProductCategory.COMPONENT_LIBRARY, price: 49.99, tags: JSON.stringify(["react", "table", "virtualization"]), version: "2.1.0", shortDesc: "Professional component library for modern development teams." },
    { name: "AuthGuard SaaS Kit", slug: "authguard-saas-kit", description: "Complete authentication and authorization starter kit with OAuth2, RBAC, and tenant isolation patterns.", category: ProductCategory.TEMPLATE, price: 129.99, tags: JSON.stringify(["nextjs", "auth", "rbac"]), version: "1.5.0", shortDesc: "Professional template for modern development teams." },
    { name: "API Rate Limiter Microservice", slug: "api-rate-limiter", description: "Redis-backed distributed rate limiting service with sliding window algorithms and tenant-aware quotas.", category: ProductCategory.API_SERVICE, price: 29.99, tags: JSON.stringify(["redis", "microservice", "rate-limiting"]), version: "1.0.3", shortDesc: "Professional api service for modern development teams." },
    { name: "Kubernetes Deployment Toolkit", slug: "k8s-deployment-toolkit", description: "Complete Kubernetes deployment toolkit with Helm charts, Terraform modules, and GitOps workflows.", category: ProductCategory.SAAS_TOOL, price: 89.99, tags: JSON.stringify(["kubernetes", "devops", "helm"]), version: "3.0.1", shortDesc: "Professional saas tool for modern development teams." },
    { name: "Design System Tokens Generator", slug: "design-tokens-generator", description: "Generate and sync design tokens across Figma, code, and documentation with automated pipelines.", category: ProductCategory.PLUGIN, price: 19.99, tags: JSON.stringify(["figma", "design-system", "tokens"]), version: "1.2.0", shortDesc: "Professional plugin for modern development teams." },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: { ...p, currency: "USD", isActive: true, tenantId: demoTenant.id, sellerId: tenantAdmin.id },
    });
  }
  console.log(`✅ ${products.length} products seeded`);

  // ─── Jobs ───
  const jobs = [
    { title: "Senior Full-Stack Engineer (Next.js/Prisma)", slug: "senior-fullstack-engineer", description: "Join our core platform team building the next generation of multi-tenant developer tools.", requirements: "5+ years experience with React/Next.js. Deep knowledge of MySQL and Prisma.", budgetMin: 8000, budgetMax: 12000, skillsRequired: JSON.stringify(["Next.js", "Prisma", "MySQL", "TypeScript", "WebSockets"]), remote: true, location: "Global", exp: "Senior", featured: true, featuredFee: 19.00 },
    { title: "DevOps Engineer - Kubernetes Platform", slug: "devops-engineer-k8s", description: "Design and maintain our multi-tenant Kubernetes infrastructure.", requirements: "Strong experience with Kubernetes, Helm, Terraform, and CI/CD pipelines.", budgetMin: 7000, budgetMax: 10000, skillsRequired: JSON.stringify(["Kubernetes", "Terraform", "Helm", "GitOps", "AWS"]), remote: true, location: "US/EU", exp: "Mid-Level" },
    { title: "UI/UX Designer for SaaS Dashboards", slug: "uiux-designer-saas", description: "Create beautiful, intuitive dashboard interfaces for our multi-tenant platform.", requirements: "Portfolio demonstrating SaaS dashboard design. Proficiency in Figma and design systems.", budgetMin: 4000, budgetMax: 6000, skillsRequired: JSON.stringify(["Figma", "Design Systems", "User Research", "Prototyping"]), remote: true, location: "Remote", exp: "Mid-Level" },
    { title: "Technical Writer - API Documentation", slug: "technical-writer-api", description: "Write comprehensive API documentation, tutorials, and guides for our developer platform.", requirements: "Experience with OpenAPI/Swagger, Markdown, and developer documentation.", budgetMin: 3000, budgetMax: 4500, skillsRequired: JSON.stringify(["Technical Writing", "OpenAPI", "Markdown", "Developer Advocacy"]), remote: true, location: "Any", exp: "Junior" },
  ];

  for (const j of jobs) {
    await prisma.jobListing.create({
      data: {
        title: j.title, slug: j.slug, description: j.description, requirements: j.requirements,
        budgetMin: j.budgetMin, budgetMax: j.budgetMax, skillsRequired: j.skillsRequired,
        experienceLevel: j.exp, currency: "USD", status: JobStatus.OPEN,
        isRemote: j.remote, location: j.location,
        featured: (j as any).featured || false,
        featuredUntil: (j as any).featured ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
        featuredFee: (j as any).featuredFee || null,
        commissionAmount: j.budgetMax ? Number((Number(j.budgetMax) * 0.10).toFixed(2)) : null,
        tenantId: demoTenant.id, postedById: tenantAdmin.id,
      },
    });
  }
  console.log(`✅ ${jobs.length} jobs seeded`);

  // ─── Chat Room ───
  const chatRoom = await prisma.chatRoom.create({
    data: { id: "demo-general-room", name: "General Discussion", type: "CHANNEL", tenantId: demoTenant.id },
  });

  await prisma.chatParticipant.createMany({
    data: [
      { roomId: chatRoom.id, userId: tenantAdmin.id },
      { roomId: chatRoom.id, userId: member1.id },
      { roomId: chatRoom.id, userId: freelancer1.id },
    ],
  });

  const msgs = [
    { content: "Welcome to the DevNexus Demo workspace! Feel free to explore.", senderId: tenantAdmin.id },
    { content: "Thanks! The course catalog looks amazing.", senderId: member1.id },
    { content: "Ich freue mich auf die Zusammenarbeit! 🇩🇪", senderId: freelancer1.id },
    { content: "The marketplace has some great components. Check out the React Data Grid Pro.", senderId: tenantAdmin.id },
  ];
  for (const m of msgs) {
    await prisma.chatMessage.create({ data: { content: m.content, roomId: chatRoom.id, senderId: m.senderId } });
  }
  console.log("✅ Chat room seeded");

  // ─── Forum ───
  const forumCategories = [
    { name: "General Discussion", slug: "general", description: "Open discussions about anything related to development, tech, and the platform.", icon: "MessageCircle", color: "#3b82f6", orderIndex: 0 },
    { name: "Course Q&A", slug: "course-qa", description: "Ask questions and discuss course content with instructors and fellow students.", icon: "BookOpen", color: "#10b981", orderIndex: 1 },
    { name: "Product Support", slug: "product-support", description: "Get help with marketplace products, report bugs, and request features.", icon: "ShoppingBag", color: "#f59e0b", orderIndex: 2 },
    { name: "Freelancer Corner", slug: "freelancer-corner", description: "Tips, best practices, and discussions for freelancers working on the platform.", icon: "Briefcase", color: "#8b5cf6", orderIndex: 3 },
    { name: "Show & Tell", slug: "show-and-tell", description: "Share your projects, get feedback, and showcase your work to the community.", icon: "Star", color: "#ec4899", orderIndex: 4 },
  ];

  const createdCats = [];
  for (const cat of forumCategories) {
    const c = await prisma.forumCategory.create({
      data: { ...cat, tenantId: demoTenant.id },
    });
    createdCats.push(c);
  }
  console.log(`✅ ${forumCategories.length} forum categories seeded`);

  const forumThreads = [
    { title: "Welcome to the DevNexus Community Forum!", slug: "welcome-to-forum", content: "This is the official community forum for the DevNexus Demo Workspace. Here you can discuss courses, ask questions about products, share your freelance experiences, and connect with other developers.\n\nFeel free to start new threads in any category. Instructors, freelancers, and members are all welcome to participate!", categoryIndex: 0, authorId: tenantAdmin.id, isPinned: true },
    { title: "Best practices for Next.js App Router with Prisma?", slug: "nextjs-prisma-best-practices", content: "I'm working through the Advanced Next.js Multi-Tenant Patterns course and wondering about the best way to handle Prisma client instantiation in the App Router. Should I use a global singleton or instantiate per-request?", categoryIndex: 1, authorId: member1.id },
    { title: "React Data Grid Pro - How to enable virtual scrolling?", slug: "react-data-grid-virtual-scroll", content: "I purchased the React Data Grid Pro component and I'm trying to enable virtual scrolling for a dataset with 50k rows. The documentation mentions the `virtualize` prop but I'm not sure about the configuration. Can anyone help?", categoryIndex: 2, authorId: freelancer1.id },
    { title: "Tips for landing your first freelance job on the platform", slug: "first-freelance-job-tips", content: "I've been a freelancer for 3 years but new to this platform. For those who have successfully landed jobs here, what tips do you have for writing proposals? How do you handle escrow payments?", categoryIndex: 3, authorId: freelancer1.id },
    { title: "My multi-tenant SaaS dashboard built with this platform's stack", slug: "showcase-saas-dashboard", content: "I wanted to share a project I've been working on using the exact stack taught in the courses here. It's a multi-tenant analytics dashboard with real-time updates, built with Next.js 14, Prisma, and MySQL. Happy to answer questions about the architecture!", categoryIndex: 4, authorId: member1.id },
  ];

  const createdThreads = [];
  for (const t of forumThreads) {
    const thread = await prisma.forumThread.create({
      data: {
        title: t.title, slug: t.slug, content: t.content,
        categoryId: createdCats[t.categoryIndex].id,
        tenantId: demoTenant.id, authorId: t.authorId,
        isPinned: t.isPinned || false,
      },
    });
    createdThreads.push(thread);
  }
  console.log(`✅ ${forumThreads.length} forum threads seeded`);

  const forumPosts = [
    { content: "Great question! For Next.js App Router, I recommend using a global singleton pattern with Prisma. The Prisma client handles connection pooling automatically, so a single instance per server process is optimal. Check the course module on 'Database Connection Strategies' for a detailed implementation.", threadIndex: 1, authorId: tenantAdmin.id, isSolution: true },
    { content: "I had the same question when I started. The key is to export a single Prisma instance from a `lib/prisma.ts` file and import it wherever you need it. Never instantiate inside a component or route handler.", threadIndex: 1, authorId: member1.id },
    { content: "For the virtual scrolling, you need to set `virtualize={true}` and provide an `itemHeight` prop. Also make sure your row renderer is memoized with React.memo to prevent unnecessary re-renders.", threadIndex: 2, authorId: tenantAdmin.id, isSolution: true },
    { content: "The escrow system here is straightforward. Once you're selected for a job, the client deposits the budget into escrow. You get paid when milestones are completed and approved. Always define clear milestones in your contract!", threadIndex: 3, authorId: tenantAdmin.id },
    { content: "Thanks for sharing! Did you implement tenant isolation at the database level or application level? I'm curious about your approach to handling tenant-specific data migrations.", threadIndex: 4, authorId: freelancer1.id },
  ];

  for (const p of forumPosts) {
    await prisma.forumPost.create({
      data: {
        content: p.content,
        threadId: createdThreads[p.threadIndex].id,
        authorId: p.authorId,
        isSolution: p.isSolution || false,
      },
    });
    await prisma.forumThread.update({
      where: { id: createdThreads[p.threadIndex].id },
      data: { postCount: { increment: 1 } },
    });
  }
  console.log(`✅ ${forumPosts.length} forum posts seeded`);

  // ─── Notifications ───
  await prisma.notification.createMany({
    data: [
      { type: "SYSTEM", title: "Welcome to DevNexus", message: "Your workspace is ready. Start exploring courses and products.", userId: tenantAdmin.id },
      { type: "TENANT", title: "New Member Joined", message: "Sarah Chen has joined the workspace.", userId: tenantAdmin.id, tenantId: demoTenant.id },
      { type: "JOB", title: "New Job Application", message: "Marcus Weber applied to Senior Full-Stack Engineer position.", userId: tenantAdmin.id, tenantId: demoTenant.id },
      { type: "CHAT", title: "New Forum Post", message: "Marcus Weber replied to your thread 'React Data Grid Pro'.", userId: tenantAdmin.id, tenantId: demoTenant.id },
    ],
  });
  console.log("✅ Notifications seeded");

  // ─── Audit Logs ───
  await prisma.auditLog.createMany({
    data: [
      { action: "TENANT_CREATED", entity: "Tenant", entityId: demoTenant.id, userId: superAdmin.id, tenantId: demoTenant.id },
      { action: "USER_INVITED", entity: "User", entityId: member1.id, userId: tenantAdmin.id, tenantId: demoTenant.id },
      { action: "COURSE_PUBLISHED", entity: "Course", entityId: "batch", userId: tenantAdmin.id, tenantId: demoTenant.id },
      { action: "FORUM_THREAD_CREATED", entity: "ForumThread", entityId: "batch", userId: tenantAdmin.id, tenantId: demoTenant.id },
    ],
  });
  console.log("✅ Audit logs seeded");

  console.log("\n🎉 Professional DevNexus seeding completed!");
  console.log("\n🔑 Default Credentials:");
  console.log("   SuperAdmin: superadmin@codestoreglobal.io / SuperAdmin2024!");
  console.log("   TenantAdmin: admin@demo.codestoreglobal.io / TenantAdmin2024!");
  console.log("   Member: sarah.chen@demo.codestoreglobal.io / Member2024!");
  console.log("   Freelancer: marcus.weber@demo.codestoreglobal.io / Freelancer2024!");
}

main()
  .catch((e) => { console.error("❌ Seeding failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });