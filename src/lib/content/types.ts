import type { LeadRequestDTO, LeadResponseDTO, RoomCardDTO, SiteHomeDTO } from "@/lib/types/site";

export interface ContentAdapter {
  getSiteHome(tenantSlug?: string | null): Promise<SiteHomeDTO>;
  getRooms(tenantSlug?: string | null): Promise<RoomCardDTO[]>;
  submitLead(tenantSlug: string | null | undefined, payload: LeadRequestDTO): Promise<LeadResponseDTO>;
}
