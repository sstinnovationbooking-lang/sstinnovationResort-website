import { NextResponse } from "next/server";

import { getContentAdapter } from "@/lib/content/get-adapter";
import { resolveTenantFromRequest } from "@/lib/api/tenant-guard";

export async function GET(request: Request) {
  const tenant = resolveTenantFromRequest(request);
  if (!tenant) {
    return NextResponse.json({ error: "tenant not found" }, { status: 404 });
  }

  try {
    const adapter = getContentAdapter();
    const data = await adapter.getHome(tenant);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed to load home data" },
      { status: 502 }
    );
  }
}
