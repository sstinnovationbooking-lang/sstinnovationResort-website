import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, normalizeLocale } from "@/i18n/config";
import { loadMessages } from "@/i18n/messages";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
  const { locale, messages } = await loadMessages(cookieLocale ?? DEFAULT_LOCALE);

  return {
    locale,
    messages
  };
});

