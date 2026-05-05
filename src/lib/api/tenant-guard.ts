import { resolveTenantFromHost } from "@/lib/tenant-resolver";
import type { TenantContext } from "@/types/site";

export function resolveTenantFromRequest(request: Request): TenantContext | null {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host");
  return resolveTenantFromHost(forwardedHost ?? host);
}
