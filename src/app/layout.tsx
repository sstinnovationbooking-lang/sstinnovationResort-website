import type { Metadata } from "next";
import { createTranslator, NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { LOCALE_COOKIE_NAME, LOCALE_TO_BCP47 } from "@/i18n/config";
import { loadMessages } from "@/i18n/messages";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const { locale, messages } = await loadMessages(localeFromCookie);
  const t = createTranslator({ locale, messages, namespace: "Metadata" });

  return {
    title: {
      default: t("siteDefaultTitle"),
      template: `%s | ${t("siteTitleSuffix")}`
    },
    description: t("defaultDescription")
  };
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const { locale, messages } = await loadMessages(localeFromCookie);

  return (
    <html lang={LOCALE_TO_BCP47[locale]} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
