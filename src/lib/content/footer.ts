import type {
  FooterCopyrightDTO,
  FooterMenuItemDTO,
  FooterSocialLinkDTO,
  FooterSocialPlatform,
  LocalizedText,
  SiteFooterDTO
} from "@/lib/types/site";

export const HOMEPAGE_FOOTER_CONTENT_KEY = "homepage.footer";

export const DEFAULT_SITE_FOOTER: SiteFooterDTO = {
  brandName: "SST INNOVATION RESORT",
  description: "เว็บไซต์รีสอร์ทพร้อมระบบจอง รองรับหลายเจ้าของรีสอร์ท และเชื่อมต่อระบบหลังบ้าน",
  menuItems: [
    { label: "หน้าแรก", href: "/" },
    { label: "ห้องพัก", href: "/rooms" },
    { label: "กิจกรรม", href: "/activities" },
    { label: "เกี่ยวกับเรา", href: "/about" },
    { label: "ติดต่อเรา", href: "/contact" }
  ],
  contact: {
    address: "99/9 หมู่ 1 ตำบลตัวอย่าง อำเภอเมือง จังหวัดเชียงใหม่ 50000",
    phone: "084-337-4982",
    email: "contact@sstinnovationresort.com",
    supportHours: "ทุกวัน 08:00 - 20:00 น."
  },
  systemLinks: [
    { label: "ระบบจองห้องพัก" },
    { label: "เว็บไซต์รีสอร์ท" },
    { label: "รองรับ Multi-tenant" },
    { label: "เชื่อมต่อระบบหลังบ้าน" }
  ],
  socialLinks: [
    { id: "facebook", platform: "facebook", label: "Facebook", url: "https://facebook.com", enabled: true, order: 1 },
    { id: "line", platform: "line", label: "LINE", url: "https://line.me", enabled: true, order: 2 },
    { id: "messenger", platform: "messenger", label: "Messenger", url: "https://m.me", enabled: true, order: 3 },
    { id: "youtube", platform: "youtube", label: "YouTube", url: "https://youtube.com", enabled: true, order: 4 }
  ],
  copyright: {
    year: 2026,
    developerName: {
      "th-TH": "SST INNOVATION CO., LTD.",
      "en-US": "SST INNOVATION CO., LTD."
    },
    resortName: {
      "th-TH": "Forest Escape Resort",
      "en-US": "Forest Escape Resort"
    },
    rightsText: {
      "th-TH": "สงวนลิขสิทธิ์ทั้งหมด",
      "en-US": "All rights reserved."
    },
    legalTitle: {
      "th-TH": "ข้อมูลลิขสิทธิ์และความเป็นเจ้าของ",
      "en-US": "Copyright and Ownership Information"
    },
    legalBody: {
      "th-TH":
        "ระบบเว็บไซต์นี้พัฒนาโดย {developerName} ส่วนเนื้อหาของรีสอร์ท เช่น ข้อความ รูปภาพ ข้อมูลห้องพัก โปรโมชั่น ข้อมูลติดต่อ และข้อมูลเฉพาะของรีสอร์ท เป็นลิขสิทธิ์ของ {resortName} ห้ามคัดลอก ดัดแปลง เผยแพร่ หรือนำไปใช้โดยไม่ได้รับอนุญาต",
      "en-US":
        "This website system is developed by {developerName}. The resort content, including text, images, room information, promotions, contact information, and other resort-specific materials, belongs to {resortName}. Copying, modifying, distributing, or reusing any content without permission is not allowed."
    }
  },
  copyrightText: "All rights reserved.",
  isVisible: true
};

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeLocalizedText(value: unknown): LocalizedText | null {
  if (typeof value === "string") {
    const normalized = cleanText(value);
    return normalized || null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const record: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value)) {
    const text = cleanText(raw);
    if (!text) continue;
    record[key] = text;
  }
  return Object.keys(record).length > 0 ? record : null;
}

function hasLocalizedText(value: unknown): boolean {
  return normalizeLocalizedText(value) !== null;
}

function normalizeMenuItems(value: unknown): FooterMenuItemDTO[] {
  if (!Array.isArray(value)) return [];
  const result: FooterMenuItemDTO[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as { label?: unknown; href?: unknown };
    const label = normalizeLocalizedText(raw.label);
    const href = cleanText(raw.href);
    if (!label) continue;
    result.push({ label, href: href || undefined });
  }
  return result;
}

function normalizeSocialPlatform(value: unknown): FooterSocialPlatform | null {
  const normalized = cleanText(value).toLowerCase();
  if (!normalized) return null;
  if (normalized === "facebook") return "facebook";
  if (normalized === "line") return "line";
  if (normalized === "messenger") return "messenger";
  if (normalized === "youtube") return "youtube";
  return normalized;
}

