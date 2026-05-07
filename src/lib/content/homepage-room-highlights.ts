import type { HomepageRoomHighlightItemDTO, HomepageRoomHighlightsDTO } from "@/lib/types/site";

export const HOMEPAGE_ROOM_HIGHLIGHTS_CONTENT_KEY = "homepage.roomHighlights";
export const HOMEPAGE_ROOM_HIGHLIGHTS_MAX_ITEMS = 4;

export const DEFAULT_HOMEPAGE_ROOM_HIGHLIGHTS: HomepageRoomHighlightsDTO = {
  isVisible: true,
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
      isVisible: true
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
      isVisible: true
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
      isVisible: true
    }
  ]
};

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeImagePosition(value: unknown): "left" | "right" | undefined {
  const raw = cleanText(value).toLowerCase();
  if (raw === "left") return "left";
  if (raw === "right") return "right";
  return undefined;
}

function normalizeItem(value: unknown, index: number): HomepageRoomHighlightItemDTO | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<HomepageRoomHighlightItemDTO>;

  const title = cleanText(raw.title);
  const description = cleanText(raw.description);
  if (!title || !description) return null;

  return {
    id: cleanText(raw.id) || `room-highlight-${index + 1}`,
    title,
    subtitle: cleanText(raw.subtitle),
    description,
    buttonText: cleanText(raw.buttonText),
    buttonHref: cleanText(raw.buttonHref),
    imageUrl: cleanText(raw.imageUrl),
    imageAlt: cleanText(raw.imageAlt) || title,
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
  const items = Array.isArray(candidate.items)
    ? candidate.items
      .map((item, index) => normalizeItem(item, index))
      .filter((item): item is HomepageRoomHighlightItemDTO => item !== null)
      .sort((a, b) => a.order - b.order)
      .slice(0, HOMEPAGE_ROOM_HIGHLIGHTS_MAX_ITEMS)
    : [];

  if (items.length === 0) {
    return {
      ...DEFAULT_HOMEPAGE_ROOM_HIGHLIGHTS,
      items: DEFAULT_HOMEPAGE_ROOM_HIGHLIGHTS.items.map((item) => ({ ...item }))
    };
  }

  return {
    isVisible: candidate.isVisible === false ? false : true,
    items
  };
}

