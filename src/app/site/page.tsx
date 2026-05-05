import { redirect } from "next/navigation";

import { getDefaultTenantSlug } from "@/lib/env";

export default function SiteIndexPage() {
  redirect(`/site/${getDefaultTenantSlug()}`);
}
