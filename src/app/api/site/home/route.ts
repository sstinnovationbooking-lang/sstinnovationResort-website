import { NextResponse } from "next/server";

import { fetchBackendHome } from "@/lib/api/backend-client";
import { resolveTenantFromRequest, resolveTenantSlugFromRequest } from "@/lib/api/tenant-guard";
import { getContentAdapter } from "@/lib/content/get-adapter";
import { sanitizeSiteHomeDTO } from "@/lib/dto/normalize";
import { getContentMode } from "@/lib/env";
import { getStaticHomeByTenant } from "@/lib/tenants/static-content";

export async function GET(request: Request) {
  const tenantSlug = resolveTenantSlugFromRequest(request);
  const tenant = resolveTenantFromRequest(request);
  const resolvedTenantSlug = tenant?.tenantSlug ?? tenantSlug ?? null;

  if (!tenant) {
    return NextResponse.json({ error: "tenant not found" }, { status: 404 });
  }

  try {
    const data = getContentMode() === "api" ? await fetchBackendHome(tenant) : await getContentAdapter().getSiteHome(tenantSlug);
    return NextResponse.json(sanitizeSiteHomeDTO(data));
  } catch (error) {
    if (getContentMode() === "api" && resolvedTenantSlug) {
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
