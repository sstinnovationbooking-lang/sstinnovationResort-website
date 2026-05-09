import type { HomepageActivitiesDTO, HomepageActivityItemDTO, LocalizedText } from "@/lib/types/site";

export const HOMEPAGE_ACTIVITIES_CONTENT_KEY = "homepage.activities";
export const HOMEPAGE_ACTIVITIES_MAX_ITEMS = 6;

export const DEFAULT_HOMEPAGE_ACTIVITIES: HomepageActivitiesDTO = {
  heading: "กิจกรรมของเรา",
  isVisible: true,
  items: [
    {
      id: "tour",
      title: "ทัวร์และสถานที่ท่องเที่ยว",
      description: "สำรวจแลนด์มาร์กยอดนิยมและประสบการณ์ท้องถิ่นรอบรีสอร์ท",
      imageUrl: "",
      altText: "ทัวร์และสถานที่ท่องเที่ยว",
      order: 1,
      isVisible: true
    },
    {
      id: "kayak",
      title: "กิจกรรมสนุก ๆ",
      description: "กิจกรรมเบา ๆ สำหรับทุกวัยเพื่อเติมความสดชื่นระหว่างการพักผ่อน",
      imageUrl: "",
      altText: "กิจกรรมสนุก ๆ",
      order: 2,
      isVisible: true
    },
    {
      id: "travel",
      title: "ประกันการเดินทาง",
      description: "บริการแนะนำข้อมูลการเดินทางและการดูแลขั้นพื้นฐานเพื่อความอุ่นใจ",
      imageUrl: "",
      altText: "ประกันการเดินทาง",
      order: 3,
      isVisible: true
    },
    {
      id: "nature",
      title: "กิจกรรมกลางแจ้ง",
      description: "สัมผัสธรรมชาติรอบรีสอร์ทผ่านกิจกรรมเอาต์ดอร์ที่ปลอดภัยและเพลิดเพลิน",
      imageUrl: "",
      altText: "กิจกรรมกลางแจ้ง",
      order: 4,
      isVisible: true
    },
    {
      id: "dining",
      title: "อาหารและเครื่องดื่ม",
      description: "ลิ้มลองเมนูอาหารและเครื่องดื่มหลากหลายสไตล์จากทีมครัวของเรา",
      imageUrl: "",
      altText: "อาหารและเครื่องดื่ม",
      order: 5,
      isVisible: true
    },
    {
      id: "relax",
      title: "พักผ่อนและสปา",
      description: "ผ่อนคลายด้วยบริการสปาและพื้นที่พักผ่อนที่ออกแบบเพื่อความสบายสูงสุด",
      imageUrl: "",
      altText: "พักผ่อนและสปา",
      order: 6,
      isVisible: true
    }
  ]
};

const DEFAULT_ACTIVITY_BY_ID: Record<string, HomepageActivityItemDTO> = DEFAULT_HOMEPAGE_ACTIVITIES.items.reduce<
  Record<string, HomepageActivityItemDTO>
>((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

function cloneDefaultActivities(): HomepageActivitiesDTO {
  return {
    ...DEFAULT_HOMEPAGE_ACTIVITIES,
    items: DEFAULT_HOMEPAGE_ACTIVITIES.items.map((item) => ({ ...item }))
  };
}

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

function normalizeActivityItem(value: unknown, index: number): HomepageActivityItemDTO | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Partial<HomepageActivityItemDTO>;
  const id = cleanText(raw.id) || `activity-${index + 1}`;
  const fallback = DEFAULT_ACTIVITY_BY_ID[id];
  const title = normalizeLocalizedText(raw.title) ?? fallback?.title ?? `Activity ${index + 1}`;
  const altText = normalizeLocalizedText(raw.altText) ?? title;

  return {
    id,
    title,
    description: normalizeLocalizedText(raw.description) ?? fallback?.description ?? "",
    imageUrl: cleanText(raw.imageUrl),
    altText,
    order: typeof raw.order === "number" ? raw.order : index + 1,
    isVisible: raw.isVisible === false ? false : true
  };
}

export function isValidHomepageActivities(value: unknown): value is HomepageActivitiesDTO {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<HomepageActivitiesDTO>;
  if (!normalizeLocalizedText(candidate.heading)) return false;
  if (!Array.isArray(candidate.items)) return false;

  const normalized = candidate.items
    .map((item, index) => normalizeActivityItem(item, index))
    .filter((item): item is HomepageActivityItemDTO => item !== null);

  return normalized.length > 0;
}

export function sanitizeHomepageActivities(value: unknown): HomepageActivitiesDTO {
  if (!value || typeof value !== "object") {
    return cloneDefaultActivities();
  }

  const candidate = value as Partial<HomepageActivitiesDTO>;
  const heading = normalizeLocalizedText(candidate.heading) ?? DEFAULT_HOMEPAGE_ACTIVITIES.heading;
  const items = Array.isArray(candidate.items)
    ? candidate.items
      .map((item, index) => normalizeActivityItem(item, index))
      .filter((item): item is HomepageActivityItemDTO => item !== null)
      .sort((a, b) => a.order - b.order)
      .slice(0, HOMEPAGE_ACTIVITIES_MAX_ITEMS)
    : cloneDefaultActivities().items;

  if (items.length === 0 && !Array.isArray(candidate.items)) {
    return cloneDefaultActivities();
  }

  return {
    heading,
    isVisible: candidate.isVisible === false ? false : true,
    items
  };
}
