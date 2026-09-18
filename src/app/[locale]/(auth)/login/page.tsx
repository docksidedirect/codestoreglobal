"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, Github, Chrome } from "lucide-react";
import Link from "next/link";

export default function LoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);

      // Hard redirect so middleware runs on the destination
      if (user.role === "SUPERADMIN") {
        window.location.href = `/${locale}/admin`;
      } else if (user.tenantId) {
        window.location.href = `/${locale}/${user.tenantId}/dashboard`;
      } else {
        window.location.href = `/${locale}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-950">
      {/* Left Column: Premium Marketing */}
      <div className="relative hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col justify-between bg-emerald-950 p-10 text-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

        <div className="relative z-10 flex items-center gap-2 font-bold tracking-tight text-xl">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white font-black text-sm">
            C
          </span>
          CODESTORE<span className="text-emerald-400">GLOBAL</span>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight leading-tight">
            {locale === "ar"
              ? "اكتشف آلاف الأصول البرمجية الجاهزة للاستخدام."
              : locale === "fr"
                ? "Découvrez des milliers d'actifs de code prêts à l'emploi."
                : locale === "de"
                  ? "Entdecken Sie Tausende einsatzbereiter Code-Assets."
                  : locale === "es"
                    ? "Descubre miles de activos de código listos para usar."
                    : "Discover thousands of ready-to-use code assets."}
          </h1>
          <p className="text-sm text-emerald-200/80 leading-relaxed">
            {locale === "ar"
              ? "انضم إلى منصتنا متعددة المستأجرين لشراء وبيع ونشر مكونات الويب المتميزة بأمان."
              : locale === "fr"
                ? "Rejoignez notre plateforme multi-locataire pour acheter, vendre et déployer des composants web premium en toute sécurité."
                : locale === "de"
                  ? "Treten Sie unserer Multi-Tenant-Plattform bei, um Premium-Webkomponenten sicher zu kaufen, zu verkaufen und bereitzustellen."
                  : locale === "es"
                    ? "Únete a nuestra plataforma multi-inquilino para comprar, vender y desplegar componentes web premium de forma segura."
                    : "Join our multi-tenant developer platform to buy, sell, and deploy premium web components securely."}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-emerald-300/70">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>
            {locale === "ar"
              ? "بيئة مصادقة متعددة المستأجرين آمنة."
              : locale === "fr"
                ? "Environnement d'autorisation multi-locataire sécurisé."
                : locale === "de"
                  ? "Sichere Multi-Tenant-Autorisierungsumgebung."
                  : locale === "es"
                    ? "Entorno de autorización multi-inquilino seguro."
                    : "Secured multi-tenant authorization environment."}
          </span>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-8 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile Only Header */}
          <div className="text-center lg:text-left space-y-2 lg:hidden">
            <div className="inline-flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white font-black text-xs">
                C
              </span>
              CODESTORE
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t("auth.signIn")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("auth.welcome")}
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full gap-2 text-xs font-normal"
              type="button"
            >
              <Chrome className="h-4 w-4" /> Google
            </Button>
            <a href={`/api/auth/github?locale=${locale}`} className="w-full">
              <Button
                variant="outline"
                className="w-full gap-2 text-xs font-normal"
                type="button"
              >
                <Github className="h-4 w-4" /> GitHub
              </Button>
            </a>
          </div>

          <div className="relative flex py-2 items-center text-xs uppercase text-slate-400">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-400 font-medium">
              {locale === "ar"
                ? "أو تابع باستخدام"
                : locale === "fr"
                  ? "Ou continuez avec"
                  : locale === "de"
                    ? "Oder fortfahren mit"
                    : locale === "es"
                      ? "O continúa con"
                      : "Or continue with"}
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t("auth.email")}
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 bg-slate-50/50 dark:bg-slate-900/50"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {t("auth.password")}
                </Label>
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 bg-slate-50/50 dark:bg-slate-900/50"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3 text-xs font-medium text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-colors"
              disabled={loading}
            >
              {loading ? (
                t("auth.loading")
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  {t("auth.submit")} <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {t("auth.noAccount")}{" "}
            <Link
              href={`/${locale}/register`}
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {t("auth.signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
