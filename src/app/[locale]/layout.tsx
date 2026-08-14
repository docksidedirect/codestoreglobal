import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { locales, type Locale } from "@/i18n/request";
import { isRTL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "CODESTORE GLOBAL — Multi-Tenant Developer Platform",
  description:
    "Host secure sub-workspaces, publish technical courses, trade SaaS components, and run an escrowed job marketplace — all in one unified platform.",
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();
  const dir = isRTL(locale) ? "rtl" : "ltr";

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div
        dir={dir}
        className={isRTL(locale) ? "font-arabic" : "font-sans"}
        lang={locale}
      >
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
