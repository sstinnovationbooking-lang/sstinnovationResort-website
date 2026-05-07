import { LOCALE_TO_BCP47, LOCALE_TO_COUNTRY, LOCALE_TO_CURRENCY, type AppLocale } from "@/i18n/config";

function asLocaleTag(locale: AppLocale): string {
  return LOCALE_TO_BCP47[locale];
}

export function formatCurrencyByLocale(locale: AppLocale, amount: number): string {
  return new Intl.NumberFormat(asLocaleTag(locale), {
    style: "currency",
    currency: LOCALE_TO_CURRENCY[locale],
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDateByLocale(locale: AppLocale, value: Date): string {
  return new Intl.DateTimeFormat(asLocaleTag(locale), {
    dateStyle: "long"
  }).format(value);
}

export function formatTimeByLocale(locale: AppLocale, value: Date): string {
  return new Intl.DateTimeFormat(asLocaleTag(locale), {
    timeStyle: "short"
  }).format(value);
}

export function formatPhoneByLocale(_locale: AppLocale, phone: string): string {
  return phone.replace(/\s+/g, " ").trim();
}

export function formatCountryByLocale(locale: AppLocale): string {
  const displayNames = new Intl.DisplayNames([asLocaleTag(locale)], { type: "region" });
  return displayNames.of(LOCALE_TO_COUNTRY[locale]) ?? LOCALE_TO_COUNTRY[locale];
}

