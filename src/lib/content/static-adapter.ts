import { validateLeadPayload } from "@/lib/dto/lead";
import { sanitizeSiteHomeDTO } from "@/lib/dto/normalize";
import { getDefaultTenantSlug } from "@/lib/env";
import { normalizeRoomSearchCriteria, sanitizeRoomsPayload } from "@/lib/content/rooms";
import { getStaticHomeByTenant, getStaticRoomsByTenant } from "@/lib/tenants/static-content";
import { getTenantBySlug } from "@/lib/tenants/registry";
import type { ContentAdapter } from "@/lib/content/types";
import type { LeadRequestDTO, RoomSearchCriteria } from "@/lib/types/site";

function normalizeTenantSlug(tenantSlug?: string | null): string {
  const normalized = String(tenantSlug ?? "").trim().toLowerCase();
  return normalized || getDefaultTenantSlug();
}

function resolveStaticTenantSlug(
  tenantSlug?: string | null,
  options?: { allowDefaultFallback?: boolean }
): string | null {
  const normalizedInput = String(tenantSlug ?? "").trim().toLowerCase();
  const allowDefaultFallback = options?.allowDefaultFallback ?? true;

  if (!normalizedInput) {
    return allowDefaultFallback ? getDefaultTenantSlug() : null;
  }

  const candidate = normalizeTenantSlug(normalizedInput);
  if (getTenantBySlug(candidate)) return candidate;
  return null;
}

export class StaticContentAdapter implements ContentAdapter {
  async getSiteHome(tenantSlug?: string | null) {
    const resolvedTenantSlug = resolveStaticTenantSlug(tenantSlug, { allowDefaultFallback: true });
    if (!resolvedTenantSlug) {
      throw new Error("Unknown tenant slug.");
    }
    const data = getStaticHomeByTenant(resolvedTenantSlug);
    if (!data) {
      throw new Error("Unable to load tenant content.");
    }
    return sanitizeSiteHomeDTO(data);
  }

  async getRooms(tenantSlug?: string | null, criteria?: RoomSearchCriteria) {
    const resolvedTenantSlug = resolveStaticTenantSlug(tenantSlug, { allowDefaultFallback: true });
    if (!resolvedTenantSlug) {
      throw new Error("Unknown tenant slug.");
    }
    const tenant = getTenantBySlug(resolvedTenantSlug);
    const rooms = sanitizeRoomsPayload(getStaticRoomsByTenant(resolvedTenantSlug), tenant ?? undefined);
    const normalizedCriteria = normalizeRoomSearchCriteria(criteria);
    const guests = Number(normalizedCriteria.guests ?? 0);
    const hasSearchDate = Boolean(normalizedCriteria.checkIn);
    const searchFilteredRooms = hasSearchDate
      ? rooms.filter((room) => {
          const isAvailable = typeof room.availableRooms === "number" ? room.availableRooms > 0 : room.isAvailable !== false;
          if (!isAvailable) return false;
          if (guests >= 1 && typeof room.maxGuests === "number" && room.maxGuests > 0) {
            return room.maxGuests >= guests;
          }
          return true;
        })
      : rooms;

    // Static mode keeps mock data simple while preserving backend-compatible query shape.
    if (!criteria?.nights || criteria.nights <= 3) return searchFilteredRooms;
    return [...searchFilteredRooms].sort((a, b) => (a.pricePerNight ?? a.nightlyPriceTHB) - (b.pricePerNight ?? b.nightlyPriceTHB));
  }

  async submitLead(tenantSlug: string | null | undefined, payload: LeadRequestDTO) {
    const errors = validateLeadPayload(payload);
    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    const resolvedTenantSlug = resolveStaticTenantSlug(tenantSlug, { allowDefaultFallback: true });
    if (!resolvedTenantSlug) {
      throw new Error("Unknown tenant slug.");
    }
    return {
      ok: true as const,
      referenceId: `static-${resolvedTenantSlug}-${Date.now()}`
    };
  }
}
