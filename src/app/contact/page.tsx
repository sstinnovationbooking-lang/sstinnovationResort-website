import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { resolveTenant } from "@/lib/tenant-resolver";

function extractTenantSlugFromReferer(referer: string | null): string | null {
  const raw = String(referer ?? "").trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    const match = url.pathname.match(/\/site\/([^/?#]+)/i);
    const slug = String(match?.[1] ?? "").trim().toLowerCase();
    return slug || null;
  } catch {
    return null;
  }
}

export default async function ContactIndexPage() {
  const headerStore = await headers();
  const tenantSlugFromReferer = extractTenantSlugFromReferer(headerStore.get("referer"));
  const tenant = resolveTenant({
    rawHost: headerStore.get("x-forwarded-host") ?? headerStore.get("host"),
    tenantSlug: tenantSlugFromReferer,
    enforceHostTenant: true
  });

  if (!tenant) notFound();
  redirect(`/site/${tenant.tenantSlug}/contact`);
}
