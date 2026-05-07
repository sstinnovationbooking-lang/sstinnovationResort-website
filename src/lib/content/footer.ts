import type { FooterMenuItemDTO, SiteFooterDTO } from "@/lib/types/site";

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
  copyrightText: "All rights reserved.",
  isVisible: true
};

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeMenuItems(value: unknown): FooterMenuItemDTO[] {
  if (!Array.isArray(value)) return [];
  const result: FooterMenuItemDTO[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as { label?: unknown; href?: unknown };
    const label = cleanText(raw.label);
    const href = cleanText(raw.href);
    if (!label) continue;
    result.push({ label, href: href || undefined });
  }
  return result;
}

export function isValidSiteFooter(value: unknown): value is SiteFooterDTO {
  if (!value || typeof value !== "object") return false;
  const footer = value as Partial<SiteFooterDTO>;
  const contact = footer.contact as Partial<SiteFooterDTO["contact"]> | undefined;

  return (
    cleanText(footer.brandName).length > 0 &&
    cleanText(footer.description).length > 0 &&
    !!contact &&
    cleanText(contact.address).length > 0 &&
    cleanText(contact.phone).length > 0 &&
    cleanText(contact.email).length > 0
  );
}

export function sanitizeSiteFooter(value: unknown): SiteFooterDTO {
  if (!isValidSiteFooter(value)) {
    return { ...DEFAULT_SITE_FOOTER, contact: { ...DEFAULT_SITE_FOOTER.contact } };
  }

  const footer = value as SiteFooterDTO;
  const fallback = DEFAULT_SITE_FOOTER;
  const menuItems = normalizeMenuItems(footer.menuItems);
  const systemLinks = normalizeMenuItems(footer.systemLinks);

  return {
    brandName: cleanText(footer.brandName),
    description: cleanText(footer.description),
    logoUrl: cleanText(footer.logoUrl) || undefined,
    menuItems: menuItems.length ? menuItems : fallback.menuItems,
    contact: {
      address: cleanText(footer.contact.address),
      phone: cleanText(footer.contact.phone),
      email: cleanText(footer.contact.email),
      supportHours: cleanText(footer.contact.supportHours) || fallback.contact.supportHours
    },
    systemLinks: systemLinks.length ? systemLinks : fallback.systemLinks,
    copyrightText: cleanText(footer.copyrightText) || fallback.copyrightText,
    isVisible: footer.isVisible === false ? false : true
  };
}
