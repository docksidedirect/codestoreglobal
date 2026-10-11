"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  LogOut,
  Globe2,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";

const localeLabels: Record<string, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
};
const localeFlags: Record<string, string> = {
  en: "🇺🇸",
  ar: "EG",
  fr: "🇫🇷",
  de: "🇩🇪",
  es: "🇪🇸",
};

export function PublicHeader() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const { user, isLoading: authLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const switchLocale = (next: string) => {
    if (next !== locale)
      window.location.href = pathname.replace(`/${locale}`, `/${next}`);
  };
  // tenantSlug, not tenantId: workspace routes are keyed by slug.
  const workspace = user?.tenantSlug ?? user?.tenantId;
  const dashboardHref =
    user?.role === "SUPERADMIN"
      ? `/${locale}/admin`
      : workspace
        ? `/${locale}/${workspace}/dashboard`
        : `/${locale}/login`;
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  // "Private component store" is the product. The public marketplace is a
  // secondary surface (it is where other teams' listings live), so it sits after
  // the wedge rather than leading the nav.
  const navLinks = [
    { href: `/${locale}`, label: "Home", active: isHome },
    { href: `/${locale}#how-it-works`, label: "How it works", active: false },
    { href: `/${locale}#pricing`, label: "Pricing", active: false },
    {
      href: `/${locale}/marketplace`,
      label: "Marketplace",
      active: pathname.includes("/marketplace"),
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between gap-4">
          <Link
            href={`/${locale}`}
            className="flex shrink-0 items-center gap-2.5"
            onClick={() => setMobileOpen(false)}
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg shadow-cyan-500/20">
              <img
                src="/favicon.png"
                alt="CODESTORE GLOBAL"
                className="h-full w-full object-cover"
              />
            </span>
            <span className="hidden text-[15px] font-bold tracking-tight text-slate-950 min-[420px]:inline dark:text-white">
              CODESTORE <span className="text-violet-600">GLOBAL</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/70 p-1 md:flex dark:border-slate-800 dark:bg-slate-900/60">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${link.active ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <div className="relative">
              <select
                value={locale}
                onChange={(e) => switchLocale(e.target.value)}
                aria-label="Language"
                className="h-9 appearance-none rounded-lg border-0 bg-transparent pl-2 pr-7 text-xs font-medium text-slate-600 outline-none dark:text-slate-400"
              >
                {Object.keys(localeLabels).map((l) => (
                  <option key={l} value={l}>
                    {localeFlags[l]} {localeLabels[l]}
                  </option>
                ))}
              </select>
              <Globe2 className="pointer-events-none absolute right-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
            {!authLoading &&
              (user ? (
                <>
                  {(user.role === "SUPERADMIN" || user.tenantId) && (
                    <Link href={dashboardHref}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 rounded-lg"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => logout()}
                    aria-label="Sign out"
                  >
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
                    <Button
                      size="sm"
                      className="rounded-lg bg-slate-950 dark:bg-white dark:text-slate-950"
                    >
                      Book a demo
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </>
              ))}
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden dark:border-slate-700 dark:text-slate-300"
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
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-3 py-3 text-sm font-medium ${link.active ? "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300" : "text-slate-600 dark:text-slate-400"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
            {!authLoading &&
              (user ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 rounded-lg"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 w-full"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                  >
                    <LogOut className="mr-1.5 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href={`/${locale}/login`}
                    className="flex-1"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href={`/${locale}/register`}
                    className="flex-1"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button size="sm" className="w-full">
                      Book a demo
                    </Button>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
