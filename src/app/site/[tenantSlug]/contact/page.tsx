import { createTranslator } from "next-intl";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { ResortContactPage } from "@/components/resort-contact-page";
import { StatusNoticePage } from "@/components/status-notice-page";
import { resolveLocaleFromCookieHeader } from "@/i18n/config";
import { loadMessages } from "@/i18n/messages";
import { getContentAdapter } from "@/lib/content/get-adapter";
import { classifyStatusFromError, safeDevErrorDetail } from "@/lib/status-notice";
import { resolveTenant } from "@/lib/tenant-resolver";
import type { SiteHomeDTO } from "@/lib/types/site";

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
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

export default async function TenantContactPage({ params }: PageProps) {
  const { tenantSlug } = await params;
  const headerStore = await headers();
  const localeFromCookie = resolveLocaleFromCookieHeader(headerStore.get("cookie"));
  const { locale, messages } = await loadMessages(localeFromCookie);
  const t = createTranslator({ locale, messages, namespace: "TenantPage" });
  const tenant = resolveTenant({
    rawHost: headerStore.get("x-forwarded-host") ?? headerStore.get("host"),
    tenantSlug,
    enforceHostTenant: true
  });

  if (!tenant) notFound();

  let homeData: SiteHomeDTO | null = null;
  let fallbackError: unknown = null;

  try {
    const adapter = getContentAdapter({ basePath: getBasePathFromHeaders(headerStore) });
    homeData = await adapter.getSiteHome(tenantSlug);
  } catch (error) {
    fallbackError = error;
  }

  if (!homeData) {
    const status = classifyStatusFromError(fallbackError ?? t("serviceUnavailable"));
    const detail = safeDevErrorDetail(fallbackError);
    return (
      <StatusNoticePage
        detail={detail}
        status={status}
        tenantBrand={tenant.brand}
        tenantSlug={tenant.tenantSlug}
      />
    );
  }

  return <ResortContactPage home={homeData} navbar={homeData.ui?.navbar} />;
}
