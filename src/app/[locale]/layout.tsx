import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { locales, type Locale } from "@/i18n/request";
import { isRTL } from "@/lib/utils";

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
      <div dir={dir} className={isRTL(locale) ? "font-arabic" : "font-sans"} lang={locale}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
