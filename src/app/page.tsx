import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { ResortHome } from "@/components/resort-home";
import { getContentAdapter } from "@/lib/content/get-adapter";
import { resolveTenantFromHost } from "@/lib/tenant-resolver";

export default async function HomePage() {
  const headerStore = await headers();
  const tenant = resolveTenantFromHost(headerStore.get("x-forwarded-host") ?? headerStore.get("host"));
  if (!tenant) notFound();

  const adapter = getContentAdapter();
  const [home, rooms] = await Promise.all([adapter.getHome(tenant), adapter.getRooms(tenant)]);

  return <ResortHome home={home} rooms={rooms} />;
}
