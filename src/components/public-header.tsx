"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, Zap, Globe, Menu, X } from "lucide-react";

const localeLabels: Record<string, string> = {
  en: "English", ar: "العربية", fr: "Français", de: "Deutsch", es: "Español",
};
const localeFlags: Record<string, string> = {
  en: "🇺🇸", ar: "🇸🇦", fr: "🇫🇷", de: "🇩🇪", es: "🇪🇸",
};

interface SafeUser {
  id: string; email: string; firstName: string; lastName: string;
  role: string; tenantId?: string | null;
}

export function PublicHeader() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const [currentLocale, setCurrentLocale] = useState(locale);
  const [user, setUser] = useState<SafeUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => { if (data.success && data.user) setUser(data.user as SafeUser); })
      .catch(() => {})
      .finally(() => setAuthLoading(false));

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setCurrentLocale(locale); }, [locale]);

  function switchLocale(next: string) {
    if (next === currentLocale) return;
    const newPath = pathname.replace(`/${currentLocale}`, `/${next}`);
    window.location.href = newPath;
  }

  function handleLogout() {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => {
      window.location.href = `/${locale}/login`;
    });
  }

  const dashboardHref = user?.role === "SUPERADMIN"
    ? `/${locale}/admin`
    : user?.tenantId
      ? `/${locale}/${user.tenantId}/dashboard`
      : `/${locale}/login`;

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 border-b ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm dark:bg-slate-950/90" : "bg-white dark:bg-slate-950"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">CODESTORE GLOBAL</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href={`/${locale}`} className={`transition-colors ${isHome ? "text-slate-900 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>Home</Link>
            <Link href={`/${locale}/courses`} className={`transition-colors ${pathname.includes("/courses") ? "text-violet-600 dark:text-violet-400" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>Courses</Link>
            <Link href={`/${locale}/marketplace`} className={`transition-colors ${pathname.includes("/marketplace") ? "text-violet-600 dark:text-violet-400" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>Marketplace</Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={currentLocale}
                onChange={(e) => switchLocale(e.target.value)}
                className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-1 text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {Object.keys(localeLabels).map((l) => (
                  <option key={l} value={l}>{localeFlags[l]} {localeLabels[l]}</option>
                ))}
              </select>
              <Globe className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {!authLoading && (
              <>
                {user ? (
                  <>
                    <Link href={dashboardHref} className="hidden sm:block">
                      <Button variant="outline" size="sm" className="gap-1.5 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={handleLogout} className="gap-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href={`/${locale}/login`} className="hidden sm:block">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Sign In</Button>
                    </Link>
                    <Link href={`/${locale}/register`}>
                      <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">Get Started</Button>
                    </Link>
                  </>
                )}
              </>
            )}

            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            <Link href={`/${locale}`} className="block text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href={`/${locale}/courses`} className="block text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" onClick={() => setMobileOpen(false)}>Courses</Link>
            <Link href={`/${locale}/marketplace`} className="block text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" onClick={() => setMobileOpen(false)}>Marketplace</Link>
          </div>
        )}
      </div>
    </header>
  );
}
