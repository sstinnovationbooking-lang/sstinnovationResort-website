import { NextResponse } from "next/server";

import { fetchBackendRooms } from "@/lib/api/backend-client";
import { resolveTenantFromRequest, resolveTenantSlugFromRequest } from "@/lib/api/tenant-guard";
import { getContentAdapter } from "@/lib/content/get-adapter";
import { getContentMode } from "@/lib/env";
import { parseRoomSearchCriteriaFromSearchParams } from "@/lib/search/room-search";

export async function GET(request: Request) {
  const tenantSlug = resolveTenantSlugFromRequest(request);
  const tenant = resolveTenantFromRequest(request);
  const criteria = parseRoomSearchCriteriaFromSearchParams(new URL(request.url).searchParams);

  if (!tenant) {
    return NextResponse.json({ error: "tenant not found" }, { status: 404 });
  }

  try {
    const data =
      getContentMode() === "api"
        ? await fetchBackendRooms(tenant, criteria)
        : await getContentAdapter().getRooms(tenantSlug, criteria);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed to load rooms" },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
        }
      }
    );
  }
}
