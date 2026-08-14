"use client";

import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Zap } from "lucide-react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

export function TenantHeader({ tenantId, locale }: { tenantId: string; locale: string }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <Link href={`/${locale}/${tenantId}/dashboard`} className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">CODESTORE GLOBAL</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatarUrl || ""} />
              <AvatarFallback>{user ? getInitials(user.firstName, user.lastName) : "?"}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:block">{user?.firstName} {user?.lastName}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => logout()}><LogOut className="h-5 w-5" /></Button>
        </div>
      </div>
    </header>
  );
}
