import type { FeaturedGalleryItemDTO, LocalizedText } from "@/lib/types/site";

export const ROOMS_FEATURED_GALLERY_CONTENT_KEY = "rooms.featuredGallery";
export const ROOMS_FEATURED_GALLERY_MAX_ITEMS = 6;

export const DEFAULT_ROOMS_FEATURED_GALLERY: FeaturedGalleryItemDTO[] = [
  {
    id: "deluxe-king",
    title: "Deluxe King Bed",
    sizeText: "32 sq.m",
    imageUrl: "",
    altText: "Deluxe King Bed",
    order: 1,
    isVisible: true
  },
  {
    id: "deluxe-twin",
    title: "Deluxe Twin Bed",
    sizeText: "32 sq.m",
    imageUrl: "",
    altText: "Deluxe Twin Bed",
    order: 2,
    isVisible: true
  },
  {
    id: "deluxe-triple",
    title: "Deluxe Triple Room",
    sizeText: "32 sq.m",
    imageUrl: "",
    altText: "Deluxe Triple Room",
    order: 3,
    isVisible: true
  }
];

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

function normalizeItem(value: unknown, index: number): FeaturedGalleryItemDTO | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<FeaturedGalleryItemDTO>;

  const id = cleanText(raw.id) || `featured-room-${index + 1}`;
  const title = normalizeLocalizedText(raw.title);
  const sizeText = normalizeLocalizedText(raw.sizeText);
  const imageUrl = cleanText(raw.imageUrl);

  if (!title || !sizeText) return null;

  return {
    id,
    title,
    sizeText,
    imageUrl,
    altText: normalizeLocalizedText(raw.altText) ?? title,
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

