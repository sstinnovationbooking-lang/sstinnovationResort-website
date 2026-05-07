import type { LeadRequestDTO, LeadResponseDTO, RoomCardDTO, RoomSearchCriteria, SiteHomeDTO } from "@/lib/types/site";

export interface ContentAdapter {
  getSiteHome(tenantSlug?: string | null): Promise<SiteHomeDTO>;
  getRooms(tenantSlug?: string | null, criteria?: RoomSearchCriteria): Promise<RoomCardDTO[]>;
  submitLead(tenantSlug: string | null | undefined, payload: LeadRequestDTO): Promise<LeadResponseDTO>;
}
