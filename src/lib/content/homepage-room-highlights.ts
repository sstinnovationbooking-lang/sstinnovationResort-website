import type { HomepageRoomHighlightItemDTO, HomepageRoomHighlightsDTO, LocalizedText } from "@/lib/types/site";

export const HOMEPAGE_ROOM_HIGHLIGHTS_CONTENT_KEY = "homepage.roomHighlights";
export const HOMEPAGE_ROOM_HIGHLIGHTS_MAX_ITEMS = 4;
export const HOMEPAGE_ROOM_HIGHLIGHTS_DEFAULT_DISPLAY_LIMIT = 1;

export const DEFAULT_HOMEPAGE_ROOM_HIGHLIGHTS: HomepageRoomHighlightsDTO = {
  isVisible: true,
  maxItems: HOMEPAGE_ROOM_HIGHLIGHTS_MAX_ITEMS,
  displayLimit: HOMEPAGE_ROOM_HIGHLIGHTS_DEFAULT_DISPLAY_LIMIT,
  items: [
    {
      id: "deluxe-king-bed",
      title: "DELUXE KING BED",
      subtitle: "30 SQUARE METERS OF SPACE",
      description:
        "Deluxe King Bed is a private room, designed for a single guest or a couple. Equipped with a king-sized bed, comfortable bedding, and great amenities.",
      buttonText: "READ MORE",
      buttonHref: "/rooms",
      imageUrl: "",
      imageAlt: "Deluxe King Bed",
      imagePosition: "left",
      order: 1,
      isVisible: true
    },
    {
      id: "deluxe-twin-bed",
      title: "DELUXE TWIN BED",
      subtitle: "30 SQUARE METERS OF SPACE",
      description:
        "Deluxe Twin Room is a spacious room with two separate beds. This room is ideal for couples or friends who wish to stay in the same room.",
      buttonText: "READ MORE",
      buttonHref: "/rooms",
      imageUrl: "",
      imageAlt: "Deluxe Twin Bed",
      imagePosition: "right",
      order: 2,
      isVisible: false
    },
    {
      id: "deluxe-triple-room",
      title: "DELUXE TRIPLE ROOM",
      subtitle: "32 SQUARE METERS OF SPACE",
      description:
        "A comfortable room designed for small groups or families, with practical space and relaxing resort-style atmosphere.",
      buttonText: "READ MORE",
      buttonHref: "/rooms",
      imageUrl: "",
      imageAlt: "Deluxe Triple Room",
      imagePosition: "left",
      order: 3,
      isVisible: false
    },
    {
      id: "private-villa",
      title: "PRIVATE VILLA",
      subtitle: "RELAXING PRIVATE SPACE",
      description:
        "A private villa-style stay with a peaceful atmosphere, ideal for guests who want comfort, privacy, and a premium resort experience.",
      buttonText: "READ MORE",
      buttonHref: "/rooms",
      imageUrl: "",
      imageAlt: "Private Villa",
      imagePosition: "right",
      order: 4,
      isVisible: false
    }
  ]
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

function normalizeImagePosition(value: unknown): "left" | "right" | undefined {
  const raw = cleanText(value).toLowerCase();
  if (raw === "left") return "left";
  if (raw === "right") return "right";
  return undefined;
}

function normalizePositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }
  const raw = cleanText(value);
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampToSupportedLimit(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(HOMEPAGE_ROOM_HIGHLIGHTS_MAX_ITEMS, Math.max(1, Math.floor(value)));
}

function normalizeItem(value: unknown, index: number): HomepageRoomHighlightItemDTO | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<HomepageRoomHighlightItemDTO>;

  const title = normalizeLocalizedText(raw.title);
  const description = normalizeLocalizedText(raw.description);
  if (!title || !description) return null;

  return {
    id: cleanText(raw.id) || `room-highlight-${index + 1}`,
    title,
    subtitle: normalizeLocalizedText(raw.subtitle) ?? "",
    description,
    buttonText: normalizeLocalizedText(raw.buttonText) ?? "",
    buttonHref: cleanText(raw.buttonHref),
    imageUrl: cleanText(raw.imageUrl),
    imageAlt: normalizeLocalizedText(raw.imageAlt) ?? title,
    imagePosition: normalizeImagePosition(raw.imagePosition),
    order: typeof raw.order === "number" ? raw.order : index + 1,
    isVisible: raw.isVisible === false ? false : true
  };
}

export function isValidHomepageRoomHighlights(value: unknown): value is HomepageRoomHighlightsDTO {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<HomepageRoomHighlightsDTO>;
  if (!Array.isArray(candidate.items)) return false;

  const normalized = candidate.items
    .map((item, index) => normalizeItem(item, index))
    .filter((item): item is HomepageRoomHighlightItemDTO => item !== null);

  return normalized.length > 0;
}

export function sanitizeHomepageRoomHighlights(value: unknown): HomepageRoomHighlightsDTO {
  if (!value || typeof value !== "object") {
    return {
      ...DEFAULT_HOMEPAGE_ROOM_HIGHLIGHTS,
      items: DEFAULT_HOMEPAGE_ROOM_HIGHLIGHTS.items.map((item) => ({ ...item }))
    };
  }

  const candidate = value as Partial<HomepageRoomHighlightsDTO>;
  const legacyMaxVisibleItems = (candidate as Record<string, unknown>).maxVisibleItems;
  const effectiveMaxItems = clampToSupportedLimit(
    normalizePositiveInt(candidate.maxItems) ?? HOMEPAGE_ROOM_HIGHLIGHTS_MAX_ITEMS,
    HOMEPAGE_ROOM_HIGHLIGHTS_MAX_ITEMS
  );
  const normalizedDisplayLimit =
    normalizePositiveInt(candidate.displayLimit) ??
    normalizePositiveInt(legacyMaxVisibleItems) ??
    HOMEPAGE_ROOM_HIGHLIGHTS_DEFAULT_DISPLAY_LIMIT;
  const effectiveDisplayLimit = Math.min(
    effectiveMaxItems,
    clampToSupportedLimit(
      normalizedDisplayLimit,
      HOMEPAGE_ROOM_HIGHLIGHTS_DEFAULT_DISPLAY_LIMIT
    )
  );
  const items = Array.isArray(candidate.items)
    ? candidate.items
      .map((item, index) => normalizeItem(item, index))
      .filter((item): item is HomepageRoomHighlightItemDTO => item !== null)
      .sort((a, b) => a.order - b.order)
      .slice(0, effectiveMaxItems)
    : [];

  if (items.length === 0) {
    return {
      ...DEFAULT_HOMEPAGE_ROOM_HIGHLIGHTS,
      items: DEFAULT_HOMEPAGE_ROOM_HIGHLIGHTS.items.map((item) => ({ ...item }))
    };
  }

  return {
    isVisible: candidate.isVisible === false ? false : true,
    maxItems: effectiveMaxItems,
    displayLimit: effectiveDisplayLimit,
    items
  };
}
