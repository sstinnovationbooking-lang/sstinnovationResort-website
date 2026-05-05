import { getBaseDomain, getDefaultTenantSlug, getTenantFallbackPolicy } from "@/lib/env";
import { getTenantBySlug, isKnownTenantSlug } from "@/lib/tenants/registry";
import type { TenantContext } from "@/types/site";

function normalizeHost(rawHost: string | null | undefined): string {
  return String(rawHost ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];
}

function inferTenantSlugFromHost(host: string): string | null {
  if (!host) return null;

  if (host === "localhost" || host === "127.0.0.1") {
    return getDefaultTenantSlug();
  }

  const baseDomain = getBaseDomain();
  if (host === baseDomain) return null;

  if (host.endsWith(`.${baseDomain}`)) {
    return host.slice(0, -(baseDomain.length + 1));
  }

  const segments = host.split(".");
  if (segments.length >= 3) {
    return segments[0] ?? null;
  }

  return null;
}

export function resolveTenantFromHost(rawHost: string | null | undefined): TenantContext | null {
  const host = normalizeHost(rawHost);
  const tenantSlug = inferTenantSlugFromHost(host);
  if (tenantSlug && isKnownTenantSlug(tenantSlug)) {
    return getTenantBySlug(tenantSlug);
  }

  if (getTenantFallbackPolicy() === "default") {
    return getTenantBySlug(getDefaultTenantSlug());
  }

  return null;
}
