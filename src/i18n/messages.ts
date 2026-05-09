import type { AbstractIntlMessages } from "next-intl";

import { DEFAULT_LOCALE, normalizeLocale, type AppLocale } from "@/i18n/config";

const messageLoaders: Record<AppLocale, () => Promise<AbstractIntlMessages>> = {
  th: async () => (await import("../../messages/th.json")).default,
  en: async () => (await import("../../messages/en.json")).default
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMergeMessages(base: AbstractIntlMessages, override: AbstractIntlMessages): AbstractIntlMessages {
  const output: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  const source = override as Record<string, unknown>;

  Object.entries(source).forEach(([key, value]) => {
    const baseValue = output[key];
    if (isRecord(baseValue) && isRecord(value)) {
      output[key] = deepMergeMessages(baseValue as AbstractIntlMessages, value as AbstractIntlMessages);
      return;
    }
    output[key] = value;
  });

  return output as AbstractIntlMessages;
}

export async function loadMessages(localeLike: string | null | undefined) {
  const locale = normalizeLocale(localeLike) ?? DEFAULT_LOCALE;
  const [englishMessages, thaiMessages, localeMessages] = await Promise.all([
    messageLoaders.en(),
    messageLoaders.th(),
    messageLoaders[locale]()
  ]);

  const messages = deepMergeMessages(
    deepMergeMessages(englishMessages, thaiMessages),
    localeMessages
  );

  return { locale, messages };
}
