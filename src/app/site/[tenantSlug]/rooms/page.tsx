import { createTranslator } from "next-intl";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { ResortRoomsPage } from "@/components/resort-rooms-page";
import { StatusNoticePage } from "@/components/status-notice-page";
import { resolveLocaleFromCookieHeader } from "@/i18n/config";
import { loadMessages } from "@/i18n/messages";
import { getContentAdapter } from "@/lib/content/get-adapter";
import { parseRoomSearchCriteriaFromSearchParams } from "@/lib/search/room-search";
import { classifyStatusFromError, safeDevErrorDetail } from "@/lib/status-notice";
import { resolveTenant } from "@/lib/tenant-resolver";
import type { RoomCardDTO, SiteHomeDTO } from "@/lib/types/site";

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getBasePathFromHeaders(headerStore: Awaited<ReturnType<typeof headers>>): string | undefined {
  const host = String(headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "")
    .split(",")[0]
    .trim();
  if (!host) return undefined;

  const proto = String(headerStore.get("x-forwarded-proto") ?? "https")
    .split(",")[0]
    .trim();
  return `${proto}://${host}`;
}

export default async function TenantRoomsPage({ params, searchParams }: PageProps) {
  const { tenantSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const asUrlSearchParams = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === "string") asUrlSearchParams.set(key, value);
    else if (Array.isArray(value) && value[0]) asUrlSearchParams.set(key, value[0]);
  });

  const roomSearchCriteria = parseRoomSearchCriteriaFromSearchParams(asUrlSearchParams);
  const headerStore = await headers();
  const localeFromCookie = resolveLocaleFromCookieHeader(headerStore.get("cookie"));
  const { locale, messages } = await loadMessages(localeFromCookie);
  const t = createTranslator({ locale, messages, namespace: "TenantPage" });
  const tenant = resolveTenant({
    rawHost: headerStore.get("x-forwarded-host") ?? headerStore.get("host"),
    tenantSlug,
    enforceHostTenant: true
  });

  if (!tenant) notFound();

  let homeData: SiteHomeDTO | null = null;
  let roomsData: RoomCardDTO[] = [];
  let fallbackError: unknown = null;

  try {
    const adapter = getContentAdapter({ basePath: getBasePathFromHeaders(headerStore) });
    const [home, rooms] = await Promise.all([
      adapter.getSiteHome(tenantSlug),
      adapter.getRooms(tenantSlug, roomSearchCriteria)
    ]);
    homeData = home;
    roomsData = rooms;
  } catch (error) {
    fallbackError = error;
  }

  if (!homeData) {
    const status = classifyStatusFromError(fallbackError ?? t("serviceUnavailable"));
    const detail = safeDevErrorDetail(fallbackError);
    return (
      <StatusNoticePage
        detail={detail}
        status={status}
        tenantBrand={tenant.brand}
        tenantSlug={tenant.tenantSlug}
      />
    );
  }

  return <ResortRoomsPage home={homeData} navbar={homeData.ui?.navbar} rooms={roomsData} />;
}
