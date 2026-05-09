import { getBaseDomain, getDefaultTenantSlug, getTenantFallbackPolicy } from "@/lib/env";
import {
  getTenantByExactHost,
  getTenantBySlug,
  isKnownTenantSlug
} from "@/lib/tenants/registry";
import type { TenantContext } from "@/lib/types/site";

interface ResolveTenantInput {
  rawHost?: string | null;
  tenantSlug?: string | null;
  enforceHostTenant?: boolean;
}

function normalizeHost(rawHost: string | null | undefined): string {
  return String(rawHost ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];
}

function normalizeTenantSlug(rawTenantSlug: string | null | undefined): string | null {
  const normalized = String(rawTenantSlug ?? "").trim().toLowerCase();
  return normalized || null;
}

function inferTenantSlugFromHost(host: string): string | null {
  if (!host) return null;

  const directHostMatch = getTenantByExactHost(host);
  if (directHostMatch) {
    return directHostMatch.tenantSlug;
  }

  if (host === "localhost" || host === "127.0.0.1") {
    return null;
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

export function resolveTenant(input: ResolveTenantInput): TenantContext | null {
  const host = normalizeHost(input.rawHost);
  const hostTenantSlug = inferTenantSlugFromHost(host);
  const requestedSlug = normalizeTenantSlug(input.tenantSlug);

  if (requestedSlug) {
    if (!isKnownTenantSlug(requestedSlug)) return null;

    if (
      input.enforceHostTenant &&
      hostTenantSlug &&
      isKnownTenantSlug(hostTenantSlug) &&
      requestedSlug !== hostTenantSlug
    ) {
      return null;
    }

    return getTenantBySlug(requestedSlug);
  }

  if (hostTenantSlug && isKnownTenantSlug(hostTenantSlug)) {
    return getTenantBySlug(hostTenantSlug);
  }

  return getTenantBySlug(getDefaultTenantSlug());
}
