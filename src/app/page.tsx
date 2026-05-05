import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

import { resolveTenant } from "@/lib/tenant-resolver";

export default async function HomePage() {
  const headerStore = await headers();
  const tenant = resolveTenant({
    rawHost: headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  });
  if (!tenant) notFound();
  redirect(`/site/${tenant.tenantSlug}`);
}
