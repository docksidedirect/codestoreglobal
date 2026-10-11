"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, Github, Chrome } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/*
 * Route metadata lives in ./metadata.ts — a "use client" page cannot export
 * `metadata`, and without it this page (where every landing CTA lands) inherits
 * the generic locale title.
 */

// Flip to true the moment these buttons call /api/auth/google and
// /api/auth/github. Until then they render disabled and labelled: a button that
// looks clickable and does nothing is a lie the visitor finds in ten seconds.
const SOCIAL_SIGNUP_READY = false;

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

  // Rewritten. The old panel sold "build your portfolio and sell global code
  // assets" — a different business from a private team store, and it was the
  // largest heading on the page every landing CTA points at.
  const leftTitle = locale === "ar" ? "أنشئ حسابك، ثم نجهّز مساحة عملك معك." :
    locale === "fr" ? "Créez votre compte, puis nous configurons votre espace de travail avec vous." :
    locale === "de" ? "Konto erstellen — den Workspace richten wir dann gemeinsam mit Ihnen ein." :
    locale === "es" ? "Crea tu cuenta y configuramos tu espacio de trabajo contigo." :
    "Create your account, then we set your workspace up with you.";

  const leftDesc = locale === "ar" ? "مساحات العمل تُنشأ خلال الإعداد مع فريقنا، لا عبر هذا النموذج. أنشئ حسابك وسنتواصل معك لإنشاء متجر فريقك." :
    locale === "fr" ? "Les espaces de travail sont créés lors de l'onboarding avec notre équipe, pas via ce formulaire. Créez votre compte et nous vous contactons pour mettre en place le store de votre équipe." :
    locale === "de" ? "Workspaces entstehen im Onboarding mit unserem Team, nicht über dieses Formular. Konto erstellen — wir melden uns und richten den Store Ihres Teams ein." :
    locale === "es" ? "Los espacios de trabajo se crean en el onboarding con nuestro equipo, no con este formulario. Crea tu cuenta y te contactamos para montar la tienda de tu equipo." :
    "Workspaces are provisioned during onboarding with our team, not by this form. Create your account, and we'll get in touch to stand up your team's store.";

  const leftSecure = locale === "ar" ? "عزل بيانات على مستوى مساحة العمل." :
    locale === "fr" ? "Isolation des données par espace de travail." :
    locale === "de" ? "Datenisolation pro Workspace." :
    locale === "es" ? "Aislamiento de datos por espacio de trabajo." :
    "Data isolation per workspace.";

  const orText = locale === "ar" ? "أو سجل باستخدام بيانات الاعتماد" :
    locale === "fr" ? "Ou inscrivez-vous avec vos identifiants" :
    locale === "de" ? "Oder registrieren Sie sich mit Anmeldedaten" :
    locale === "es" ? "O regístrate con credenciales" :
    "Or register with credentials";

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-950">
      {/* Left column: product context, not stock marketing */}
      <div className="relative hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col justify-between bg-slate-950 p-10 text-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        <Link href={`/${locale}`} className="relative z-10 flex items-center gap-2 font-bold tracking-tight text-xl">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-950 font-black text-sm">C</span>
          CODESTORE<span className="text-slate-400">GLOBAL</span>
        </Link>

        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight leading-tight">{leftTitle}</h2>
          <p className="text-sm text-slate-300/80 leading-relaxed">{leftDesc}</p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-slate-500" />
          <span>{leftSecure}</span>
        </div>
      </div>

      {/* Right column: registration form */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-8 flex items-center justify-center p-6 sm:p-10 my-auto">
        <div className="w-full max-w-[420px] space-y-6 py-4">
          {/* Mobile-only header */}
          <div className="text-center lg:text-left space-y-2 lg:hidden">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950 text-white font-black text-xs dark:bg-white dark:text-slate-950">C</span>
              CODESTORE
            </Link>
          </div>

          <div className="space-y-1 text-center lg:text-left">
            {/* Was <h2> with a conflicting <h1> in the panel; now the single H1 for this route. */}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t("auth.signUp")}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("auth.welcome")}</p>
          </div>

          {/* Social sign-up: honest about not being wired up yet. */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full gap-2 text-xs font-normal"
              type="button"
              disabled={!SOCIAL_SIGNUP_READY}
              title={SOCIAL_SIGNUP_READY ? undefined : "Not enabled yet"}
            >
              <Chrome className="h-4 w-4" />
              Google{SOCIAL_SIGNUP_READY ? "" : " — soon"}
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 text-xs font-normal"
              type="button"
              disabled={!SOCIAL_SIGNUP_READY}
              title={SOCIAL_SIGNUP_READY ? undefined : "Not enabled yet"}
            >
              <Github className="h-4 w-4" />
              GitHub{SOCIAL_SIGNUP_READY ? "" : " — soon"}
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
                <Input id="firstName" name="firstName" autoComplete="given-name" required placeholder="Amina" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="h-10 bg-slate-50/50 dark:bg-slate-900/50" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t("auth.lastName")}</Label>
                <Input id="lastName" name="lastName" autoComplete="family-name" required placeholder="Okafor" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="h-10 bg-slate-50/50 dark:bg-slate-900/50" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t("auth.email")}</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@yourteam.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10 bg-slate-50/50 dark:bg-slate-900/50" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t("auth.password")}</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" required placeholder="At least 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-10 bg-slate-50/50 dark:bg-slate-900/50" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t("auth.confirmPassword")}</Label>
              <Input id="confirm" name="confirmPassword" type="password" autoComplete="new-password" required placeholder="Repeat it" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="h-10 bg-slate-50/50 dark:bg-slate-900/50" />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3 text-xs font-medium text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-10 bg-slate-950 hover:bg-slate-800 text-white font-medium shadow-sm transition-colors mt-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" disabled={loading}>
              {loading ? (
                t("auth.loading")
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  {t("auth.signUp")} <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <p className="text-xs leading-5 text-slate-500 dark:text-slate-500">
              A workspace is not created by this form. Sign up, and we&rsquo;ll
              stand your team&rsquo;s store up with you.
            </p>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
            {t("auth.hasAccount")}{" "}
            <Link href={`/${locale}/login`} className="font-semibold text-slate-950 dark:text-white hover:underline">
              {t("auth.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
