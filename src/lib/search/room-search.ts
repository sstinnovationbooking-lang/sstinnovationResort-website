import type { RoomSearchCriteria } from "@/lib/types/site";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SLASH_DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
const SLASH_MONTH_YEAR_COMPACT_PATTERN = /^(\d{1,2})\/(\d{2})(\d{4})$/;
const DASH_DATE_PATTERN = /^(\d{1,2})-(\d{1,2})-(\d{2,4})$/;
const COMPACT_DATE_PATTERN = /^(\d{8})$/;
const MIN_NIGHTS = 1;
const MAX_NIGHTS = 30;
const MIN_GUESTS = 1;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toIsoDate(yearValue: number, monthValue: number, dayValue: number): string | undefined {
  let year = Math.floor(yearValue);
  const month = Math.floor(monthValue);
  const day = Math.floor(dayValue);

  if (year >= 2400) {
    year -= 543;
  } else if (year >= 0 && year <= 99) {
    year += 2000;
  }

  if (year < 1900 || year > 2600) return undefined;
  if (month < 1 || month > 12) return undefined;
  if (day < 1 || day > 31) return undefined;

  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() + 1 !== month ||
    probe.getUTCDate() !== day
  ) {
    return undefined;
  }

  return `${String(year).padStart(4, "0")}-${pad2(month)}-${pad2(day)}`;
}

export function normalizeRoomSearchCheckInInput(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value) return undefined;

  if (ISO_DATE_PATTERN.test(value)) {
    const [year, month, day] = value.split("-").map((item) => Number.parseInt(item, 10));
    return toIsoDate(year, month, day);
  }

  const slashMatch = value.match(SLASH_DATE_PATTERN);
  if (slashMatch) {
    return toIsoDate(
      Number.parseInt(slashMatch[3], 10),
      Number.parseInt(slashMatch[2], 10),
      Number.parseInt(slashMatch[1], 10)
    );
  }

  const compactSlashMatch = value.match(SLASH_MONTH_YEAR_COMPACT_PATTERN);
  if (compactSlashMatch) {
    return toIsoDate(
      Number.parseInt(compactSlashMatch[3], 10),
      Number.parseInt(compactSlashMatch[2], 10),
      Number.parseInt(compactSlashMatch[1], 10)
    );
  }

  const dashMatch = value.match(DASH_DATE_PATTERN);
  if (dashMatch) {
    return toIsoDate(
      Number.parseInt(dashMatch[3], 10),
      Number.parseInt(dashMatch[2], 10),
      Number.parseInt(dashMatch[1], 10)
    );
  }

  const compactMatch = value.match(COMPACT_DATE_PATTERN);
  if (compactMatch) {
    const digits = compactMatch[1];
    return toIsoDate(
      Number.parseInt(digits.slice(4), 10),
      Number.parseInt(digits.slice(2, 4), 10),
      Number.parseInt(digits.slice(0, 2), 10)
    );
  }

  return undefined;
}

function parseNights(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return undefined;
  if (parsed < MIN_NIGHTS || parsed > MAX_NIGHTS) return undefined;
  return parsed;
}

function parseCheckIn(raw: string | null): string | undefined {
  return normalizeRoomSearchCheckInInput(raw);
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
  const normalizedCheckIn = normalizeRoomSearchCheckInInput(criteria?.checkIn);
  if (normalizedCheckIn) params.set("checkIn", normalizedCheckIn);
  if (criteria?.nights) params.set("nights", String(criteria.nights));
  if (criteria?.guests && criteria.guests >= MIN_GUESTS) params.set("guests", String(criteria.guests));
  return params.toString();
}
