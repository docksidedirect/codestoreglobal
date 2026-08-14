"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, Zap, Globe, Menu, X } from "lucide-react";

const localeLabels: Record<string, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
};
const localeFlags: Record<string, string> = {
  en: "🇺🇸",
  ar: "🇸🇦",
  fr: "🇫🇷",
  de: "🇩🇪",
  es: "🇪🇸",
};

export function PublicHeader() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const { user, isLoading: authLoading, logout } = useAuth();

  function switchLocale(next: string) {
    if (next === locale) return;
    const newPath = pathname.replace(`/${locale}`, `/${next}`);
    window.location.href = newPath;
  }

  function handleLogout() {
    logout();
  }

  const dashboardHref =
    user?.role === "SUPERADMIN"
      ? `/${locale}/admin`
      : user?.tenantId
        ? `/${locale}/${user.tenantId}/dashboard`
        : `/${locale}/login`;

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  return (
    <header className="sticky top-0 z-50 border-b bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              CODESTORE GLOBAL
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href={`/${locale}`}
              className={
                isHome
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }
            >
              Home
            </Link>
            <Link
              href={`/${locale}/courses`}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400"
            >
              Courses
            </Link>
            <Link
              href={`/${locale}/marketplace`}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400"
            >
              Marketplace
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={locale}
                onChange={(e) => switchLocale(e.target.value)}
                className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {Object.keys(localeLabels).map((l) => (
                  <option key={l} value={l}>
                    {localeFlags[l]} {localeLabels[l]}
                  </option>
                ))}
              </select>
              <Globe className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {!authLoading && (
              <>
                {user ? (
                  <>
                    <Link href={dashboardHref}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href={`/${locale}/login`}>
                      <Button variant="ghost" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href={`/${locale}/register`}>
                      <Button size="sm">Get Started</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