function normalizeSocialLinks(value: unknown): FooterSocialLinkDTO[] {
  if (!Array.isArray(value)) return [];

  const result: FooterSocialLinkDTO[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const id = cleanText(raw.id);
    const platform = normalizeSocialPlatform(raw.platform);
    const label = normalizeLocalizedText(raw.label);
    const url = cleanText(raw.url);
    const order = Number.isFinite(Number(raw.order)) ? Number(raw.order) : 999;
    const enabled = raw.enabled !== false;

    if (!id || !platform) continue;
    result.push({
      id,
      platform,
      label: label ?? undefined,
      url: url || undefined,
      enabled,
      order
    });
  }

  return result.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

function normalizeCopyrightYear(value: unknown): number | undefined {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return undefined;
  const year = Math.floor(numeric);
  if (year < 1900 || year > 9999) return undefined;
  return year;
}

function normalizeFooterCopyright(value: unknown): FooterCopyrightDTO | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;

  const year = normalizeCopyrightYear(raw.year);
  const developerName = normalizeLocalizedText(raw.developerName);
  const resortName = normalizeLocalizedText(raw.resortName);
  const rightsText = normalizeLocalizedText(raw.rightsText);
  const legalTitle = normalizeLocalizedText(raw.legalTitle);
  const legalBody = normalizeLocalizedText(raw.legalBody);

  if (!year && !developerName && !resortName && !rightsText && !legalTitle && !legalBody) return undefined;

  return {
    year,
    developerName: developerName ?? undefined,
    resortName: resortName ?? undefined,
    rightsText: rightsText ?? undefined,
    legalTitle: legalTitle ?? undefined,
    legalBody: legalBody ?? undefined
  };
}

export function hasConfiguredFooterSocialLinks(value: unknown): boolean {
  return normalizeSocialLinks(value).length > 0;
}

export function hasConfiguredFooterCopyright(value: unknown): boolean {
  return Boolean(normalizeFooterCopyright(value));
}

export function isValidSiteFooter(value: unknown): value is SiteFooterDTO {
  if (!value || typeof value !== "object") return false;
  const footer = value as Partial<SiteFooterDTO>;
  const contact = footer.contact as Partial<SiteFooterDTO["contact"]> | undefined;

  return (
    hasLocalizedText(footer.brandName) &&
    hasLocalizedText(footer.description) &&
    !!contact &&
    hasLocalizedText(contact.address) &&
    hasLocalizedText(contact.phone) &&
    hasLocalizedText(contact.email)
  );
}

export function sanitizeSiteFooter(value: unknown): SiteFooterDTO {
  if (!isValidSiteFooter(value)) {
    return {
      ...DEFAULT_SITE_FOOTER,
      contact: { ...DEFAULT_SITE_FOOTER.contact },
      socialLinks: DEFAULT_SITE_FOOTER.socialLinks?.map((item) => ({ ...item })),
      copyright: DEFAULT_SITE_FOOTER.copyright
    };
  }

  const footer = value as SiteFooterDTO;
  const fallback = DEFAULT_SITE_FOOTER;
  const menuItems = normalizeMenuItems(footer.menuItems);
  const systemLinks = normalizeMenuItems(footer.systemLinks);
  const socialLinks = normalizeSocialLinks(footer.socialLinks);
  const copyright = normalizeFooterCopyright(footer.copyright);
  const fallbackCopyright = normalizeFooterCopyright(fallback.copyright);

  return {
    brandName: normalizeLocalizedText(footer.brandName) ?? fallback.brandName,
    description: normalizeLocalizedText(footer.description) ?? fallback.description,
    logoUrl: cleanText(footer.logoUrl) || undefined,
    menuItems: menuItems.length ? menuItems : fallback.menuItems,
    contact: {
      address: normalizeLocalizedText(footer.contact.address) ?? fallback.contact.address,
      phone: normalizeLocalizedText(footer.contact.phone) ?? fallback.contact.phone,
      email: normalizeLocalizedText(footer.contact.email) ?? fallback.contact.email,
      supportHours: normalizeLocalizedText(footer.contact.supportHours) ?? fallback.contact.supportHours
    },
    systemLinks: systemLinks.length ? systemLinks : fallback.systemLinks,
    socialLinks: socialLinks.length ? socialLinks : fallback.socialLinks,
    copyright: copyright ?? fallbackCopyright,
    copyrightText: normalizeLocalizedText(footer.copyrightText) ?? fallback.copyrightText,
    isVisible: footer.isVisible === false ? false : true
  };
}
