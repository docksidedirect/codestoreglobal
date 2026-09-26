"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Bell,
  LogOut,
  Zap,
  Globe,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

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

export function TenantHeader({
  tenantId,
  locale,
}: {
  tenantId: string;
  locale: string;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
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

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-2 px-4 lg:px-8">
        {/* Logo — shrink-0 so it never wraps or squeezes the controls */}
        <Link
          href={`/${locale}/${tenantId}/dashboard`}
          className="flex shrink-0 items-center gap-2.5"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
            <Zap className="h-4 w-4" />
          </div>
          <span className="hidden whitespace-nowrap text-lg font-bold tracking-tight min-[420px]:inline">
            CODESTORE GLOBAL
          </span>
        </Link>

        {/* Desktop controls */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="relative">
            <select
              value={locale}
              onChange={(e) => switchLocale(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {Object.keys(localeLabels).map((l) => (
                <option key={l} value={l}>
                  {localeFlags[l]} {localeLabels[l]}
                </option>
              ))}
            </select>
            <Globe className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatarUrl || ""} />
              <AvatarFallback>
                {user ? getInitials(user.firstName, user.lastName) : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => logout()}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden dark:border-slate-700 dark:text-slate-300"
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t bg-background md:hidden">
          <div className="space-y-3 px-4 py-4">
            {/* User info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatarUrl || ""} />
                <AvatarFallback>
                  {user ? getInitials(user.firstName, user.lastName) : "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
            </div>

            {/* Dashboard link */}
            <Link
              href={`/${locale}/${tenantId}/dashboard`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>

            {/* Language switcher */}
            <div className="relative">
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

            {/* Sign out */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full gap-1.5"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
