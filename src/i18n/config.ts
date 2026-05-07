export const SUPPORTED_LOCALES = [
  "th",
  "en",
  "lo",
  "zh",
  "ja",
  "ko",
  "ru",
  "fr",
  "de",
  "es",
  "it",
  "pt",
  "id",
  "vi",
  "ms",
  "hi",
  "ar"
] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocaleTag =
  | "th-TH"
  | "en-US"
  | "lo-LA"
  | "zh-CN"
  | "ja-JP"
  | "ko-KR"
  | "ru-RU"
  | "fr-FR"
  | "de-DE"
  | "es-ES"
  | "it-IT"
  | "pt-PT"
  | "id-ID"
  | "vi-VN"
  | "ms-MY"
  | "hi-IN"
  | "ar-SA";

export type LanguageOption = {
  locale: LocaleTag;
  defaultLabel: string;
  nativeName: string;
  countryCode: string;
  appLocale: AppLocale;
  isAvailable: boolean;
};

export const DEFAULT_LOCALE: AppLocale = "th";
export const DEFAULT_LOCALE_TAG: LocaleTag = "th-TH";
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
export const LOCALE_STORAGE_KEY = "NEXT_LOCALE";
export const LOCALE_QUERY_PARAM = "lang";

export const NAVBAR_LANGUAGE_OPTIONS: LanguageOption[] = [
  { locale: "th-TH", defaultLabel: "Thai (TH)", nativeName: "ไทย", countryCode: "TH", appLocale: "th", isAvailable: true },
  { locale: "en-US", defaultLabel: "English (US)", nativeName: "English", countryCode: "US", appLocale: "en", isAvailable: true },
  { locale: "lo-LA", defaultLabel: "Lao (LA)", nativeName: "ລາວ", countryCode: "LA", appLocale: "lo", isAvailable: true },
  { locale: "zh-CN", defaultLabel: "Chinese (CN)", nativeName: "中文", countryCode: "CN", appLocale: "zh", isAvailable: true },
  { locale: "ja-JP", defaultLabel: "Japanese (JP)", nativeName: "日本語", countryCode: "JP", appLocale: "ja", isAvailable: true },
  { locale: "ko-KR", defaultLabel: "Korean (KR)", nativeName: "한국어", countryCode: "KR", appLocale: "ko", isAvailable: true },
  { locale: "ru-RU", defaultLabel: "Russian (RU)", nativeName: "Русский", countryCode: "RU", appLocale: "ru", isAvailable: true },
  { locale: "fr-FR", defaultLabel: "French (FR)", nativeName: "Français", countryCode: "FR", appLocale: "fr", isAvailable: true },
  { locale: "de-DE", defaultLabel: "German (DE)", nativeName: "Deutsch", countryCode: "DE", appLocale: "de", isAvailable: true },
  { locale: "es-ES", defaultLabel: "Spanish (ES)", nativeName: "Español", countryCode: "ES", appLocale: "es", isAvailable: true },
  { locale: "it-IT", defaultLabel: "Italian (IT)", nativeName: "Italiano", countryCode: "IT", appLocale: "it", isAvailable: true },
  { locale: "pt-PT", defaultLabel: "Portuguese (PT)", nativeName: "Português", countryCode: "PT", appLocale: "pt", isAvailable: true },
  { locale: "id-ID", defaultLabel: "Indonesian (ID)", nativeName: "Bahasa Indonesia", countryCode: "ID", appLocale: "id", isAvailable: true },
  { locale: "vi-VN", defaultLabel: "Vietnamese (VN)", nativeName: "Tiếng Việt", countryCode: "VN", appLocale: "vi", isAvailable: true },
  { locale: "ms-MY", defaultLabel: "Malay (MY)", nativeName: "Bahasa Melayu", countryCode: "MY", appLocale: "ms", isAvailable: true },
  { locale: "hi-IN", defaultLabel: "Hindi (IN)", nativeName: "हिन्दी", countryCode: "IN", appLocale: "hi", isAvailable: true },
  { locale: "ar-SA", defaultLabel: "Arabic (SA)", nativeName: "العربية", countryCode: "SA", appLocale: "ar", isAvailable: true }
];

const APP_LOCALE_TO_TAG: Record<AppLocale, LocaleTag> = {
  th: "th-TH",
  en: "en-US",
  lo: "lo-LA",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
  ru: "ru-RU",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
  id: "id-ID",
  vi: "vi-VN",
  ms: "ms-MY",
  hi: "hi-IN",
  ar: "ar-SA"
};

