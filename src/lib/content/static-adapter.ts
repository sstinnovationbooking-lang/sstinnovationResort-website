import { getStaticHomeByTenant, getStaticRoomsByTenant } from "@/lib/tenants/static-content";
import type { ContentAdapter } from "@/lib/content/types";
import type { LeadRequestDTO, TenantContext } from "@/types/site";

function ensureLeadPayload(payload: LeadRequestDTO): void {
  if (!payload.name?.trim()) throw new Error("name is required");
  if (!payload.email?.trim() && !payload.phone?.trim()) {
    throw new Error("email or phone is required");
  }
}

export class StaticContentAdapter implements ContentAdapter {
  async getHome(tenant: TenantContext) {
    const data = getStaticHomeByTenant(tenant.tenantSlug);
    if (!data) throw new Error("tenant content not found");
    return data;
  }

  async getRooms(tenant: TenantContext) {
    return getStaticRoomsByTenant(tenant.tenantSlug);
  }

  async submitLead(tenant: TenantContext, payload: LeadRequestDTO) {
    ensureLeadPayload(payload);
    return {
      ok: true as const,
      referenceId: `static-${tenant.tenantId}-${Date.now()}`
    };
  }
}
