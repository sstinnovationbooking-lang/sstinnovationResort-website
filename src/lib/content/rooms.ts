import type { RoomCardDTO, RoomSearchCriteria, TenantContext } from "@/lib/types/site";

type TenantIdentity = Pick<TenantContext, "tenantSlug" | "ownerId" | "resortId">;

const FALLBACK_ROOM_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23e9efe8'/%3E%3Cstop offset='1' stop-color='%23dfe9df'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23g)'/%3E%3Cpath d='M90 620c165-150 330-150 495 0s330 150 495 0' fill='none' stroke='%23c0d2c3' stroke-width='24' stroke-linecap='round'/%3E%3C/svg%3E";

const DEFAULT_CURRENCY = "THB";
const DEFAULT_LOW_AVAILABILITY_THRESHOLD = 2;

function asText(value: unknown): string | null {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toIsoDate(value: unknown): string | undefined {
  const text = asText(value);
  if (!text) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return undefined;
  return text;
}

function asGallery(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asText(item))
    .filter((item): item is string => Boolean(item));
}

function asStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map((item) => asText(item))
    .filter((item): item is string => Boolean(item));
  return items.length > 0 ? items : undefined;
}

function normalizeAvailabilityStatus(value: unknown): "available" | "unavailable" | "soldout" | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "available" || normalized === "open") return "available";
  if (normalized === "unavailable" || normalized === "not_available" || normalized === "closed") return "unavailable";
  if (normalized === "soldout" || normalized === "sold_out" || normalized === "full") return "soldout";
  return null;
}

function normalizeRoomRecord(
  raw: unknown,
  index: number,
  tenantIdentity?: TenantIdentity,
  forcedAvailable?: boolean
): RoomCardDTO | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const id = asText(record.id) ?? asText(record.roomId) ?? `room-${index + 1}`;
  const name = asText(record.name) ?? asText(record.title) ?? `Room ${index + 1}`;
  const title = asText(record.title) ?? name;
  const description =
    asText(record.description) ??
    asText(record.summary) ??
    asText(record.longDescription) ??
    "Comfortable room with resort amenities.";

  const gallery = asGallery(record.gallery);
  const image =
    asText(record.image) ??
    asText(record.imageUrl) ??
    asText(record.photoUrl) ??
    gallery[0] ??
    FALLBACK_ROOM_IMAGE;

  const nightlyPriceTHB =
    asNumber(record.nightlyPriceTHB) ??
    asNumber(record.pricePerNight) ??
    asNumber(record.price) ??
    0;
  const currency = asText(record.currency)?.toUpperCase() ?? DEFAULT_CURRENCY;
  const availableRoomsRaw =
    asNumber(record.availableRooms) ??
    asNumber(record.roomsAvailable) ??
    asNumber(record.inventoryAvailable);
  const totalRoomsRaw =
    asNumber(record.totalRooms) ??
    asNumber(record.inventoryTotal) ??
    asNumber(record.roomInventory);
  const status = normalizeAvailabilityStatus(record.status);
  const isAvailable =
    typeof forcedAvailable === "boolean"
      ? forcedAvailable
      : typeof record.isAvailable === "boolean"
        ? record.isAvailable
        : availableRoomsRaw !== null
          ? availableRoomsRaw > 0
          : status === "available"
            ? true
            : status === "unavailable" || status === "soldout"
              ? false
              : true;

  const availableRooms =
    availableRoomsRaw !== null
      ? Math.max(0, Math.floor(availableRoomsRaw))
      : isAvailable
        ? 1
        : 0;
  const totalRooms =
    totalRoomsRaw !== null
      ? Math.max(0, Math.floor(totalRoomsRaw))
      : availableRooms > 0
        ? Math.max(availableRooms, 1)
        : 0;

  return {
    id,
    tenantSlug: tenantIdentity?.tenantSlug ?? asText(record.tenantSlug) ?? undefined,
    ownerId: tenantIdentity?.ownerId ?? asText(record.ownerId) ?? undefined,
    resortId: tenantIdentity?.resortId ?? asText(record.resortId) ?? asText(record.tenantId) ?? undefined,
    name,
    title,
    description,
    image,
    imageUrl: image,
    gallery,
    sizeSqm: asNumber(record.sizeSqm) ?? asNumber(record.sizeM2) ?? asNumber(record.roomSize) ?? undefined,
    maxGuests: asNumber(record.maxGuests) ?? asNumber(record.capacityGuests) ?? asNumber(record.guests) ?? undefined,
    pricePerNight: nightlyPriceTHB,
    currency,
    availableRooms,
    totalRooms,
    isAvailable,
    cancellationPolicy: asText(record.cancellationPolicy) ?? asText(record.policy) ?? undefined,
    taxFeeNote: asText(record.taxFeeNote) ?? asText(record.taxesIncludedText) ?? undefined,
    lowAvailabilityThreshold:
      asNumber(record.lowAvailabilityThreshold) ?? DEFAULT_LOW_AVAILABILITY_THRESHOLD,
    roomType: asText(record.roomType) ?? asText(record.type) ?? undefined,
    category: asText(record.category) ?? asText(record.badge) ?? undefined,
    sortOrder: asNumber(record.sortOrder) ?? asNumber(record.order) ?? index + 1,
    detailsUrl: asText(record.detailsUrl) ?? undefined,
    amenities: asStringList(record.amenities),
    features: asStringList(record.features),
    nightlyPriceTHB,
    badge: asText(record.badge) ?? asText(record.category) ?? undefined
  };
}

