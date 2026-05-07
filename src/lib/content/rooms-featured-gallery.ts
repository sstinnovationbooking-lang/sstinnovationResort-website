import type { FeaturedGalleryItemDTO } from "@/lib/types/site";

export const ROOMS_FEATURED_GALLERY_CONTENT_KEY = "rooms.featuredGallery";
export const ROOMS_FEATURED_GALLERY_MAX_ITEMS = 6;

export const DEFAULT_ROOMS_FEATURED_GALLERY: FeaturedGalleryItemDTO[] = [
  {
    id: "deluxe-king",
    title: "ห้องดีลักซ์เตียงคิงไซส์",
    sizeText: "พื้นที่ 32 ตร.ม",
    imageUrl: "",
    altText: "ห้องดีลักซ์เตียงคิงไซส์",
    order: 1,
    isVisible: true
  },
  {
    id: "deluxe-twin",
    title: "ห้องดีลักซ์เตียงแฝด",
    sizeText: "พื้นที่ 32 ตร.ม",
    imageUrl: "",
    altText: "ห้องดีลักซ์เตียงแฝด",
    order: 2,
    isVisible: true
  },
  {
    id: "deluxe-triple",
    title: "ห้องดีลักซ์สำหรับสามท่าน",
    sizeText: "พื้นที่ 32 ตร.ม",
    imageUrl: "",
    altText: "ห้องดีลักซ์สำหรับสามท่าน",
    order: 3,
    isVisible: true
  }
];

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeItem(value: unknown, index: number): FeaturedGalleryItemDTO | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<FeaturedGalleryItemDTO>;

  const id = cleanText(raw.id) || `featured-room-${index + 1}`;
  const title = cleanText(raw.title);
  const sizeText = cleanText(raw.sizeText);
  const imageUrl = cleanText(raw.imageUrl);

  if (!title || !sizeText) return null;

  return {
    id,
    title,
    sizeText,
    imageUrl,
    altText: cleanText(raw.altText) || title,
    order: typeof raw.order === "number" ? raw.order : index,
    isVisible: raw.isVisible === false ? false : true
  };
}

export function isValidRoomsFeaturedGallery(value: unknown): value is FeaturedGalleryItemDTO[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const normalized = value
    .map((item, index) => normalizeItem(item, index))
    .filter((item): item is FeaturedGalleryItemDTO => item !== null);

  return normalized.length > 0;
}

export function sanitizeRoomsFeaturedGallery(value: unknown): FeaturedGalleryItemDTO[] {
  if (!Array.isArray(value)) {
    return DEFAULT_ROOMS_FEATURED_GALLERY.map((item) => ({ ...item })).slice(0, ROOMS_FEATURED_GALLERY_MAX_ITEMS);
  }

  const normalized = value
    .map((item, index) => normalizeItem(item, index))
    .filter((item): item is FeaturedGalleryItemDTO => item !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (normalized.length === 0) {
    return DEFAULT_ROOMS_FEATURED_GALLERY.map((item) => ({ ...item })).slice(0, ROOMS_FEATURED_GALLERY_MAX_ITEMS);
  }

  return normalized.slice(0, ROOMS_FEATURED_GALLERY_MAX_ITEMS);
}
