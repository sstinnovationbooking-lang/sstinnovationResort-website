import { NextResponse } from "next/server";

import { fetchBackendHome } from "@/lib/api/backend-client";
import { resolveTenantFromRequest } from "@/lib/api/tenant-guard";
import { getContentAdapter } from "@/lib/content/get-adapter";
import { sanitizeSiteHomeDTO } from "@/lib/dto/normalize";
import { getContentMode } from "@/lib/env";
import { getStaticHomeByTenant } from "@/lib/tenants/static-content";

interface RouteContext {
  params: Promise<{ tenantSlug: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { tenantSlug } = await context.params;
  const tenant = resolveTenantFromRequest(request, tenantSlug);
  const resolvedTenantSlug = tenant?.tenantSlug ?? tenantSlug;
  if (!tenant) {
    return NextResponse.json({ error: "tenant not found" }, { status: 404 });
  }

  try {
    const data =
      getContentMode() === "api"
        ? await fetchBackendHome(tenant)
        : await getContentAdapter().getSiteHome(tenantSlug);
    return NextResponse.json(sanitizeSiteHomeDTO(data));
  } catch (error) {
    if (getContentMode() === "api") {
      const staticHome = getStaticHomeByTenant(resolvedTenantSlug);
      if (staticHome) {
        return NextResponse.json(sanitizeSiteHomeDTO(staticHome), {
          headers: { "x-fallback-source": "static-home" }
        });
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed to load home data" },
      { status: 502 }
    );
  }
}
