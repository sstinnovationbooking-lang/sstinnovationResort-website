import type { ContentMode } from "@/types/site";

const DEFAULT_MODE: ContentMode = "static";

export function getContentMode(): ContentMode {
  const raw = String(process.env.CONTENT_MODE ?? DEFAULT_MODE).toLowerCase();
  return raw === "api" ? "api" : "static";
}

export function getDefaultTenantSlug(): string {
  return String(process.env.DEFAULT_TENANT ?? "forest-escape").trim().toLowerCase();
}

export function getBaseDomain(): string {
  return String(process.env.BASE_DOMAIN ?? "resort.local").trim().toLowerCase();
}

export function getTenantFallbackPolicy(): "default" | "404" {
  const raw = String(process.env.TENANT_FALLBACK_POLICY ?? "default").toLowerCase();
  return raw === "404" ? "404" : "default";
}

export function getBackendApiBaseUrl(): string {
  return String(process.env.BACKEND_API_BASE_URL ?? "").trim();
}

export function getBackendApiSecret(): string {
  return String(process.env.BACKEND_API_SECRET ?? "").trim();
}
