import { fetchBackendHome, fetchBackendRooms, sendBackendLead } from "@/lib/api/backend-client";
import type { ContentAdapter } from "@/lib/content/types";
import type { LeadRequestDTO, TenantContext } from "@/types/site";

export class ApiContentAdapter implements ContentAdapter {
  async getHome(tenant: TenantContext) {
    return fetchBackendHome(tenant);
  }

  async getRooms(tenant: TenantContext) {
    return fetchBackendRooms(tenant);
  }

  async submitLead(tenant: TenantContext, payload: LeadRequestDTO) {
    return sendBackendLead(tenant, payload);
  }
}
