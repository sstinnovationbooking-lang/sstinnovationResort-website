import type { LocaleCode, TenantContext } from "@/types/site";

interface TenantRegistryItem {
  tenantSlug: string;
  tenantId: string;
  brand: string;
  locale: LocaleCode;
}

const TENANTS: TenantRegistryItem[] = [
  {
    tenantSlug: "forest-escape",
    tenantId: "tenant_forest_escape",
    brand: "Forest Escape Resort",
    locale: "th"
  },
  {
    tenantSlug: "lake-serenity",
    tenantId: "tenant_lake_serenity",
    brand: "Lake Serenity Resort",
    locale: "th"
  }
];

export function getTenantBySlug(tenantSlug: string): TenantContext | null {
  const found = TENANTS.find((item) => item.tenantSlug === tenantSlug);
  if (!found) return null;
  return {
    tenantSlug: found.tenantSlug,
    tenantId: found.tenantId,
    brand: found.brand,
    locale: found.locale
  };
}

export function isKnownTenantSlug(tenantSlug: string): boolean {
  return TENANTS.some((item) => item.tenantSlug === tenantSlug);
}
