import type { TenantContext, TenantProfileDTO } from "@/lib/types/site";

interface TenantRegistryItem extends TenantContext {
  hosts?: string[];
}

const TENANTS: TenantRegistryItem[] = [
  {
    tenantSlug: "forest-escape",
    brand: "Forest Escape Resort",
    locale: "th",
    hosts: ["forest-escape.resort.local", "forestescape.example.com"]
  },
  {
    tenantSlug: "lake-serenity",
    brand: "Lake Serenity Resort",
    locale: "th",
    hosts: ["lake-serenity.resort.local", "lakeserenity.example.com"]
  },
  {
    tenantSlug: "demo-resort",
    brand: "Demo Resort",
    locale: "en",
    hosts: ["demo-resort.resort.local"]
  }
];

export function toTenantDTO(tenant: TenantContext): TenantProfileDTO {
  return {
    tenantSlug: tenant.tenantSlug,
    brand: tenant.brand,
    locale: tenant.locale
  };
}

export function getTenantBySlug(tenantSlug: string): TenantContext | null {
  const normalized = tenantSlug.trim().toLowerCase();
  const found = TENANTS.find((item) => item.tenantSlug === normalized);
  return found ?? null;
}

export function isKnownTenantSlug(tenantSlug: string): boolean {
  const normalized = tenantSlug.trim().toLowerCase();
  return TENANTS.some((item) => item.tenantSlug === normalized);
}

export function listTenantSlugs(): string[] {
  return TENANTS.map((item) => item.tenantSlug);
}

export function getTenantByExactHost(host: string): TenantContext | null {
  const normalized = host.trim().toLowerCase();
  if (!normalized) return null;
  const found = TENANTS.find((tenant) => tenant.hosts?.includes(normalized));
  return found ?? null;
}
