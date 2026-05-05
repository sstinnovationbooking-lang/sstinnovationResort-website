import { NextResponse } from "next/server";

import { sendBackendLead } from "@/lib/api/backend-client";
import { resolveTenantFromRequest } from "@/lib/api/tenant-guard";
import { getContentAdapter } from "@/lib/content/get-adapter";
import { sanitizeLeadPayload, validateLeadPayload } from "@/lib/dto/lead";
import { getContentMode } from "@/lib/env";

interface RouteContext {
  params: Promise<{ tenantSlug: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { tenantSlug } = await context.params;
  const tenant = resolveTenantFromRequest(request, tenantSlug);
  if (!tenant) {
    return NextResponse.json({ error: "tenant not found" }, { status: 404 });
  }

  try {
    const payload = sanitizeLeadPayload(await request.json());
    const errors = validateLeadPayload(payload);
    if (errors.length > 0) {
      return NextResponse.json({ error: "invalid payload", details: errors }, { status: 400 });
    }

    const result =
      getContentMode() === "api"
        ? await sendBackendLead(tenant, payload)
        : await getContentAdapter().submitLead(tenantSlug, payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed to submit lead" },
      { status: 502 }
    );
  }
}
