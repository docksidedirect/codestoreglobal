"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
      <Card>
        <CardHeader><CardTitle>{t("settings.profile")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>{t("auth.firstName")}</Label><Input defaultValue={user?.firstName} /></div>
            <div><Label>{t("auth.lastName")}</Label><Input defaultValue={user?.lastName} /></div>
          </div>
          <div><Label>{t("auth.email")}</Label><Input defaultValue={user?.email} disabled /></div>
          <Button disabled={saving} onClick={() => setSaving(true)}>{t("settings.save")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
