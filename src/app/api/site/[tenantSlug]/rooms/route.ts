import { NextResponse } from "next/server";

import { fetchBackendRooms } from "@/lib/api/backend-client";
import { resolveTenantFromRequest } from "@/lib/api/tenant-guard";
import { getContentAdapter } from "@/lib/content/get-adapter";
import { getContentMode } from "@/lib/env";
import { parseRoomSearchCriteriaFromSearchParams } from "@/lib/search/room-search";

interface RouteContext {
  params: Promise<{ tenantSlug: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { tenantSlug } = await context.params;
  const tenant = resolveTenantFromRequest(request, tenantSlug);
  const criteria = parseRoomSearchCriteriaFromSearchParams(new URL(request.url).searchParams);
  if (!tenant) {
    return NextResponse.json({ error: "tenant not found" }, { status: 404 });
  }

  try {
    const data =
      getContentMode() === "api"
        ? await fetchBackendRooms(tenant, criteria)
        : await getContentAdapter().getRooms(tenantSlug, criteria);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed to load rooms" },
      { status: 502 }
    );
  }
}
