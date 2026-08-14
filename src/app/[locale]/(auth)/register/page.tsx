"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, Github, Chrome } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    setError(null); setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) setError(data.error || "Registration failed");
      else router.push(`/${locale}/login`);
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  const leftTitle = locale === "ar" ? "ابنِ محفظتك وبيع الأصول البرمجية عالمياً." :
    locale === "fr" ? "Construisez votre portfolio et vendez des actifs de code mondiaux." :
    locale === "de" ? "Bauen Sie Ihr Portfolio auf und verkaufen Sie globale Code-Assets." :
    locale === "es" ? "Construye tu portafolio y vende activos de código globales." :
    "Build your portfolio & sell global code assets.";

  const leftDesc = locale === "ar" ? "أنشئ حساباً للانضمام إلى نظام بيئي متقدم مبني لتوسيع تطبيقات الويب عالية الأداء والإضافات." :
    locale === "fr" ? "Créez un compte pour rejoindre un écosystème avancé conçu pour faire évoluer les applications web hautes performances et les extensions." :
    locale === "de" ? "Erstellen Sie ein Konto, um einem erweiterten Ökosystem beizutreten, das für die Skalierung leistungsstarker Webanwendungen und Erweiterungen entwickelt wurde." :
    locale === "es" ? "Crea una cuenta para unirte a un ecosistema avanzado diseñado para escalar aplicaciones web de alto rendimiento y extensiones." :
    "Create an account to join an advanced ecosystem built for scaling high-performance web applications and extensions.";

  const leftSecure = locale === "ar" ? "بيئة مصادقة متعددة المستأجرين آمنة." :
    locale === "fr" ? "Environnement d'autorisation multi-locataire sécurisé." :
    locale === "de" ? "Sichere Multi-Tenant-Autorisierungsumgebung." :
    locale === "es" ? "Entorno de autorización multi-inquilino seguro." :
    "Secured multi-tenant authorization environment.";

  const orText = locale === "ar" ? "أو سجل باستخدام بيانات الاعتماد" :
    locale === "fr" ? "Ou inscrivez-vous avec vos identifiants" :
    locale === "de" ? "Oder registrieren Sie sich mit Anmeldedaten" :
    locale === "es" ? "O regístrate con credenciales" :
    "Or register with credentials";

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-950">
      {/* Left Column: Premium Marketing */}
      <div className="relative hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col justify-between bg-emerald-950 p-10 text-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

        <div className="relative z-10 flex items-center gap-2 font-bold tracking-tight text-xl">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white font-black text-sm">C</span>
          CODESTORE<span className="text-emerald-400">GLOBAL</span>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight leading-tight">{leftTitle}</h1>
          <p className="text-sm text-emerald-200/80 leading-relaxed">{leftDesc}</p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-emerald-300/70">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>{leftSecure}</span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-8 flex items-center justify-center p-6 sm:p-10 my-auto">
        <div className="w-full max-w-[420px] space-y-6 py-4">
          {/* Mobile Only Header */}
          <div className="text-center lg:text-left space-y-2 lg:hidden">
            <div className="inline-flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white font-black text-xs">C</span>
              CODESTORE
            </div>
          </div>

          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t("auth.signUp")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("auth.welcome")}</p>
          </div>

          {/* Social Registrations */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full gap-2 text-xs font-normal" type="button">
              <Chrome className="h-4 w-4" /> Google
            </Button>
            <Button variant="outline" className="w-full gap-2 text-xs font-normal" type="button">
              <Github className="h-4 w-4" /> GitHub
            </Button>
          </div>

          <div className="relative flex py-1 items-center text-xs uppercase text-slate-400">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-400 font-medium">{orText}</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t("auth.firstName")}</Label>
                <Input id="firstName" required placeholder="John" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="h-10 bg-slate-50/50 dark:bg-slate-900/50" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t("auth.lastName")}</Label>
                <Input id="lastName" required placeholder="Doe" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="h-10 bg-slate-50/50 dark:bg-slate-900/50" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t("auth.email")}</Label>
              <Input id="email" type="email" required placeholder="name@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10 bg-slate-50/50 dark:bg-slate-900/50" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t("auth.password")}</Label>
              <Input id="password" type="password" required placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-10 bg-slate-50/50 dark:bg-slate-900/50" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t("auth.confirmPassword")}</Label>
              <Input id="confirm" type="password" required placeholder="••••••••" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="h-10 bg-slate-50/50 dark:bg-slate-900/50" />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3 text-xs font-medium text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-colors mt-2" disabled={loading}>
              {loading ? (
                t("auth.loading")
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  {t("auth.signUp")} <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
            {t("auth.hasAccount")}{" "}
            <Link href={`/${locale}/login`} className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              {t("auth.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
