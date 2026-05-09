export const SUPPORTED_LOCALES = [
  "th",
  "en"
] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocaleTag =
  | "th-TH"
  | "en-US";

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
  { locale: "th-TH", defaultLabel: "Thai", nativeName: "ไทย", countryCode: "TH", appLocale: "th", isAvailable: true },
  { locale: "en-US", defaultLabel: "English", nativeName: "English", countryCode: "US", appLocale: "en", isAvailable: true }
];

const APP_LOCALE_TO_TAG: Record<AppLocale, LocaleTag> = {
  th: "th-TH",
  en: "en-US"
};

const LOCALE_TAG_TO_APP: Record<LocaleTag, AppLocale> = Object.fromEntries(
  Object.entries(APP_LOCALE_TO_TAG).map(([appLocale, localeTag]) => [localeTag, appLocale as AppLocale])
) as Record<LocaleTag, AppLocale>;

const LANGUAGE_OPTION_MAP = new Map(NAVBAR_LANGUAGE_OPTIONS.map((item) => [item.locale.toLowerCase(), item] as const));

export const LOCALE_TO_BCP47: Record<AppLocale, string> = APP_LOCALE_TO_TAG;

export const LOCALE_TO_COUNTRY: Record<AppLocale, string> = {
  th: "TH",
  en: "US"
};

export const LOCALE_TO_CURRENCY: Record<AppLocale, string> = {
  th: "THB",
  en: "USD"
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
  const currentTag = normalizeLocaleTag(currentLocaleTag) ?? DEFAULT_LOCALE_TAG;
  if (currentTag === "th-TH") {
    if (optionLocaleTag === "th-TH") return "ไทย";
    if (optionLocaleTag === "en-US") return "อังกฤษ";
  }
  if (currentTag === "en-US") {
    if (optionLocaleTag === "th-TH") return "Thai";
    if (optionLocaleTag === "en-US") return "English";
  }

  const fallback = LANGUAGE_OPTION_MAP.get(optionLocaleTag.toLowerCase())?.nativeName ?? optionLocaleTag;
  try {
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


