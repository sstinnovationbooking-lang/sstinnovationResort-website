import type { SiteHomeDTO } from "@/lib/types/site";

export function sanitizeSiteHomeDTO(home: SiteHomeDTO): SiteHomeDTO {
  return {
    ...home,
    tenant: {
      tenantSlug: home.tenant.tenantSlug,
      brand: home.tenant.brand,
      locale: home.tenant.locale
    }
  };
}
