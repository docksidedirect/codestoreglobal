"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  function switchLocale(next: string) {
    if (next === locale) return;
    const newPath = pathname.replace(`/${locale}`, `/${next}`);
    window.location.href = newPath;
  }

  function handleLogout() {
    logout();
    setMobileOpen(false);
  }

  const dashboardHref =
    user?.role === "SUPERADMIN"
      ? `/${locale}/admin`
      : user?.tenantId
        ? `/${locale}/${user.tenantId}/dashboard`
        : `/${locale}/login`;

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  const navLinks = [
    { href: `/${locale}`, label: "Home", active: isHome },
    { href: `/${locale}/courses`, label: "Courses", active: false },
    { href: `/${locale}/marketplace`, label: "Marketplace", active: false },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              CODESTORE GLOBAL
            </span>
          </Link>

          {/* Desktop nav — unchanged */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.active
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop controls — unchanged, just wrapped to hide on mobile */}
          <div className="hidden md:flex items-center gap-3">
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
                    {(user.role === "SUPERADMIN" || user.tenantId) && (
                      <Link href={dashboardHref}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Button>
                      </Link>
                    )}
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

          {/* Mobile hamburger */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden dark:border-slate-700 dark:text-slate-300"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            {/* Nav links */}
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                    link.active
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Locale switcher */}
            <div className="relative mt-2">
              <select
                value={locale}
                onChange={(e) => switchLocale(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {Object.keys(localeLabels).map((l) => (
                  <option key={l} value={l}>
                    {localeFlags[l]} {localeLabels[l]}
                  </option>
                ))}
              </select>
              <Globe className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Auth — Sign In is always reachable here */}
            {!authLoading && (
              <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                {user ? (
                  <>
                    {(user.role === "SUPERADMIN" || user.tenantId) && (
                      <Link
                        href={dashboardHref}
                        onClick={() => setMobileOpen(false)}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5"
                        >
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full"
                    >
                      <LogOut className="mr-1.5 h-4 w-4" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/${locale}/login`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href={`/${locale}/register`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button size="sm" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
