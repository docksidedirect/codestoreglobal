"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, ShoppingBag, Briefcase, MessageSquare, Settings, MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "courses", icon: BookOpen },
  { label: "Marketplace", href: "marketplace", icon: ShoppingBag },
  { label: "Jobs", href: "jobs", icon: Briefcase },
  { label: "Forum", href: "forum", icon: MessagesSquare },
  { label: "Chat", href: "chat", icon: MessageSquare },
  { label: "Settings", href: "settings", icon: Settings },
];

export function TenantSidebar({ locale, tenantId }: { locale: string; tenantId: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 border-r bg-background lg:block">
      <nav className="flex flex-col gap-1 p-4">
        {nav.map((item) => {
          const fullHref = `/${locale}/${tenantId}/${item.href}`;
          const isActive = pathname.startsWith(fullHref);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={fullHref} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>
              <Icon className="h-4 w-4" />{item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
