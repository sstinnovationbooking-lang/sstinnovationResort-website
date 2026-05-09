import {
  DEFAULT_LOCALE,
  DEFAULT_LOCALE_TAG,
  localeTagFromAppLocale,
  normalizeLocale,
  normalizeLocaleTag,
  type AppLocale,
  type LocaleTag
} from "@/i18n/config";

export type LocalizedString = Partial<Record<AppLocale | LocaleTag | string, string>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function isUnsafeResolvedText(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return true;
  if (/^\?+$/.test(normalized)) return true;
  if (/\?{3,}/.test(normalized)) return true;
  return false;
}

export function isLocalizedRecord(value: unknown): value is LocalizedString {
  return isRecord(value);
}

export function hasLocalizedValue(value: unknown): boolean {
  if (typeof value === "string") return Boolean(normalizeText(value));
  if (!isRecord(value)) return false;
  for (const candidate of Object.values(value)) {
    const text = normalizeText(candidate);
    if (text && !isUnsafeResolvedText(text)) return true;
  }
  return false;
}

export function getLocalizedValue(value: unknown, localeLike: string | null | undefined, fallback = ""): string {
  const directText = normalizeText(value);
  if (directText !== null) {
    return isUnsafeResolvedText(directText) ? fallback : directText;
  }
  if (!isRecord(value)) return fallback;

  const record = value as LocalizedString;
  const lowerCaseMap = new Map<string, string>();
  for (const [key, raw] of Object.entries(record)) {
    const text = normalizeText(raw);
    if (!text) continue;
    if (isUnsafeResolvedText(text)) continue;
    lowerCaseMap.set(key.toLowerCase(), text);
  }

  const selectedLocale = normalizeLocale(localeLike) ?? DEFAULT_LOCALE;
  const selectedLocaleTag = localeTagFromAppLocale(selectedLocale);

  const candidates = [
    selectedLocale,
    selectedLocaleTag,
    DEFAULT_LOCALE,
    DEFAULT_LOCALE_TAG,
    "en",
    "en-US"
  ];

  for (const key of candidates) {
    const resolved = lowerCaseMap.get(String(key).toLowerCase());
    if (resolved) return resolved;
  }

  const localeTagFromInput = normalizeLocaleTag(localeLike);
  if (localeTagFromInput) {
    const resolved = lowerCaseMap.get(localeTagFromInput.toLowerCase());
    if (resolved) return resolved;
  }

  const firstAvailable = lowerCaseMap.values().next().value;
  return firstAvailable ?? fallback;
}

export function resolveLocalizedContent<T extends Record<string, unknown>>(
  content: T,
  localeLike: string | null | undefined,
  localizedKeys: Array<keyof T>
): T {
  const output = { ...content };
  for (const key of localizedKeys) {
    output[key] = getLocalizedValue(content[key], localeLike, String(content[key] ?? "")) as T[keyof T];
  }
  return output as T;
}
