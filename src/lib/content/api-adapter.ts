import type { ContentAdapter } from "@/lib/content/types";
import { sanitizeSiteHomeDTO } from "@/lib/dto/normalize";
import { getDefaultTenantSlug } from "@/lib/env";
import { toRoomSearchQueryString } from "@/lib/search/room-search";
import type { ApiErrorDTO, LeadRequestDTO, LeadResponseDTO, RoomCardDTO, RoomSearchCriteria, SiteHomeDTO } from "@/lib/types/site";

interface ApiContentAdapterOptions {
  basePath?: string;
}

function normalizeTenantSlug(tenantSlug?: string | null): string {
  const normalized = String(tenantSlug ?? "").trim().toLowerCase();
  return normalized || getDefaultTenantSlug();
}

function buildApiPath(
  basePath: string,
  tenantSlug: string,
  resource: "home" | "rooms" | "leads",
  criteria?: RoomSearchCriteria
): string {
  const base = `${basePath}/api/site/${encodeURIComponent(tenantSlug)}/${resource}`;
  if (resource !== "rooms") return base;
  const query = toRoomSearchQueryString(criteria);
  return query ? `${base}?${query}` : base;
}

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => ({ error: "Unexpected API response format." }));

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "error" in body
        ? String((body as ApiErrorDTO).error)
        : "Unable to load content from BFF.";
    throw new Error(message);
  }

  return body as T;
}

function withFallbackError(error: unknown): Error {
  if (error instanceof Error && error.message.trim()) {
    return error;
  }
  return new Error("Service is temporarily unavailable. Please try again soon.");
}

export class ApiContentAdapter implements ContentAdapter {
  private readonly basePath: string;

  constructor(options?: ApiContentAdapterOptions) {
    this.basePath = String(options?.basePath ?? "").replace(/\/$/, "");
  }

  async getSiteHome(tenantSlug?: string | null): Promise<SiteHomeDTO> {
    try {
      const slug = normalizeTenantSlug(tenantSlug);
      const response = await fetch(buildApiPath(this.basePath, slug, "home"), {
        method: "GET",
        cache: "no-store"
      });
      const data = await parseJsonOrThrow<SiteHomeDTO>(response);
      return sanitizeSiteHomeDTO(data);
    } catch (error) {
      throw withFallbackError(error);
    }
  }

  async getRooms(tenantSlug?: string | null, criteria?: RoomSearchCriteria): Promise<RoomCardDTO[]> {
    try {
      const slug = normalizeTenantSlug(tenantSlug);
      const response = await fetch(buildApiPath(this.basePath, slug, "rooms", criteria), {
        method: "GET",
        cache: "no-store"
      });
      return parseJsonOrThrow<RoomCardDTO[]>(response);
    } catch (error) {
      throw withFallbackError(error);
    }
  }

  async submitLead(tenantSlug: string | null | undefined, payload: LeadRequestDTO): Promise<LeadResponseDTO> {
    try {
      const slug = normalizeTenantSlug(tenantSlug);
      const response = await fetch(buildApiPath(this.basePath, slug, "leads"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store"
      });
      return parseJsonOrThrow<LeadResponseDTO>(response);
    } catch (error) {
      throw withFallbackError(error);
    }
  }
}
