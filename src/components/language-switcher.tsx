"use client";

import { useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import {
  DEFAULT_LOCALE,
  DEFAULT_LOCALE_TAG,
  LOCALE_STORAGE_KEY,
  LOCALE_COOKIE_NAME,
  NAVBAR_LANGUAGE_OPTIONS,
  getLanguageDisplayName,
  localeTagFromAppLocale,
  normalizeLocale,
  normalizeLocaleTag,
  resolveAppLocaleFromLocaleTag
} from "@/i18n/config";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function LanguageSwitcher() {
  const t = useTranslations("Layout");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const selectedLocale = useMemo(() => normalizeLocale(locale) ?? DEFAULT_LOCALE, [locale]);
  const selectedLocaleTag = useMemo(() => localeTagFromAppLocale(selectedLocale), [selectedLocale]);

  useEffect(() => {
    const stored = normalizeLocaleTag(window.localStorage.getItem(LOCALE_STORAGE_KEY));
    const restored = stored ?? selectedLocaleTag ?? DEFAULT_LOCALE_TAG;
    const restoredAppLocale = resolveAppLocaleFromLocaleTag(restored);
    const finalLocaleTag =
      restoredAppLocale === DEFAULT_LOCALE && restored !== DEFAULT_LOCALE_TAG ? DEFAULT_LOCALE_TAG : restored;

    window.localStorage.setItem(LOCALE_STORAGE_KEY, finalLocaleTag);

    if (restoredAppLocale !== selectedLocale) {
      document.cookie = `${LOCALE_COOKIE_NAME}=${restoredAppLocale}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
      router.refresh();
    }
  }, [router, selectedLocale, selectedLocaleTag]);

  function onChange(nextLocaleTag: string) {
    const normalizedTag = normalizeLocaleTag(nextLocaleTag) ?? DEFAULT_LOCALE_TAG;
    const normalizedAppLocale = resolveAppLocaleFromLocaleTag(normalizedTag);
    const finalLocaleTag =
      normalizedAppLocale === DEFAULT_LOCALE && normalizedTag !== DEFAULT_LOCALE_TAG ? DEFAULT_LOCALE_TAG : normalizedTag;

    document.cookie = `${LOCALE_COOKIE_NAME}=${normalizedAppLocale}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, finalLocaleTag);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <label className="locale-picker" htmlFor="locale-switcher">
      <span className="visually-hidden">{t("languageLabel")}</span>
      <select
        aria-label={t("languageLabel")}
        disabled={isPending}
        id="locale-switcher"
        onChange={(event) => onChange(event.target.value)}
        size={1}
        value={selectedLocaleTag}
      >
        {NAVBAR_LANGUAGE_OPTIONS.map((item) => (
          <option key={item.locale} value={item.locale}>
            {getLanguageDisplayName(selectedLocaleTag, item.locale)}
          </option>
        ))}
      </select>
    </label>
  );
}
