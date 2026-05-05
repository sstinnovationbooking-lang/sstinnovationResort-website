import { getBackendApiBaseUrl, getBackendApiSecret, getContentMode } from "@/lib/env";
import type { LeadRequestDTO, LeadResponseDTO, RoomCardDTO, SiteHomeDTO, TenantContext } from "@/lib/types/site";

function mustBackendBaseUrl(): string {
  const value = getBackendApiBaseUrl();
  if (!value) {
    if (getContentMode() === "api") {
      console.error("[BFF] CONTENT_MODE=api but BACKEND_API_BASE_URL is missing.");
    }
    throw new Error("BACKEND_API_BASE_URL is required in CONTENT_MODE=api");
  }
  return value.replace(/\/$/, "");
}

function buildHeaders(tenant: TenantContext): HeadersInit {
  const secret = getBackendApiSecret();
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-tenant-slug": tenant.tenantSlug
  };
  if (secret) headers["x-internal-secret"] = secret;
  return headers;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Backend API error ${response.status}: ${message || "unknown error"}`);
  }
  return (await response.json()) as T;
}

export async function fetchBackendHome(tenant: TenantContext): Promise<SiteHomeDTO> {
  const baseUrl = mustBackendBaseUrl();
  const response = await fetch(`${baseUrl}/site/home`, {
    method: "GET",
    headers: buildHeaders(tenant),
    cache: "no-store"
  });
  return parseJsonResponse<SiteHomeDTO>(response);
}

export async function fetchBackendRooms(tenant: TenantContext): Promise<RoomCardDTO[]> {
  const baseUrl = mustBackendBaseUrl();
  const response = await fetch(`${baseUrl}/site/rooms`, {
    method: "GET",
    headers: buildHeaders(tenant),
    cache: "no-store"
  });
  return parseJsonResponse<RoomCardDTO[]>(response);
}

export async function sendBackendLead(
  tenant: TenantContext,
  payload: LeadRequestDTO
): Promise<LeadResponseDTO> {
  const baseUrl = mustBackendBaseUrl();
  const response = await fetch(`${baseUrl}/site/leads`, {
    method: "POST",
    headers: buildHeaders(tenant),
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  return parseJsonResponse<LeadResponseDTO>(response);
}
