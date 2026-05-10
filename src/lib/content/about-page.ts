import type { AboutPageDTO, AboutSectionItemDTO, LocalizedText, SiteHomeDTO } from "@/lib/types/site";

function toText(value: unknown): string {
  return String(value ?? "").trim();
}

function asLocalizedText(value: unknown): LocalizedText | undefined {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized || undefined;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const output: Record<string, string> = {};
  for (const [key, candidate] of Object.entries(value)) {
    const text = toText(candidate);
    if (text) output[key] = text;
  }
  return Object.keys(output).length > 0 ? output : undefined;
}

function normalizeSectionItems(input: unknown): AboutSectionItemDTO[] {
  if (!Array.isArray(input)) return [];
  const result: AboutSectionItemDTO[] = [];
  input.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const row = item as Record<string, unknown>;
    const title = asLocalizedText(row.title);
    if (!title) return;

    result.push({
      id: toText(row.id) || `about-section-${index + 1}`,
      title,
      description: asLocalizedText(row.description),
      href: toText(row.href) || undefined,
      order: Number.isFinite(Number(row.order)) ? Number(row.order) : index + 1,
      isVisible: row.isVisible !== false
    });
  });
  return result.sort((a, b) => a.order - b.order);
}

function createTemplateSections(home: SiteHomeDTO): AboutSectionItemDTO[] {
  const tenantSlug = home.tenant.tenantSlug;
  return [
    {
      id: "about-template-1",
      title: { "th-TH": "แนวคิดและบรรยากาศของรีสอร์ต", "en-US": "Resort concept and atmosphere" },
      description: {
        "th-TH": "อธิบายจุดเด่นและเอกลักษณ์ของรีสอร์ต เพื่อสื่อสารภาพรวมให้ผู้เข้าพักเข้าใจได้ง่าย",
        "en-US": "Introduce the unique concept and hospitality style of the resort."
      },
      href: `/site/${tenantSlug}`,
      order: 1,
      isVisible: true
    },
    {
      id: "about-template-2",
      title: { "th-TH": "บริการและสิ่งอำนวยความสะดวก", "en-US": "Services and amenities" },
      description: {
        "th-TH": "สรุปบริการที่รองรับผู้เข้าพัก พร้อมรายละเอียดเบื้องต้นสำหรับการวางแผนทริป",
        "en-US": "Summarize key services and guest-facing facilities."
      },
      href: `/site/${tenantSlug}/rooms`,
      order: 2,
      isVisible: true
    },
    {
      id: "about-template-3",
      title: { "th-TH": "การเดินทางและการติดต่อ", "en-US": "Travel and contact information" },
      description: {
        "th-TH": "ช่องทางติดต่อ แผนที่ และข้อมูลสำคัญก่อนเข้าพัก",
        "en-US": "Contact channels, map access, and key details before arrival."
      },
      href: `/site/${tenantSlug}/contact`,
      order: 3,
      isVisible: true
    }
  ];
}

export function resolveAboutPageContent(home: SiteHomeDTO): AboutPageDTO {
  const raw = (home as unknown as Record<string, unknown>).aboutPage as Record<string, unknown> | undefined;
  const sections = normalizeSectionItems(raw?.sections);

  return {
    eyebrow: asLocalizedText(raw?.eyebrow) ?? { "th-TH": "เรื่องราวของรีสอร์ต", "en-US": "Resort Story" },
    heading: asLocalizedText(raw?.heading) ?? asLocalizedText(raw?.title) ?? { "th-TH": "เกี่ยวกับเรา", "en-US": "About Us" },
    subtitle: asLocalizedText(raw?.subtitle),
    description:
      asLocalizedText(raw?.description) ??
      asLocalizedText(raw?.summary) ??
      {
        "th-TH":
          "หน้าเกี่ยวกับเราเปิดให้เจ้าของรีสอร์ตแต่ละรายเพิ่ม/แก้ไข/ลบหัวข้อเนื้อหาได้จากระบบหลังบ้าน และรองรับการต่อยอดข้อมูลจากระบบกลาง",
        "en-US":
          "The about page supports tenant-specific heading/content management from backoffice, with future-ready central system integration."
      },
    content: asLocalizedText(raw?.content) ?? asLocalizedText(raw?.body),
    imageUrl: toText(raw?.imageUrl) || toText(raw?.image) || undefined,
    imageAlt: asLocalizedText(raw?.imageAlt),
    sections: sections.length > 0 ? sections : createTemplateSections(home),
    isVisible: raw?.isVisible !== false
  };
}
