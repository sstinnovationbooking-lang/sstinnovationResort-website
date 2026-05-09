import type { RoomSearchCriteria } from "@/lib/types/site";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_NIGHTS = 1;
const MAX_NIGHTS = 30;
const MIN_GUESTS = 1;

function parseNights(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return undefined;
  if (parsed < MIN_NIGHTS || parsed > MAX_NIGHTS) return undefined;
  return parsed;
}

function parseCheckIn(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!ISO_DATE_PATTERN.test(value)) return undefined;
  return value;
}

function parseGuests(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return undefined;
  if (parsed < MIN_GUESTS) return undefined;
  return parsed;
}

export function parseRoomSearchCriteriaFromSearchParams(searchParams: URLSearchParams): RoomSearchCriteria {
  return {
    checkIn: parseCheckIn(searchParams.get("checkIn")),
    nights: parseNights(searchParams.get("nights")),
    guests: parseGuests(searchParams.get("guests"))
  };
}

export function toRoomSearchQueryString(criteria?: RoomSearchCriteria): string {
  const params = new URLSearchParams();
  if (criteria?.checkIn) params.set("checkIn", criteria.checkIn);
  if (criteria?.nights) params.set("nights", String(criteria.nights));
  if (criteria?.guests && criteria.guests >= MIN_GUESTS) params.set("guests", String(criteria.guests));
  return params.toString();
}
