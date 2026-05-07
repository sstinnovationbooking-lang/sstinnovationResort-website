import { validateLeadPayload } from "@/lib/dto/lead";
import { sanitizeSiteHomeDTO } from "@/lib/dto/normalize";
import { getDefaultTenantSlug } from "@/lib/env";
import { getStaticHomeByTenant, getStaticRoomsByTenant } from "@/lib/tenants/static-content";
import { getTenantBySlug } from "@/lib/tenants/registry";
import type { ContentAdapter } from "@/lib/content/types";
import type { LeadRequestDTO, RoomSearchCriteria } from "@/lib/types/site";

function normalizeTenantSlug(tenantSlug?: string | null): string {
  const normalized = String(tenantSlug ?? "").trim().toLowerCase();
  return normalized || getDefaultTenantSlug();
}

function resolveStaticTenantSlug(tenantSlug?: string | null): string {
  const candidate = normalizeTenantSlug(tenantSlug);
  if (getTenantBySlug(candidate)) return candidate;
  return getDefaultTenantSlug();
}

export class StaticContentAdapter implements ContentAdapter {
  async getSiteHome(tenantSlug?: string | null) {
    const resolvedTenantSlug = resolveStaticTenantSlug(tenantSlug);
    const data = getStaticHomeByTenant(resolvedTenantSlug);
    if (!data) {
      throw new Error("Unable to load tenant content.");
    }
    return sanitizeSiteHomeDTO(data);
  }

  async getRooms(tenantSlug?: string | null, criteria?: RoomSearchCriteria) {
    const resolvedTenantSlug = resolveStaticTenantSlug(tenantSlug);
    const rooms = getStaticRoomsByTenant(resolvedTenantSlug);

    // Static mode keeps mock data simple while preserving backend-compatible query shape.
    if (!criteria?.nights || criteria.nights <= 3) return rooms;
    return [...rooms].sort((a, b) => a.nightlyPriceTHB - b.nightlyPriceTHB);
  }

  async submitLead(tenantSlug: string | null | undefined, payload: LeadRequestDTO) {
    const errors = validateLeadPayload(payload);
    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    const resolvedTenantSlug = resolveStaticTenantSlug(tenantSlug);
    return {
      ok: true as const,
      referenceId: `static-${resolvedTenantSlug}-${Date.now()}`
    };
  }
}