const LOCALE_TAG_TO_APP: Record<LocaleTag, AppLocale> = Object.fromEntries(
  Object.entries(APP_LOCALE_TO_TAG).map(([appLocale, localeTag]) => [localeTag, appLocale as AppLocale])
) as Record<LocaleTag, AppLocale>;

const LANGUAGE_OPTION_MAP = new Map(NAVBAR_LANGUAGE_OPTIONS.map((item) => [item.locale.toLowerCase(), item] as const));

export const LOCALE_TO_BCP47: Record<AppLocale, string> = APP_LOCALE_TO_TAG;

export const LOCALE_TO_COUNTRY: Record<AppLocale, string> = {
  th: "TH",
  en: "US",
  lo: "LA",
  zh: "CN",
  ja: "JP",
  ko: "KR",
  ru: "RU",
  fr: "FR",
  de: "DE",
  es: "ES",
  it: "IT",
  pt: "PT",
  id: "ID",
  vi: "VN",
  ms: "MY",
  hi: "IN",
  ar: "SA"
};

export const LOCALE_TO_CURRENCY: Record<AppLocale, string> = {
  th: "THB",
  en: "USD",
  lo: "LAK",
  zh: "CNY",
  ja: "JPY",
  ko: "KRW",
  ru: "RUB",
  fr: "EUR",
  de: "EUR",
  es: "EUR",
  it: "EUR",
  pt: "EUR",
  id: "IDR",
  vi: "VND",
  ms: "MYR",
  hi: "INR",
  ar: "SAR"
};

export const LOCALE_LABELS: Record<AppLocale, string> = Object.fromEntries(
  NAVBAR_LANGUAGE_OPTIONS.map((item) => [item.appLocale, item.defaultLabel])
) as Record<AppLocale, string>;

export function localeTagFromAppLocale(locale: AppLocale): LocaleTag {
  return APP_LOCALE_TO_TAG[locale];
}

export function isSupportedLocale(value: string | null | undefined): value is AppLocale {
  return SUPPORTED_LOCALES.includes(String(value ?? "").toLowerCase() as AppLocale);
}

export function normalizeLocaleTag(value: string | null | undefined): LocaleTag | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return null;
  const found = LANGUAGE_OPTION_MAP.get(normalized);
  return found?.locale ?? null;
}

export function resolveAppLocaleFromLocaleTag(value: string | null | undefined): AppLocale {
  const localeTag = normalizeLocaleTag(value);
  if (!localeTag) return DEFAULT_LOCALE;
  return LOCALE_TAG_TO_APP[localeTag] ?? DEFAULT_LOCALE;
}

export function normalizeLocale(value: string | null | undefined): AppLocale | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return null;

  if (isSupportedLocale(normalized)) {
    return normalized;
  }

  const localeTag = normalizeLocaleTag(normalized);
  if (!localeTag) return null;
  return resolveAppLocaleFromLocaleTag(localeTag);
}

export function getLanguageDisplayName(
  currentLocaleTag: string | null | undefined,
  optionLocaleTag: LocaleTag
): string {
  const fallback = LANGUAGE_OPTION_MAP.get(optionLocaleTag.toLowerCase())?.nativeName ?? optionLocaleTag;
  try {
    const currentTag = normalizeLocaleTag(currentLocaleTag) ?? DEFAULT_LOCALE_TAG;
    const languageCode = optionLocaleTag.split("-")[0] || "en";
    const displayNames = new Intl.DisplayNames([currentTag], { type: "language" });
    return displayNames.of(languageCode) ?? fallback;
  } catch {
    return fallback;
  }
}

export function resolveLocaleFromCookieHeader(cookieHeader: string | null | undefined): AppLocale {
  const raw = String(cookieHeader ?? "");
  if (!raw) return DEFAULT_LOCALE;

  const pairs = raw.split(";").map((chunk) => chunk.trim());
  for (const pair of pairs) {
    if (!pair.startsWith(`${LOCALE_COOKIE_NAME}=`)) continue;
    const value = decodeURIComponent(pair.slice(LOCALE_COOKIE_NAME.length + 1));
    return normalizeLocale(value) ?? DEFAULT_LOCALE;
  }

  return DEFAULT_LOCALE;
}

