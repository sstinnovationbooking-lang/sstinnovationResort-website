import type { LeadRequestDTO, RoomCardDTO, SiteHomeDTO, TenantContext } from "@/types/site";

export interface ContentAdapter {
  getHome(tenant: TenantContext): Promise<SiteHomeDTO>;
  getRooms(tenant: TenantContext): Promise<RoomCardDTO[]>;
  submitLead(tenant: TenantContext, payload: LeadRequestDTO): Promise<{ ok: true; referenceId: string }>;
}