function normalizeRoomsArray(
  rooms: unknown[],
  tenantIdentity?: TenantIdentity,
  forcedAvailable?: boolean
): RoomCardDTO[] {
  return rooms
    .map((item, index) => normalizeRoomRecord(item, index, tenantIdentity, forcedAvailable))
    .filter((item): item is RoomCardDTO => item !== null)
    .sort((a, b) => {
      const orderA = Number.isFinite(a.sortOrder) ? Number(a.sortOrder) : Number.MAX_SAFE_INTEGER;
      const orderB = Number.isFinite(b.sortOrder) ? Number(b.sortOrder) : Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
}

export function sanitizeRoomsPayload(payload: unknown, tenantIdentity?: TenantIdentity): RoomCardDTO[] {
  if (Array.isArray(payload)) {
    return normalizeRoomsArray(payload, tenantIdentity);
  }

  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const directRooms =
    (Array.isArray(record.rooms) ? record.rooms : null) ??
    (Array.isArray(record.items) ? record.items : null);
  if (directRooms?.length) {
    return normalizeRoomsArray(directRooms, tenantIdentity);
  }

  if (record.data && typeof record.data === "object") {
    const nested = record.data as Record<string, unknown>;
    const nestedRooms =
      (Array.isArray(nested.rooms) ? nested.rooms : null) ??
      (Array.isArray(nested.items) ? nested.items : null);
    if (nestedRooms?.length) {
      return normalizeRoomsArray(nestedRooms, tenantIdentity);
    }
  }

  const available = Array.isArray(record.availableRooms) ? record.availableRooms : [];
  const unavailable = Array.isArray(record.unavailableRooms) ? record.unavailableRooms : [];

  if (available.length || unavailable.length) {
    const availableRooms = normalizeRoomsArray(available, tenantIdentity, true);
    const unavailableRooms = normalizeRoomsArray(unavailable, tenantIdentity, false).map((room) => ({
      ...room,
      isAvailable: false,
      availableRooms: 0
    }));
    return [...availableRooms, ...unavailableRooms];
  }

  return [];
}

export function normalizeRoomSearchCriteria(criteria?: RoomSearchCriteria) {
  const nights = criteria?.nights && criteria.nights >= 1 && criteria.nights <= 30 ? criteria.nights : 1;
  const guests = criteria?.guests && criteria.guests >= 1 ? criteria.guests : 2;
  const checkIn = toIsoDate(criteria?.checkIn);

  return {
    checkIn,
    nights,
    guests
  };
}
