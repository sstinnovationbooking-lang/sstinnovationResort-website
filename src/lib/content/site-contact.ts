import { DEFAULT_SITE_FOOTER, sanitizeSiteFooter } from "@/lib/content/footer";
import { getLocalizedValue } from "@/lib/i18n/localized";
import type { AppLocale } from "@/i18n/config";
import type { LocalizedText, SiteHomeDTO } from "@/lib/types/site";

const DEFAULT_COUNTRY_LABEL: LocalizedText = {
  "th-TH": "ไทย",
  "en-US": "Thailand",
  th: "ไทย",
  en: "Thailand"
};

const DEFAULT_CONTACT_TITLE: LocalizedText = {
  "th-TH": "ติดต่อเรา",
  "en-US": "Contact",
  th: "ติดต่อเรา",
  en: "Contact"
};

const DEFAULT_FOOTER_CONTACT_TITLE: LocalizedText = {
  "th-TH": "ข้อมูลการติดต่อ",
  "en-US": "Contact information",
  th: "ข้อมูลการติดต่อ",
  en: "Contact information"
};

const DEFAULT_TEMPLATE_MAP_URL = "https://maps.app.goo.gl/o5KacUwbLLT7B5E76";

export interface ResolvedSiteContact {
  phone: string;
  email: string;
  line: string;
  country: string;
  openingHours: string;
  address: string;
  mapUrl: string;
  facebookUrl: string;
  contactTitle: string;
  footerTitle: string;
}

function cleanText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function isValidSiteContact(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const contact = value as Record<string, unknown>;
  return cleanText(contact.phone).length > 0 && cleanText(contact.email).length > 0;
}

function resolveTextCandidates(locale: AppLocale, ...candidates: unknown[]): string {
  for (const candidate of candidates) {
    const localized = cleanText(getLocalizedValue(candidate, locale, ""));
    if (localized) return localized;

    if (typeof candidate === "string") {
      const plain = cleanText(candidate);
      if (plain) return plain;
    }
  }
  return "";
}

function resolvePlainCandidates(...candidates: unknown[]): string {
  for (const candidate of candidates) {
    const plain = cleanText(candidate);
    if (plain) return plain;
  }
  return "";
}

export function resolveSiteContact(home: SiteHomeDTO, locale: AppLocale): ResolvedSiteContact {
  const footer = sanitizeSiteFooter(home.footer ?? DEFAULT_SITE_FOOTER);
  const contact = home.contact ?? { phone: "", email: "" };
  const contactRecord = contact as Record<string, unknown>;

  const phone = resolvePlainCandidates(contact.phone, footer.contact.phone, DEFAULT_SITE_FOOTER.contact.phone);
  const email = resolvePlainCandidates(contact.email, footer.contact.email, DEFAULT_SITE_FOOTER.contact.email);
  const line = resolvePlainCandidates(contactRecord.line, contact.lineId);
  const country = resolveTextCandidates(locale, contactRecord.country, DEFAULT_COUNTRY_LABEL);
  const openingHours = resolveTextCandidates(
    locale,
    contactRecord.openingHours,
    footer.contact.supportHours,
    DEFAULT_SITE_FOOTER.contact.supportHours
  );
  const address = resolveTextCandidates(locale, contactRecord.address, footer.contact.address, DEFAULT_SITE_FOOTER.contact.address);
  const mapUrl = resolvePlainCandidates(contactRecord.mapUrl, DEFAULT_TEMPLATE_MAP_URL);
  const facebookUrl = resolvePlainCandidates(contactRecord.facebookUrl);
  const contactTitle = resolveTextCandidates(locale, contactRecord.contactTitle, DEFAULT_CONTACT_TITLE);
  const footerTitle = resolveTextCandidates(locale, contactRecord.footerTitle, DEFAULT_FOOTER_CONTACT_TITLE);

  return {
    phone,
    email,
    line,
    country,
    openingHours,
    address,
    mapUrl,
    facebookUrl,
    contactTitle,
    footerTitle
  };
}
