import { NextResponse } from "next/server";

import { getContentAdapter } from "@/lib/content/get-adapter";
import { resolveTenantFromRequest } from "@/lib/api/tenant-guard";
import type { LeadRequestDTO } from "@/types/site";

function sanitizeLeadInput(input: unknown): LeadRequestDTO {
  if (!input || typeof input !== "object") throw new Error("invalid payload");
  const body = input as Record<string, unknown>;

  return {
    name: String(body.name ?? "").trim(),
    email: String(body.email ?? "").trim() || undefined,
    phone: String(body.phone ?? "").trim() || undefined,
    checkIn: String(body.checkIn ?? "").trim() || undefined,
    checkOut: String(body.checkOut ?? "").trim() || undefined,
    guests: Number(body.guests ?? 0) || undefined,
    message: String(body.message ?? "").trim() || undefined
  };
}

export async function POST(request: Request) {
  const tenant = resolveTenantFromRequest(request);
  if (!tenant) {
    return NextResponse.json({ error: "tenant not found" }, { status: 404 });
  }

  try {
    const payload = sanitizeLeadInput(await request.json());
    if (!payload.name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!payload.email && !payload.phone) {
      return NextResponse.json({ error: "email or phone is required" }, { status: 400 });
    }

    const adapter = getContentAdapter();
    const result = await adapter.submitLead(tenant, payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed to submit lead" },
      { status: 502 }
    );
  }
}
