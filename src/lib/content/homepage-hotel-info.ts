import type { HomepageHotelInfoDTO, HomepageHotelInfoItemDTO } from "@/lib/types/site";

export const HOMEPAGE_HOTEL_INFO_CONTENT_KEY = "homepage.hotelInfo";

export const DEFAULT_HOMEPAGE_HOTEL_INFO: HomepageHotelInfoDTO = {
  heading: "ข้อมูลโรงแรม",
  isVisible: true,
  items: [
    {
      id: "check-in",
      iconKey: "clock",
      title: "เช็คอิน:",
      description: "",
      order: 1,
      isVisible: true
    },
    {
      id: "check-out",
      iconKey: "clock",
      title: "เช็คเอาท์:",
      description: "",
      order: 2,
      isVisible: true
    },
    {
      id: "minimum-age",
      iconKey: "check",
      title: "อายุขั้นต่ำในการเช็คอิน 18",
      description: "",
      order: 3,
      isVisible: true
    },
    {
      id: "front-desk",
      iconKey: "bell",
      title: "เคาน์เตอร์ต้อนรับ",
      description: "",
      order: 4,
      isVisible: true
    },
    {
      id: "pet-policy",
      iconKey: "pet",
      title: "นโยบายด้านสัตว์เลี้ยง",
      description: "ไม่อนุญาตให้นำสัตว์เลี้ยงเข้าพัก",
      order: 5,
      isVisible: true
    },
    {
      id: "parking",
      iconKey: "parking",
      title: "ที่จอดรถ",
      description: "บริการที่จอดรถฟรี",
      order: 6,
      isVisible: true
    }
  ]
};

function cloneDefaultHotelInfo(): HomepageHotelInfoDTO {
  return {
    ...DEFAULT_HOMEPAGE_HOTEL_INFO,
    items: DEFAULT_HOMEPAGE_HOTEL_INFO.items.map((item) => ({ ...item }))
  };
}

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeHotelInfoItem(value: unknown, index: number): HomepageHotelInfoItemDTO | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<HomepageHotelInfoItemDTO>;
  const title = cleanText(raw.title);
  if (!title) return null;

  return {
    id: cleanText(raw.id) || `hotel-info-${index + 1}`,
    iconKey: cleanText(raw.iconKey) || "info",
    title,
    description: cleanText(raw.description),
    order: typeof raw.order === "number" ? raw.order : index + 1,
    isVisible: raw.isVisible === false ? false : true
  };
}

export function isValidHomepageHotelInfo(value: unknown): value is HomepageHotelInfoDTO {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<HomepageHotelInfoDTO>;
  if (!cleanText(candidate.heading)) return false;
  if (!Array.isArray(candidate.items)) return false;
  const normalized = candidate.items
    .map((item, index) => normalizeHotelInfoItem(item, index))
    .filter((item): item is HomepageHotelInfoItemDTO => item !== null);
  return normalized.length > 0;
}

export function sanitizeHomepageHotelInfo(value: unknown): HomepageHotelInfoDTO {
  if (!value || typeof value !== "object") {
    return cloneDefaultHotelInfo();
  }

  const candidate = value as Partial<HomepageHotelInfoDTO>;
  const heading = cleanText(candidate.heading) || DEFAULT_HOMEPAGE_HOTEL_INFO.heading;
  const items = Array.isArray(candidate.items)
    ? candidate.items
      .map((item, index) => normalizeHotelInfoItem(item, index))
      .filter((item): item is HomepageHotelInfoItemDTO => item !== null)
      .sort((a, b) => a.order - b.order)
    : cloneDefaultHotelInfo().items;

  if (items.length === 0) {
    return cloneDefaultHotelInfo();
  }

  return {
    heading,
    isVisible: candidate.isVisible === false ? false : true,
    items
  };
}
