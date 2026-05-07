import {
  getBackendApiBaseUrl,
  getBackendApiSecret,
  getCentralApiBaseUrl,
  getCentralApiSecret,
  getContentMode
} from "@/lib/env";
import { isValidSiteFooter } from "@/lib/content/footer";
import { isValidHomepageAmenities } from "@/lib/content/homepage-amenities";
import { isValidHomepageHotelInfo } from "@/lib/content/homepage-hotel-info";
import { isValidHomepageRoomHighlights } from "@/lib/content/homepage-room-highlights";
import { isValidRoomsFeaturedGallery } from "@/lib/content/rooms-featured-gallery";
import { isValidRoomsIntro } from "@/lib/content/rooms-intro";
import { toRoomSearchQueryString } from "@/lib/search/room-search";
import { getStaticHomeByTenant } from "@/lib/tenants/static-content";
import type { LeadRequestDTO, LeadResponseDTO, RoomCardDTO, RoomSearchCriteria, SiteHomeDTO, TenantContext } from "@/lib/types/site";

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

function normalizeOptionalBaseUrl(value: string): string | null {
  const normalized = String(value).trim().replace(/\/$/, "");
  return normalized || null;
}

function buildHeaders(tenant: TenantContext, secret: string): HeadersInit {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-tenant-slug": tenant.tenantSlug,
    "x-tenant-id": tenant.resortId,
    "x-resort-id": tenant.resortId,
    "x-owner-id": tenant.ownerId
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

async function fetchHomeFromBaseUrl(baseUrl: string, tenant: TenantContext, secret: string): Promise<SiteHomeDTO> {
  const response = await fetch(`${baseUrl}/site/home`, {
    method: "GET",
    headers: buildHeaders(tenant, secret),
    cache: "no-store"
  });
  return parseJsonResponse<SiteHomeDTO>(response);
}

export async function fetchBackendHome(tenant: TenantContext): Promise<SiteHomeDTO> {
  const backendBaseUrl = mustBackendBaseUrl();
  const backendSecret = getBackendApiSecret();
  const centralBaseUrl = normalizeOptionalBaseUrl(getCentralApiBaseUrl());
  const centralSecret = getCentralApiSecret() || backendSecret;
  const staticHome = getStaticHomeByTenant(tenant.tenantSlug);

  try {
    const backendHome = await fetchHomeFromBaseUrl(backendBaseUrl, tenant, backendSecret);
    const needsAmenitiesFallback = !isValidHomepageAmenities(backendHome.homepageAmenities);
    const needsHotelInfoFallback = !isValidHomepageHotelInfo(backendHome.homepageHotelInfo);
    const needsRoomHighlightsFallback = !isValidHomepageRoomHighlights(backendHome.homepageRoomHighlights);
    const needsRoomsIntroFallback = !isValidRoomsIntro(backendHome.roomsIntro);
    const needsRoomsFeaturedGalleryFallback = !isValidRoomsFeaturedGallery(backendHome.roomsFeaturedGallery);
    const needsFooterFallback = !isValidSiteFooter(backendHome.footer);

    if (
      !centralBaseUrl ||
      (
        !needsAmenitiesFallback &&
        !needsHotelInfoFallback &&
        !needsRoomHighlightsFallback &&
        !needsRoomsIntroFallback &&
        !needsRoomsFeaturedGalleryFallback &&
        !needsFooterFallback
      )
    ) {
      return {
        ...backendHome,
        homepageAmenities:
          needsAmenitiesFallback && isValidHomepageAmenities(staticHome?.homepageAmenities)
            ? staticHome?.homepageAmenities
            : backendHome.homepageAmenities,
        homepageHotelInfo:
          needsHotelInfoFallback && isValidHomepageHotelInfo(staticHome?.homepageHotelInfo)
            ? staticHome?.homepageHotelInfo
            : backendHome.homepageHotelInfo,
        homepageRoomHighlights:
          needsRoomHighlightsFallback && isValidHomepageRoomHighlights(staticHome?.homepageRoomHighlights)
            ? staticHome?.homepageRoomHighlights
            : backendHome.homepageRoomHighlights,
        roomsFeaturedGallery:
          needsRoomsFeaturedGalleryFallback && isValidRoomsFeaturedGallery(staticHome?.roomsFeaturedGallery)
            ? staticHome?.roomsFeaturedGallery
            : backendHome.roomsFeaturedGallery
      };
    }

    try {
      const centralHome = await fetchHomeFromBaseUrl(centralBaseUrl, tenant, centralSecret);
      return {
        ...backendHome,
        homepageAmenities:
          needsAmenitiesFallback && isValidHomepageAmenities(centralHome.homepageAmenities)
            ? centralHome.homepageAmenities
            : needsAmenitiesFallback && isValidHomepageAmenities(staticHome?.homepageAmenities)
              ? staticHome?.homepageAmenities
              : backendHome.homepageAmenities,
        homepageHotelInfo:
          needsHotelInfoFallback && isValidHomepageHotelInfo(centralHome.homepageHotelInfo)
            ? centralHome.homepageHotelInfo
            : needsHotelInfoFallback && isValidHomepageHotelInfo(staticHome?.homepageHotelInfo)
              ? staticHome?.homepageHotelInfo
              : backendHome.homepageHotelInfo,
        homepageRoomHighlights:
          needsRoomHighlightsFallback && isValidHomepageRoomHighlights(centralHome.homepageRoomHighlights)
            ? centralHome.homepageRoomHighlights
            : needsRoomHighlightsFallback && isValidHomepageRoomHighlights(staticHome?.homepageRoomHighlights)
              ? staticHome?.homepageRoomHighlights
              : backendHome.homepageRoomHighlights,
        roomsIntro: needsRoomsIntroFallback && isValidRoomsIntro(centralHome.roomsIntro)
          ? centralHome.roomsIntro
          : backendHome.roomsIntro,
        roomsFeaturedGallery:
          needsRoomsFeaturedGalleryFallback && isValidRoomsFeaturedGallery(centralHome.roomsFeaturedGallery)
            ? centralHome.roomsFeaturedGallery
            : needsRoomsFeaturedGalleryFallback && isValidRoomsFeaturedGallery(staticHome?.roomsFeaturedGallery)
              ? staticHome?.roomsFeaturedGallery
            : backendHome.roomsFeaturedGallery,
        footer: needsFooterFallback && isValidSiteFooter(centralHome.footer)
          ? centralHome.footer
          : backendHome.footer
      };
    } catch {
      // Keep backend home payload; fallback defaults will be sanitized in DTO normalization.
    }

    return {
      ...backendHome,
      homepageAmenities:
        needsAmenitiesFallback && isValidHomepageAmenities(staticHome?.homepageAmenities)
          ? staticHome?.homepageAmenities
          : backendHome.homepageAmenities,
      homepageHotelInfo:
        needsHotelInfoFallback && isValidHomepageHotelInfo(staticHome?.homepageHotelInfo)
          ? staticHome?.homepageHotelInfo
          : backendHome.homepageHotelInfo,
      homepageRoomHighlights:
        needsRoomHighlightsFallback && isValidHomepageRoomHighlights(staticHome?.homepageRoomHighlights)
          ? staticHome?.homepageRoomHighlights
          : backendHome.homepageRoomHighlights,
      roomsFeaturedGallery:
        needsRoomsFeaturedGalleryFallback && isValidRoomsFeaturedGallery(staticHome?.roomsFeaturedGallery)
          ? staticHome?.roomsFeaturedGallery
          : backendHome.roomsFeaturedGallery
    };
  } catch (backendError) {
    if (!centralBaseUrl) {
      throw backendError;
    }

    try {
      const centralHome = await fetchHomeFromBaseUrl(centralBaseUrl, tenant, centralSecret);
      return {
        ...centralHome,
        homepageAmenities:
          isValidHomepageAmenities(centralHome.homepageAmenities)
            ? centralHome.homepageAmenities
            : isValidHomepageAmenities(staticHome?.homepageAmenities)
              ? staticHome?.homepageAmenities
              : centralHome.homepageAmenities,
        homepageHotelInfo:
          isValidHomepageHotelInfo(centralHome.homepageHotelInfo)
            ? centralHome.homepageHotelInfo
            : isValidHomepageHotelInfo(staticHome?.homepageHotelInfo)
              ? staticHome?.homepageHotelInfo
              : centralHome.homepageHotelInfo,
        homepageRoomHighlights:
          isValidHomepageRoomHighlights(centralHome.homepageRoomHighlights)
            ? centralHome.homepageRoomHighlights
            : isValidHomepageRoomHighlights(staticHome?.homepageRoomHighlights)
              ? staticHome?.homepageRoomHighlights
              : centralHome.homepageRoomHighlights,
        roomsFeaturedGallery:
          isValidRoomsFeaturedGallery(centralHome.roomsFeaturedGallery)
            ? centralHome.roomsFeaturedGallery
            : isValidRoomsFeaturedGallery(staticHome?.roomsFeaturedGallery)
              ? staticHome?.roomsFeaturedGallery
              : centralHome.roomsFeaturedGallery
      };
    } catch (centralError) {
      const backendMessage = backendError instanceof Error ? backendError.message : "primary backend unavailable";
      const centralMessage = centralError instanceof Error ? centralError.message : "central fallback unavailable";
      throw new Error(`home failover failed: ${backendMessage}; ${centralMessage}`);
    }
  }
}

export async function fetchBackendRooms(tenant: TenantContext, criteria?: RoomSearchCriteria): Promise<RoomCardDTO[]> {
  const baseUrl = mustBackendBaseUrl();
  const secret = getBackendApiSecret();
  const query = toRoomSearchQueryString(criteria);
  const response = await fetch(`${baseUrl}/site/rooms${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: buildHeaders(tenant, secret),
    cache: "no-store"
  });
  return parseJsonResponse<RoomCardDTO[]>(response);
}

export async function sendBackendLead(
  tenant: TenantContext,
  payload: LeadRequestDTO
): Promise<LeadResponseDTO> {
  const baseUrl = mustBackendBaseUrl();
  const secret = getBackendApiSecret();
  const response = await fetch(`${baseUrl}/site/leads`, {
    method: "POST",
    headers: buildHeaders(tenant, secret),
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  return parseJsonResponse<LeadResponseDTO>(response);
}
