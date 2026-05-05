import { resolveTenant } from "@/lib/tenant-resolver";
import type { TenantContext } from "@/lib/types/site";

function normalizeTenantSlug(value: string | null | undefined): string | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized || null;
}

function inferTenantSlugFromSitePath(rawPath: string | null | undefined): string | null {
  const pathname = String(rawPath ?? "").trim();
  if (!pathname) return null;

  const match = pathname.match(/\/site\/([^/?#]+)/i);
  return normalizeTenantSlug(match?.[1]);
}

function extractTenantSlugFromReferer(referer: string | null): string | null {
  if (!referer) return null;

  try {
    const url = new URL(referer);
    return inferTenantSlugFromSitePath(url.pathname);
  } catch {
    return null;
  }
}

export function resolveTenantSlugFromRequest(request: Request, pathTenantSlug?: string | null): string | null {
  if (pathTenantSlug) {
    return normalizeTenantSlug(pathTenantSlug);
  }

  const requestUrl = new URL(request.url);
  const queryTenantSlug = normalizeTenantSlug(requestUrl.searchParams.get("tenantSlug"));
  if (queryTenantSlug) {
    return queryTenantSlug;
  }

  const headerTenantSlug = normalizeTenantSlug(request.headers.get("x-tenant-slug"));
  if (headerTenantSlug) {
    return headerTenantSlug;
  }

  const sitePathHeaderSlug = inferTenantSlugFromSitePath(request.headers.get("x-site-path"));
  if (sitePathHeaderSlug) {
    return sitePathHeaderSlug;
  }

  return extractTenantSlugFromReferer(request.headers.get("referer"));
}

export function resolveTenantFromRequest(request: Request, pathTenantSlug?: string | null): TenantContext | null {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host");
  const tenantSlug = resolveTenantSlugFromRequest(request, pathTenantSlug);

  return resolveTenant({
    rawHost: forwardedHost ?? host,
    tenantSlug,
    enforceHostTenant: true
  });
}
