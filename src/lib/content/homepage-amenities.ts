import type { HomepageAmenitiesDTO, HomepageAmenityItemDTO } from "@/lib/types/site";

export const HOMEPAGE_AMENITIES_CONTENT_KEY = "homepage.amenities";

export const DEFAULT_HOMEPAGE_AMENITIES: HomepageAmenitiesDTO = {
  eyebrow: "บริการของเรา",
  heading: "สิ่งอำนวยความสะดวกของโรงแรม",
  isVisible: true,
  items: [
    {
      id: "security",
      iconKey: "security-camera",
      title: "ความปลอดภัย",
      description: "ระบบรักษาความปลอดภัยและกล้อง CCTV เพื่อความอุ่นใจของผู้เข้าพัก",
      order: 1,
      isVisible: true
    },
    {
      id: "laundry",
      iconKey: "laundry",
      title: "ซักรีดและซักแห้ง",
      description: "บริการซักรีดสำหรับผู้เข้าพัก เพื่อความสะดวกสบายตลอดการเข้าพัก",
      order: 2,
      isVisible: true
    },
    {
      id: "shuttle",
      iconKey: "shuttle",
      title: "บริการรถรับส่ง",
      description: "บริการรถรับส่งสำหรับผู้เข้าพัก ตามเงื่อนไขของรีสอร์ท",
      order: 3,
      isVisible: true
    },
    {
      id: "wifi",
      iconKey: "wifi",
      title: "อินเทอร์เน็ต Wi-Fi",
      description: "บริการอินเทอร์เน็ตไร้สายสำหรับผู้เข้าพักในพื้นที่ที่กำหนด",
      order: 4,
      isVisible: true
    },
    {
      id: "breakfast",
      iconKey: "breakfast",
      title: "อาหารเช้า",
      description: "บริการอาหารเช้าสำหรับผู้เข้าพักตามแพ็กเกจที่เลือก",
      order: 5,
      isVisible: true
    },
    {
      id: "support",
      iconKey: "support",
      title: "บริการลูกค้า",
      description: "ทีมงานพร้อมดูแลและให้ข้อมูลสำหรับการเข้าพักของคุณ",
      order: 6,
      isVisible: true
    }
  ]
};

function cloneDefaultAmenities(): HomepageAmenitiesDTO {
  return {
    ...DEFAULT_HOMEPAGE_AMENITIES,
    items: DEFAULT_HOMEPAGE_AMENITIES.items.map((item) => ({ ...item }))
  };
}

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeAmenityItem(value: unknown, index: number): HomepageAmenityItemDTO | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<HomepageAmenityItemDTO>;
  const title = cleanText(raw.title);
  const description = cleanText(raw.description);
  if (!title || !description) return null;

  return {
    id: cleanText(raw.id) || `amenity-${index + 1}`,
    iconKey: cleanText(raw.iconKey) || "support",
    title,
    description,
    order: typeof raw.order === "number" ? raw.order : index + 1,
    isVisible: raw.isVisible === false ? false : true
  };
}

export function isValidHomepageAmenities(value: unknown): value is HomepageAmenitiesDTO {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<HomepageAmenitiesDTO>;

  if (!cleanText(candidate.eyebrow) || !cleanText(candidate.heading)) {
    return false;
  }

  if (!Array.isArray(candidate.items)) {
    return false;
  }

  return candidate.items.every((item, index) => normalizeAmenityItem(item, index) !== null);
}

export function sanitizeHomepageAmenities(value: unknown): HomepageAmenitiesDTO {
  if (!value || typeof value !== "object") {
    return cloneDefaultAmenities();
  }

  const candidate = value as Partial<HomepageAmenitiesDTO>;
  const eyebrow = cleanText(candidate.eyebrow) || DEFAULT_HOMEPAGE_AMENITIES.eyebrow;
  const heading = cleanText(candidate.heading) || DEFAULT_HOMEPAGE_AMENITIES.heading;
  const items = Array.isArray(candidate.items)
    ? candidate.items
      .map((item, index) => normalizeAmenityItem(item, index))
      .filter((item): item is HomepageAmenityItemDTO => item !== null)
      .sort((a, b) => a.order - b.order)
      .slice(0, 6)
    : cloneDefaultAmenities().items;

  if (items.length === 0 && !Array.isArray(candidate.items)) {
    return cloneDefaultAmenities();
  }

  return {
    eyebrow,
    heading,
    isVisible: candidate.isVisible === false ? false : true,
    items
  };
}
