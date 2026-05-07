import type { AbstractIntlMessages } from "next-intl";

import { DEFAULT_LOCALE, normalizeLocale, type AppLocale } from "@/i18n/config";

const messageLoaders: Record<AppLocale, () => Promise<AbstractIntlMessages>> = {
  th: async () => (await import("../../messages/th.json")).default,
  en: async () => (await import("../../messages/en.json")).default,
  lo: async () => (await import("../../messages/lo.json")).default,
  zh: async () => (await import("../../messages/zh.json")).default,
  ja: async () => (await import("../../messages/ja.json")).default,
  ko: async () => (await import("../../messages/ko.json")).default,
  ru: async () => (await import("../../messages/ru.json")).default,
  fr: async () => (await import("../../messages/fr.json")).default,
  de: async () => (await import("../../messages/de.json")).default,
  es: async () => (await import("../../messages/es.json")).default,
  it: async () => (await import("../../messages/it.json")).default,
  pt: async () => (await import("../../messages/pt.json")).default,
  id: async () => (await import("../../messages/id.json")).default,
  vi: async () => (await import("../../messages/vi.json")).default,
  ms: async () => (await import("../../messages/ms.json")).default,
  hi: async () => (await import("../../messages/hi.json")).default,
  ar: async () => (await import("../../messages/ar.json")).default
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
