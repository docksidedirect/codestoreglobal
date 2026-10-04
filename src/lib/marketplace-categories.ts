// Central marketplace category definitions — used by category pages, sitemap, and internal links.
import { ProductCategory } from "@prisma/client";

export const locales = ["en", "ar", "fr", "de", "es"] as const;
export type LocalizedText = Record<(typeof locales)[number], string>;

export interface MarketplaceCategory {
  value: ProductCategory;
  slug: string;
  labels: LocalizedText;
  /** ~120-160 char unique intro per locale — this is the programmatic SEO copy */
  intro: LocalizedText;
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    value: "SAAS_TOOL",
    slug: "saas-tools",
    labels: { en: "SaaS Tools", ar: "أدوات SaaS", fr: "Outils SaaS", de: "SaaS-Tools", es: "Herramientas SaaS" },
    intro: {
      en: "Browse production-ready SaaS tools that solve real business problems. From analytics dashboards to deployment pipelines, every tool is reviewed by our team and backed by secure payments and verified sellers on CODESTORE GLOBAL.",
      ar: "تصفح أدوات SaaS جاهزة للإنتاج تحل مشاكل الأعمال الحقيقية. من لوحات التحليلات إلى خطوط النشر، كل أداة مراجعة من فريقنا ومدعومة بمدفوعات آمنة وبائعين موثقين.",
      fr: "Découvrez des outils SaaS prêts pour la production qui résolvent de vrais problèmes métier. Tableaux de bord analytiques ou pipelines de déploiement, chaque outil est vérifié avec paiements sécurisés et vendeurs certifiés.",
      de: "Entdecken Sie produktionsreife SaaS-Tools, die echte Geschäftsprobleme lösen. Von Analyse-Dashboards bis zu Deployment-Pipelines – jedes Tool wird geprüft, mit sicheren Zahlungen und verifizierten Verkäufern.",
      es: "Explora herramientas SaaS listas para producción que resuelven problemas reales de negocio. Desde paneles de analítica hasta pipelines de despliegue, cada herramienta está verificada con pagos seguros y vendedores verificados.",
    },
  },
  {
    value: "COMPONENT_LIBRARY",
    slug: "component-libraries",
    labels: { en: "Component Libraries", ar: "مكتبات المكونات", fr: "Bibliothèques de composants", de: "Komponenten-Bibliotheken", es: "Librerías de componentes" },
    intro: {
      en: "Ship faster with battle-tested React, Vue, and TypeScript component libraries. Data grids, form kits, chart libraries and UI systems built by professional developers, with lifetime updates and developer support.",
      ar: "أطلق منتجك أسرع مع مكتبات مكونات مجربة لـ React وVue وTypeScript. شبكات بيانات ونماذج ومخططات وأنظمة واجهات من مطورين محترفين مع تحديثات مدى الحياة ودعم فني.",
      fr: "Livrez plus vite avec des bibliothèques de composants React, Vue et TypeScript éprouvées. Grilles de données, kits de formulaires, graphiques et systèmes UI créés par des développeurs professionnels.",
      de: "Schneller liefern mit erprobten React-, Vue- und TypeScript-Komponentenbibliotheken. Datengrids, Formularkits, Diagramme und UI-Systeme von professionellen Entwicklern, mit lebenslangen Updates.",
      es: "Lanza más rápido con librerías de componentes React, Vue y TypeScript probadas en producción. Grids de datos, kits de formularios, gráficos y sistemas UI creados por desarrolladores profesionales.",
    },
  },
  {
    value: "TEMPLATE",
    slug: "templates",
    labels: { en: "Templates & Starters", ar: "القوالب والبدايات الجاهزة", fr: "Modèles & Starters", de: "Vorlagen & Starter", es: "Plantillas y starters" },
    intro: {
      en: "Production-grade website and app templates with clean architecture, authentication, payments and SEO built in. Start your next SaaS, portfolio, or e-commerce project from a codebase that already works.",
      ar: "قوالب مواقع وتطبيقات بمعايير الإنتاج مع بنية نظيفة ومصادقة ومدفوعات وSEO جاهزة. ابدأ مشروعك القادم من كود يعمل بالفعل.",
      fr: "Des templates de sites et d'applications de qualité production avec architecture propre, authentification, paiements et SEO intégrés. Démarrez votre prochain projet depuis une base qui fonctionne déjà.",
      de: "Website- und App-Vorlagen in Produktionsqualität mit sauberer Architektur, Authentifizierung, Zahlungen und SEO. Starten Sie Ihr nächstes Projekt aus einem Codebase, der bereits funktioniert.",
      es: "Plantillas de sitios y apps de calidad de producción con arquitectura limpia, autenticación, pagos y SEO integrados. Empieza tu próximo proyecto desde una base de código que ya funciona.",
    },
  },
  {
    value: "PLUGIN",
    slug: "plugins",
    labels: { en: "Plugins & Extensions", ar: "الإضافات والامتدادات", fr: "Plugins & Extensions", de: "Plugins & Erweiterungen", es: "Plugins y extensiones" },
    intro: {
      en: "Extend your stack with plugins and extensions for Figma, WordPress, VS Code, Chrome and popular dev tools. Small utilities that remove daily friction, reviewed for quality and security before listing.",
      ar: "وسّع أدواتك مع إضافات لـ Figma وWordPress وVS Code وChrome. أدوات صغيرة تزيل الاحتكاك اليومي، مراجعة جودتها وأمانها قبل النشر.",
      fr: "Étendez votre stack avec des plugins pour Figma, WordPress, VS Code, Chrome et d'autres outils. Des utilitaires qui éliminent les frictions quotidiennes, vérifiés pour leur qualité et leur sécurité.",
      de: "Erweitern Sie Ihren Stack mit Plugins für Figma, WordPress, VS Code, Chrome und beliebte Dev-Tools. Kleine Hilfsmittel, die tägliche Reibung entfernen – geprüft auf Qualität und Sicherheit.",
      es: "Extiende tu stack con plugins para Figma, WordPress, VS Code, Chrome y herramientas populares. Utilidades que eliminan fricción diaria, revisadas por calidad y seguridad antes de publicarse.",
    },
  },
  {
    value: "API_SERVICE",
    slug: "api-services",
    labels: { en: "API Services", ar: "خدمات API", fr: "Services API", de: "API-Dienste", es: "Servicios API" },
    intro: {
      en: "Reliable REST and GraphQL API services: payment processing, image optimization, email delivery, rate limiting, and more. Integrate in minutes with documented endpoints and sandbox keys.",
      ar: "خدمات API موثوقة لـ REST وGraphQL: معالجة المدفوعات وتحسين الصور وإرسال البريد وتحديد المعدل والمزيد. تكامل في دقائق مع توثيق شامل.",
      fr: "Des services API REST et GraphQL fiables : paiements, optimisation d'images, emails, rate limiting et plus. Intégrez en quelques minutes avec une documentation complète.",
      de: "Zuverlässige REST- und GraphQL-API-Dienste: Zahlungsabwicklung, Bildoptimierung, E-Mail-Versand, Rate-Limiting und mehr. Integration in Minuten mit dokumentierten Endpunkten.",
      es: "Servicios API REST y GraphQL confiables: pagos, optimización de imágenes, envío de correo, rate limiting y más. Integra en minutos con endpoints documentados.",
    },
  },
  {
    value: "EBOOK",
    slug: "ebooks",
    labels: { en: "E-Books & Guides", ar: "الكتب الإلكترونية والأدلة", fr: "E-Books & Guides", de: "E-Books & Anleitungen", es: "Ebooks y guías" },
    intro: {
      en: "In-depth e-books and practical guides written by practitioners: SaaS pricing playbooks, system design interview prep, indie hacking guides and technical deep-dives you can apply the same day.",
      ar: "كتب إلكترونية وأدلة عملية من خبراء: استراتيجيات تسعير SaaS والتحضير للمقابلات والدليل المستقل وتحليلات تقنية عميقة تطبقها في نفس اليوم.",
      fr: "Des e-books approfondis écrits par des praticiens : playbooks de pricing SaaS, préparation aux entretiens system design, guides d'indie hacking et analyses techniques applicables immédiatement.",
      de: "Tiefgehende E-Books von Praktikern: SaaS-Pricing-Playbooks, Systemdesign-Interview-Vorbereitung, Indie-Hacking-Guides und technische Deep-Dives zum sofortigen Anwenden.",
      es: "Ebooks profundos escritos por profesionales: playbooks de pricing SaaS, preparación de entrevistas de system design, guías de indie hacking y análisis técnicos aplicables el mismo día.",
    },
  },
  {
    value: "COURSE_BUNDLE",
    slug: "course-bundles",
    labels: { en: "Course Bundles", ar: "حزم الدورات", fr: "Packs de cours", de: "Kurs-Bundles", es: "Paquetes de cursos" },
    intro: {
      en: "Curated course bundles that take you from zero to production: full-stack frameworks, DevOps roadmaps, and complete career tracks. One purchase, structured learning path, certificate on completion.",
      ar: "حزم دورات منتقاة تأخذك من الصفر إلى الإنتاج: أطر عمل متكاملة ومسارات DevOps ومسارات مهنية كاملة. شراء واحد، مسار تعلم منظم، وشهادة عند الإنجاز.",
      fr: "Des packs de cours conçus pour passer de zéro à la production : frameworks full-stack, feuilles de route DevOps et parcours métiers complets. Un achat, un parcours structuré, un certificat à la clé.",
      de: "Kuratierte Kurs-Bundles von null bis Produktion: Full-Stack-Frameworks, DevOps-Roadmaps und komplette Karrierepfade. Ein Kauf, ein strukturierter Lernpfad, Zertifikat beim Abschluss.",
      es: "Paquetes de cursos diseñados para llevarte de cero a producción: frameworks full-stack, rutas DevOps y trayectorias profesionales completas. Una compra, ruta estructurada, certificado al finalizar.",
    },
  },
];

export function getCategoryBySlug(slug: string): MarketplaceCategory | undefined {
  return MARKETPLACE_CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryLabel(slug: string, locale: string): string {
  const cat = getCategoryBySlug(slug);
  if (!cat) return slug;
  return (cat.labels as any)[locale] || cat.labels.en;
}

/** All valid category param values for generateStaticParams */
export const categorySlugs = MARKETPLACE_CATEGORIES.map((c) => c.slug);
