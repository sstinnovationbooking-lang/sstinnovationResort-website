import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { ResortHome } from "@/components/resort-home";
import { getContentAdapter } from "@/lib/content/get-adapter";
import { resolveTenant } from "@/lib/tenant-resolver";
import { listTenantSlugs } from "@/lib/tenants/registry";
import type { RoomCardDTO, SiteHomeDTO } from "@/lib/types/site";

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

function isDemoTenantSlug(tenantSlug: string): boolean {
  return tenantSlug.startsWith("demo-") || tenantSlug.includes("demo");
}

function getBasePathFromHeaders(headerStore: Awaited<ReturnType<typeof headers>>): string | undefined {
  const host = String(headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "")
    .split(",")[0]
    .trim();
  if (!host) return undefined;

  const proto = String(headerStore.get("x-forwarded-proto") ?? "https")
    .split(",")[0]
    .trim();
  return `${proto}://${host}`;
}

function inferMetadataBase(rawHost: string | null): URL | undefined {
  const host = String(rawHost ?? "").trim();
  if (!host) return undefined;
  return new URL(`https://${host}`);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenantSlug } = await params;
  const isDemoTenant = isDemoTenantSlug(tenantSlug);
  const headerStore = await headers();
  const rawHost = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const tenant = resolveTenant({ rawHost, tenantSlug, enforceHostTenant: true });

  if (!tenant) {
    return {
      title: "Tenant not found",
      description: "Tenant does not exist for this route.",
      robots: { index: false, follow: false }
    };
  }

  try {
    const adapter = getContentAdapter({ basePath: getBasePathFromHeaders(headerStore) });
    const home = await adapter.getSiteHome(tenantSlug);
    const title = `${home.tenant.brand} | Resort Booking`;
    const description = home.hero.subtitle;
    const canonicalPath = `/site/${home.tenant.tenantSlug}`;
    const metadataBase = inferMetadataBase(rawHost);

    return {
      title,
      description,
      metadataBase,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title,
        description,
        url: canonicalPath,
        type: "website",
        images: [{ url: home.hero.heroImageUrl }]
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [home.hero.heroImageUrl]
      },
      robots: { index: !isDemoTenant, follow: !isDemoTenant }
    };
  } catch {
    return {
      title: `${tenant.brand} | Resort Booking`,
      description: `Explore ${tenant.brand} resort information and booking.`,
      robots: { index: !isDemoTenant, follow: !isDemoTenant }
    };
  }
}

export function generateStaticParams() {
  return listTenantSlugs().map((tenantSlug) => ({ tenantSlug }));
}

export default async function TenantPage({ params }: PageProps) {
  const { tenantSlug } = await params;
  const headerStore = await headers();
  const tenant = resolveTenant({
    rawHost: headerStore.get("x-forwarded-host") ?? headerStore.get("host"),
    tenantSlug,
    enforceHostTenant: true
  });

  if (!tenant) notFound();

  let homeData: SiteHomeDTO | null = null;
  let roomsData: RoomCardDTO[] = [];
  let fallbackMessage: string | null = null;

  try {
    const adapter = getContentAdapter({ basePath: getBasePathFromHeaders(headerStore) });
    const [home, rooms] = await Promise.all([adapter.getSiteHome(tenantSlug), adapter.getRooms(tenantSlug)]);
    homeData = home;
    roomsData = rooms;
  } catch (error) {
    fallbackMessage =
      error instanceof Error ? error.message : "Service is temporarily unavailable. Please try again soon.";
  }

  if (!homeData) {
    return (
      <main className="shell section page-error" role="alert">
        <h1>{tenant.brand}</h1>
        <p>{fallbackMessage ?? "Service is temporarily unavailable. Please try again soon."}</p>
      </main>
    );
  }

  return <ResortHome home={homeData} rooms={roomsData} />;
}
